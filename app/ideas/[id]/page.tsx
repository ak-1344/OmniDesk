"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Trash2,
  ArrowRight,
  Save,
  StickyNote,
  X,
  Move,
  Palette,
  ZoomIn,
  ZoomOut,
  Pencil,
  Eraser,
  Circle,
  Square,
  Minus,
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

// Drawing tool colors
const DRAW_COLORS = ['#1e293b', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

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

type DrawTool = 'pen' | 'eraser' | 'line'

export default function IdeaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state, updateIdea, deleteIdea, addTask } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 })

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawTool, setDrawTool] = useState<DrawTool>('pen')
  const [drawColor, setDrawColor] = useState('#1e293b')
  const [drawSize, setDrawSize] = useState(2)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Set canvas size
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    // Load saved drawing data
    if (idea?.canvasData && typeof idea.canvasData === 'string') {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0)
        img.src = idea.canvasData
      }
    }
  }, [idea])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      // Save current drawing
      const imageData = canvas.toDataURL()

      // Resize canvas
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      // Restore drawing
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0)
        img.src = imageData
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (idea) {
      setTitle(idea.title || "")
      const mainNote = idea.notes.find(n => n.type === 'text' && n.order === 0)
      setMainContent(mainNote?.content || "")

      const noteCards = idea.notes
        .filter(n => n.order > 0)
        .map((note, index) => ({
          id: note.id,
          x: (note as any).x ?? (50 + (index % 3) * 320),
          y: (note as any).y ?? (50 + Math.floor(index / 3) * 200),
          width: (note as any).width ?? 300,
          height: (note as any).height ?? 180,
          color: (note as any).color ?? CARD_COLORS[0].value,
          borderColor: (note as any).borderColor ?? CARD_COLORS[0].border,
          heading: (note as any).heading ?? '',
          note,
        }))
      setCards(noteCards)
    }
  }, [idea])

  const saveCanvasData = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !idea) return
    const dataUrl = canvas.toDataURL('image/png')
    await updateIdea(idea.id, { canvasData: dataUrl })
  }, [idea, updateIdea])

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
        x: card.x,
        y: card.y,
        width: card.width,
        height: card.height,
        color: card.color,
        borderColor: card.borderColor,
        heading: card.heading,
      } as any))
    ]

    await updateIdea(idea.id, { title, notes })
    await saveCanvasData()
  }, [idea, title, mainContent, cards, updateIdea, saveCanvasData])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedCardId) return // Don't draw if a card is selected
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    setIsDrawing(true)
    setLastPoint({ x, y })

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / zoom
    const y = (e.clientY - rect.top) / zoom

    ctx.strokeStyle = drawTool === 'eraser' ? '#ffffff' : drawColor
    ctx.lineWidth = drawTool === 'eraser' ? drawSize * 5 : drawSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.lineTo(x, y)
    ctx.stroke()

    setLastPoint({ x, y })
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      setLastPoint(null)
      saveCanvasData()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      saveCanvasData()
    }
  }

  const handleAddCard = () => {
    const colorIndex = Math.floor(Math.random() * CARD_COLORS.length)
    const newCard: CanvasCard = {
      id: Date.now().toString(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 100,
      width: 300,
      height: 180,
      color: CARD_COLORS[colorIndex].value,
      borderColor: CARD_COLORS[colorIndex].border,
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
  }

  const handleCardMouseUp = () => {
    if (isDragging || isResizing) {
      handleSave()
    }
    setIsDragging(false)
    setIsResizing(false)
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
          <Button variant="outline" size="sm" onClick={handleAddCard} className="gap-1">
            <StickyNote className="size-3" />
            Add Note
          </Button>
          <div className="flex items-center gap-1 border rounded-lg px,1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="size-3" />
            </Button>
            <span className="text-xs w-10 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="size-3" />
            </Button>
          </div>
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
        {/* Main content sidebar */}
        <div className="w-48 border-r border-border/50 p-4 overflow-y-auto bg-muted/10 flex-shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Main Context</h3>
          <Textarea
            value={mainContent}
            onChange={(e) => setMainContent(e.target.value)}
            onBlur={handleSave}
            placeholder="Write the main idea and context here..."
            className="min-h-[200px] resize-none border-border/50 text-sm"
          />
        </div>

        {/* Canvas with drawing + floating note cards */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Drawing toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-muted/20">
            <div className="flex items-center gap-1 bg-background rounded-lg p-1">
              <Button
                variant={drawTool === 'pen' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setDrawTool('pen')}
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant={drawTool === 'eraser' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setDrawTool('eraser')}
              >
                <Eraser className="size-3" />
              </Button>
              <Button
                variant={drawTool === 'line' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setDrawTool('line')}
              >
                <Minus className="size-3" />
              </Button>
            </div>

            <div className="w-px h-5 bg-border/50" />

            {/* Color picker */}
            <div className="flex items-center gap-1">
              {DRAW_COLORS.map(color => (
                <button
                  key={color}
                  className={cn(
                    "size-5 rounded-full transition-transform hover:scale-110",
                    drawColor === color && "ring-2 ring-offset-1 ring-primary"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawColor(color)}
                />
              ))}
            </div>

            <div className="w-px h-5 bg-border/50" />

            {/* Size picker */}
            <div className="flex items-center gap-1">
              {[1, 2, 4, 6].map(size => (
                <button
                  key={size}
                  className={cn(
                    "size-6 rounded flex items-center justify-center hover:bg-muted",
                    drawSize === size && "bg-muted ring-1 ring-primary"
                  )}
                  onClick={() => setDrawSize(size)}
                >
                  <div
                    className="rounded-full bg-foreground"
                    style={{ width: size + 2, height: size + 2 }}
                  />
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border/50" />

            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={clearCanvas}>
              <Trash2 className="size-3" />
              Clear
            </Button>

            <div className="flex-1" />

            <span className="text-[10px] text-muted-foreground">
              Draw on canvas • Drag notes to move • Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Canvas area */}
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden bg-white"
            style={{
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
            onMouseMove={handleCardMouseMove}
            onMouseUp={handleCardMouseUp}
            onMouseLeave={() => {
              handleCardMouseUp()
              stopDrawing()
            }}
          >
            {/* Drawing canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 z-0"
              style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />

            {/* Floating note cards */}
            {cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  "absolute rounded-lg shadow-lg transition-shadow z-10",
                  selectedCardId === card.id ? "ring-2 ring-primary shadow-xl z-50" : "",
                  isDragging && selectedCardId === card.id ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                  left: card.x * zoom,
                  top: card.y * zoom,
                  width: card.width * zoom,
                  height: card.height * zoom,
                  backgroundColor: card.color,
                  borderWidth: 2,
                  borderColor: card.borderColor,
                  transform: `scale(${1})`,
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
