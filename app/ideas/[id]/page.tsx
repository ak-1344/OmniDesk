"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  GripVertical,
  Trash2,
  ArrowRight,
  Save,
  StickyNote,
  X,
  Move,
  Palette,
  PenTool,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { NoteContent, TaskState } from "@/types"

// Dynamically import tldraw to avoid SSR issues
const Tldraw = dynamic(() => import('@tldraw/tldraw').then(mod => mod.Tldraw), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/20">
      <p className="text-sm text-muted-foreground">Loading canvas...</p>
    </div>
  ),
})

// Card color options
const CARD_COLORS = [
  { name: 'Yellow', value: '#fef3c7', border: '#f59e0b' },
  { name: 'Pink', value: '#fce7f3', border: '#ec4899' },
  { name: 'Blue', value: '#dbeafe', border: '#3b82f6' },
  { name: 'Green', value: '#dcfce7', border: '#22c55e' },
  { name: 'Purple', value: '#f3e8ff', border: '#a855f7' },
  { name: 'Orange', value: '#ffedd5', border: '#f97316' },
  { name: 'White', value: '#ffffff', border: '#e5e7eb' },
]

interface CanvasCard {
  id: string
  x: number
  y: number
  width: number
  height: number
  color: string
  borderColor: string
  heading: string
  note: NoteContent
}

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state, updateIdea, deleteIdea, addTask } = useApp()
  const canvasRef = useRef<HTMLDivElement>(null)

  const ideaId = params?.id as string
  const idea = ideaId ? state.ideas.find(i => i.id === ideaId) : null

  const [title, setTitle] = useState("")
  const [mainContent, setMainContent] = useState("")
  const [cards, setCards] = useState<CanvasCard[]>([])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [newTaskDomain, setNewTaskDomain] = useState("")
  const [canvasMode, setCanvasMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 })

  useEffect(() => {
    if (idea) {
      setTitle(idea.title || "")
      setCanvasMode(idea.canvasEnabled || false)
      // Main content is the first text note or empty
      const mainNote = idea.notes.find(n => n.type === 'text' && n.order === 0)
      setMainContent(mainNote?.content || "")

      // Other notes become cards with enhanced properties
      const noteCards = idea.notes
        .filter(n => n.order > 0)
        .map((note, index) => {
          // Parse heading and color from note content if stored
          const parts = note.content.split('\n')
          const hasHeading = parts.length > 1
          return {
            id: note.id,
            x: (note as any).x ?? (50 + (index % 3) * 320),
            y: (note as any).y ?? (50 + Math.floor(index / 3) * 200),
            width: (note as any).width ?? 300,
            height: (note as any).height ?? 180,
            color: (note as any).color ?? CARD_COLORS[0].value,
            borderColor: (note as any).borderColor ?? CARD_COLORS[0].border,
            heading: (note as any).heading ?? '',
            note,
          }
        })
      setCards(noteCards)
    }
  }, [idea])

  const handleSave = useCallback(async () => {
    if (!idea) return

    const notes: NoteContent[] = [
      {
        id: 'main',
        type: 'text',
        content: mainContent,
        createdAt: new Date().toISOString(),
        order: 0,
      },
      ...cards.map((card, index) => ({
        ...card.note,
        order: index + 1,
        // Store card position and style in note
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        color: card.color,
        borderColor: card.borderColor,
        heading: card.heading,
      } as NoteContent & { x: number; y: number; width: number; height: number; color: string; borderColor: string; heading: string }))
    ]

    await updateIdea(idea.id, { title, notes, canvasEnabled: canvasMode })
  }, [idea, title, mainContent, cards, canvasMode, updateIdea])

  const handleAddCard = () => {
    const newCard: CanvasCard = {
      id: Date.now().toString(),
      x: 100 + Math.random() * 200 - pan.x,
      y: 100 + Math.random() * 100 - pan.y,
      width: 300,
      height: 180,
      color: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)].value,
      borderColor: CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)].border,
      heading: '',
      note: {
        id: Date.now().toString(),
        type: 'text',
        content: '',
        createdAt: new Date().toISOString(),
        order: cards.length + 1,
      }
    }
    setCards([...cards, newCard])
    setSelectedCardId(newCard.id)
  }

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter(c => c.id !== cardId))
    setSelectedCardId(null)
  }

  const handleCardMouseDown = (e: React.MouseEvent, cardId: string) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'INPUT') return
    e.stopPropagation()
    setSelectedCardId(cardId)
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleCardMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedCardId) {
      const dx = (e.clientX - dragStart.x) / zoom
      const dy = (e.clientY - dragStart.y) / zoom

      setCards(cards.map(card =>
        card.id === selectedCardId
          ? { ...card, x: card.x + dx, y: card.y + dy }
          : card
      ))
      setDragStart({ x: e.clientX, y: e.clientY })
    }

    if (isResizing && selectedCardId) {
      const dx = (e.clientX - resizeStart.x) / zoom
      const dy = (e.clientY - resizeStart.y) / zoom

      setCards(cards.map(card =>
        card.id === selectedCardId
          ? {
            ...card,
            width: Math.max(200, resizeStart.width + dx),
            height: Math.max(120, resizeStart.height + dy)
          }
          : card
      ))
    }

    if (isPanning) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      setPan({ x: panStart.panX + dx, y: panStart.panY + dy })
    }
  }

  const handleCardMouseUp = () => {
    if (isDragging || isResizing) {
      handleSave()
    }
    setIsDragging(false)
    setIsResizing(false)
    setIsPanning(false)
  }

  const handleResizeStart = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation()
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    setSelectedCardId(cardId)
    setIsResizing(true)
    setResizeStart({ width: card.width, height: card.height, x: e.clientX, y: e.clientY })
  }

  const handleUpdateCardContent = (cardId: string, content: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? { ...card, note: { ...card.note, content } }
        : card
    ))
  }

  const handleUpdateCardHeading = (cardId: string, heading: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? { ...card, heading }
        : card
    ))
  }

  const handleUpdateCardColor = (cardId: string, color: string, borderColor: string) => {
    setCards(cards.map(card =>
      card.id === cardId
        ? { ...card, color, borderColor }
        : card
    ))
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking on the canvas background (not on cards)
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y })
      setSelectedCardId(null)
    }
  }

  const handleConvertToTask = async () => {
    if (!idea || !newTaskDomain) return

    await addTask({
      title: idea.title,
      description: mainContent,
      domainId: newTaskDomain,
      state: 'gotta-start' as TaskState,
      ideaId: idea.id,
    })

    await updateIdea(idea.id, {
      convertedToTasks: [...(idea.convertedToTasks || []), Date.now().toString()]
    })

    setConvertDialogOpen(false)
    router.push('/tasks')
  }

  const handleDelete = async () => {
    if (!idea) return
    if (confirm('Move this idea to trash?')) {
      await deleteIdea(idea.id)
      router.push('/ideas')
    }
  }

  const handleCanvasSave = useCallback(async (editor: any) => {
    if (!idea) return
    try {
      const snapshot = editor.store.getSnapshot()
      await updateIdea(idea.id, { canvasData: snapshot })
    } catch (error) {
      console.error('Failed to save canvas:', error)
    }
  }, [idea, updateIdea])

  if (!idea) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-muted-foreground">Idea not found</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/50 flex-shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="Idea title..."
            className="text-xl font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0 max-w-md"
          />
          {idea.convertedToTasks && idea.convertedToTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">{idea.convertedToTasks.length} tasks created</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 mr-2">
            <Button
              variant={!canvasMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCanvasMode(false)}
              className="h-7 px-3 gap-1"
            >
              <StickyNote className="size-3" />
              Notes
            </Button>
            <Button
              variant={canvasMode ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setCanvasMode(true)}
              className="h-7 px-3 gap-1"
            >
              <PenTool className="size-3" />
              Canvas
            </Button>
          </div>

          {!canvasMode && (
            <>
              <Button variant="outline" size="sm" onClick={handleAddCard} className="gap-1">
                <StickyNote className="size-3" />
                Add Note
              </Button>
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border rounded-lg px-1">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                  <ZoomOut className="size-3" />
                </Button>
                <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                  <ZoomIn className="size-3" />
                </Button>
              </div>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setConvertDialogOpen(true)} className="gap-1">
            <ArrowRight className="size-3" />
            Convert to Task
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-1">
            <Save className="size-3" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive gap-1">
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {canvasMode ? (
          /* Full tldraw Canvas Mode */
          <div className="flex-1 relative">
            <Tldraw
              onMount={(editor) => {
                console.log('Canvas mounted for idea:', ideaId)

                // Load initial data if provided
                if (idea.canvasData && typeof idea.canvasData === 'object') {
                  try {
                    editor.store.loadSnapshot(idea.canvasData)
                  } catch (error) {
                    console.warn('Could not load canvas data:', error)
                  }
                }

                // Setup auto-save
                let saveTimeout: NodeJS.Timeout
                const unsubscribe = editor.store.listen(() => {
                  clearTimeout(saveTimeout)
                  saveTimeout = setTimeout(() => {
                    handleCanvasSave(editor)
                  }, 2000)
                })

                return () => {
                  clearTimeout(saveTimeout)
                  unsubscribe()
                }
              }}
            />
          </div>
        ) : (
          /* Note Cards Mode with Infinite Canvas */
          <>
            {/* Main content sidebar */}
            <div className="w-80 border-r border-border/50 p-4 overflow-y-auto bg-muted/10 flex-shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Main Context</h3>
              <Textarea
                value={mainContent}
                onChange={(e) => setMainContent(e.target.value)}
                onBlur={handleSave}
                placeholder="Write the main idea and context here..."
                className="min-h-[300px] resize-none border-border/50"
              />
            </div>

            {/* Infinite Canvas for Note Cards */}
            <div
              ref={canvasRef}
              className={cn(
                "flex-1 relative overflow-hidden cursor-grab",
                "bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]",
                isPanning && "cursor-grabbing"
              )}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCardMouseMove}
              onMouseUp={handleCardMouseUp}
              onMouseLeave={handleCardMouseUp}
            >
              {/* Zoom info */}
              <div className="absolute top-3 left-3 z-10 text-[10px] text-muted-foreground bg-background/80 px-2 py-1 rounded">
                Drag to pan • Zoom: {Math.round(zoom * 100)}%
              </div>

              {/* Canvas content with transform */}
              <div
                className="canvas-bg absolute inset-0"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                }}
              >
                {cards.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <StickyNote className="size-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Click "Add Note" to create note cards</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Or switch to Canvas mode for drawing</p>
                    </div>
                  </div>
                )}

                {cards.map((card) => (
                  <div
                    key={card.id}
                    className={cn(
                      "absolute rounded-lg shadow-lg transition-shadow cursor-pointer",
                      selectedCardId === card.id ? "ring-2 ring-primary shadow-xl z-50" : "z-10",
                      isDragging && selectedCardId === card.id ? "cursor-grabbing" : "cursor-grab"
                    )}
                    style={{
                      left: card.x,
                      top: card.y,
                      width: card.width,
                      height: card.height,
                      backgroundColor: card.color,
                      borderWidth: 2,
                      borderColor: card.borderColor,
                    }}
                    onMouseDown={(e) => handleCardMouseDown(e, card.id)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: card.borderColor + '40' }}>
                      <div className="flex items-center gap-2 flex-1">
                        <Move className="size-3 text-muted-foreground cursor-grab" />
                        <Input
                          value={card.heading}
                          onChange={(e) => handleUpdateCardHeading(card.id, e.target.value)}
                          onBlur={handleSave}
                          placeholder="Note heading..."
                          className="h-6 text-sm font-medium bg-transparent border-none p-0 focus-visible:ring-0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Color picker */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                              <Palette className="size-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="end">
                            <div className="grid grid-cols-4 gap-1">
                              {CARD_COLORS.map((c) => (
                                <button
                                  key={c.name}
                                  className={cn(
                                    "size-6 rounded border-2 transition-transform hover:scale-110",
                                    card.color === c.value && "ring-2 ring-primary"
                                  )}
                                  style={{ backgroundColor: c.value, borderColor: c.border }}
                                  onClick={() => {
                                    handleUpdateCardColor(card.id, c.value, c.border)
                                    handleSave()
                                  }}
                                  title={c.name}
                                />
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Card content */}
                    <Textarea
                      value={card.note.content}
                      onChange={(e) => handleUpdateCardContent(card.id, e.target.value)}
                      onBlur={handleSave}
                      placeholder="Write note content..."
                      className="border-none rounded-none resize-none h-[calc(100%-44px)] text-sm focus-visible:ring-0 bg-transparent"
                      style={{ backgroundColor: 'transparent' }}
                    />

                    {/* Resize handle */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                      onMouseDown={(e) => handleResizeStart(e, card.id)}
                    >
                      <svg className="size-3 text-muted-foreground/50 absolute bottom-1 right-1" viewBox="0 0 10 10">
                        <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Convert to Task Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convert to Task</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Create a task from this idea. The idea will be marked as converted but will remain accessible.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Select value={newTaskDomain} onValueChange={setNewTaskDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {state.domains.map(domain => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center gap-2">
                        <div className="size-3 rounded-full" style={{ backgroundColor: domain.color }} />
                        {domain.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConvertToTask} disabled={!newTaskDomain}>
              <ArrowRight className="size-3 mr-1" />
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
