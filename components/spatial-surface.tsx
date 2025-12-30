"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import type { Idea } from "@/lib/types"
import { IdeaCard } from "@/components/idea-card"
import { Button } from "@/components/ui/button"
import {
  Plus,
  MousePointer2,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize,
  Type,
  Square,
  ArrowRight,
  ImageIcon,
  Focus,
} from "lucide-react"
import { IdeaDetail } from "@/components/idea-detail"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    title: "Product Vision Q2",
    content: "Exploring the intersection of user needs and technical feasibility. What does success look like?",
    x_pos: 120,
    y_pos: 80,
    width: 320,
    height: 180,
    color: "bg-card",
    is_pinned: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "2",
    title: "Design System Evolution",
    content: "Components are living artifacts. How do we balance consistency with creative freedom?",
    x_pos: 520,
    y_pos: 100,
    width: 320,
    height: 180,
    color: "bg-card",
    is_pinned: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "3",
    title: "User Research Synthesis",
    content: "Patterns emerging from 12 interviews. People want control without complexity.",
    x_pos: 200,
    y_pos: 350,
    width: 320,
    height: 180,
    color: "bg-card",
    is_pinned: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

export function SpatialSurface({ ideaId }: { ideaId?: string }) {
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(ideaId || null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<"pointer" | "hand" | "text" | "shape" | "connector" | "image">("pointer")
  const [isPanning, setIsPanning] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle")

  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) || null

  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === "hand" || e.button === 1) {
      setIsPanning(true)
      e.preventDefault()
    }
  }

  useEffect(() => {
    if (!isPanning) return

    const handleMouseMove = (e: MouseEvent) => {
      setPan((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }))
    }

    const handleMouseUp = () => setIsPanning(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isPanning])

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((prev) => Math.min(Math.max(prev * delta, 0.2), 2))
    }
  }

  const handleMoveIdea = useCallback((id: string, x: number, y: number) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, x_pos: x, y_pos: y } : idea)))
  }, [])

  const handleDeleteIdea = useCallback(
    (id: string) => {
      setIdeas((prev) => prev.filter((idea) => idea.id !== id))
      if (selectedIdeaId === id) setSelectedIdeaId(null)
    },
    [selectedIdeaId],
  )

  const handleDuplicateIdea = useCallback(
    (id: string) => {
      const original = ideas.find((i) => i.id === id)
      if (!original) return

      const newIdea: Idea = {
        ...original,
        id: Math.random().toString(36).substr(2, 9),
        title: `${original.title} (copy)`,
        x_pos: original.x_pos + 30,
        y_pos: original.y_pos + 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setIdeas((prev) => [...prev, newIdea])
    },
    [ideas],
  )

  const handleCreateTask = useCallback((id: string) => {
    console.log("[v0] Create task from idea:", id)
  }, [])

  const handleUpdateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setSaveStatus("saving")
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, ...updates, updated_at: new Date().toISOString() } : idea)),
    )
    setTimeout(() => setSaveStatus("saved"), 1000)
    setTimeout(() => setSaveStatus("idle"), 3000)
  }, [])

  const handleAddIdea = useCallback(() => {
    const viewportCenterX = (-pan.x + window.innerWidth / 2) / zoom
    const viewportCenterY = (-pan.y + window.innerHeight / 2) / zoom

    const newIdea: Idea = {
      id: Math.random().toString(36).substr(2, 9),
      title: "Untitled Idea",
      content: "This is where your thinking will live...",
      x_pos: viewportCenterX - 160,
      y_pos: viewportCenterY - 100,
      width: 320,
      height: 180,
      color: "bg-card",
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setIdeas((prev) => [...prev, newIdea])
    setSelectedIdeaId(newIdea.id)
  }, [pan, zoom])

  const showEmptyState = ideas.length === 0

  return (
    <TooltipProvider>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full overflow-hidden bg-surface-dynamic",
          tool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-auto",
          isFocusMode && "z-[200] fixed inset-0",
        )}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
        }}
      >
        {saveStatus !== "idle" && (
          <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 border border-border shadow-sm text-[10px] font-mono uppercase tracking-widest text-muted-foreground animate-in fade-in slide-in-from-top-2">
            <div
              className={cn(
                "size-1.5 rounded-full",
                saveStatus === "saving" ? "bg-primary animate-pulse" : "bg-accent",
              )}
            />
            {saveStatus === "saving" ? "Saving..." : "Saved"}
          </div>
        )}

        {showEmptyState ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md px-6">
              <h2 className="text-2xl text-balance">This is where your ideas will live.</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A large surface for spatial thinking. Arrange your ideas freely, connect thoughts, and let structure
                emerge naturally.
              </p>
              <Button onClick={handleAddIdea} className="gap-2 mt-6">
                <Plus className="size-4" />
                Create your first idea
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                zoom={zoom}
                onMove={handleMoveIdea}
                onDelete={handleDeleteIdea}
                onDuplicate={handleDuplicateIdea}
                onCreateTask={handleCreateTask}
                onSelect={(id) => setSelectedIdeaId(id)}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/90 backdrop-blur-md border border-border shadow-xl z-50">
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "pointer" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("pointer")}
                >
                  <MousePointer2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Select & Move (V)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "hand" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("hand")}
                >
                  <Hand className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Pan Surface (H)</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-4 mx-1" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "text" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("text")}
                >
                  <Type className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Text Note (T)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "shape" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("shape")}
                >
                  <Square className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Shape (S)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "connector" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("connector")}
                >
                  <ArrowRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Connector (C)</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === "image" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setTool("image")}
                >
                  <ImageIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Image (I)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.2))}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-[10px] font-mono w-12 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setZoom((prev) => Math.min(prev + 0.1, 2))}
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  setPan({ x: 0, y: 0 })
                  setZoom(1)
                }}
              >
                <Maximize className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Reset View</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isFocusMode ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setIsFocusMode(!isFocusMode)}
              >
                <Focus className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{isFocusMode ? "Exit Focus" : "Focus Mode (F)"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {!showEmptyState && (
          <Button
            size="icon"
            className="fixed bottom-8 right-8 size-14 rounded-full shadow-xl z-50"
            onClick={handleAddIdea}
          >
            <Plus className="size-6" />
          </Button>
        )}

        <IdeaDetail
          idea={selectedIdea}
          isOpen={!!selectedIdeaId}
          onClose={() => setSelectedIdeaId(null)}
          onUpdate={handleUpdateIdea}
        />
      </div>
    </TooltipProvider>
  )
}
