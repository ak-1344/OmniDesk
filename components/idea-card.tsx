"use client"

import type React from "react"
import { MoreHorizontal, Layers, CheckSquare, Clock } from "lucide-react"
import type { Idea } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface IdeaCardProps {
  idea: Idea
  onMove: (id: string, x: number, y: number) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
  onDuplicate?: (id: string) => void
  onCreateTask?: (id: string) => void
  zoom?: number
}

export function IdeaCard({ idea, onMove, onDelete, onSelect, onDuplicate, onCreateTask, zoom = 1 }: IdeaCardProps) {
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const startX = "clientX" in e ? e.clientX : e.touches[0].clientX
    const startY = "clientY" in e ? e.clientY : e.touches[0].clientY
    const initialX = idea.x_pos
    const initialY = idea.y_pos

    const handleDrag = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = "clientX" in moveEvent ? moveEvent.clientX : moveEvent.touches[0].clientX
      const currentY = "clientY" in moveEvent ? moveEvent.clientY : moveEvent.touches[0].clientY

      const deltaX = (currentX - startX) / zoom
      const deltaY = (currentY - startY) / zoom

      onMove(idea.id, initialX + deltaX, initialY + deltaY)
    }

    const handleDragEnd = () => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchmove", handleDrag)
      window.removeEventListener("touchend", handleDragEnd)
    }

    window.addEventListener("mousemove", handleDrag)
    window.addEventListener("mouseup", handleDragEnd)
    window.addEventListener("touchmove", handleDrag)
    window.addEventListener("touchend", handleDragEnd)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    if (e.detail === 2) {
      onSelect(idea.id)
    }
  }

  const hasCanvas = Math.random() > 0.5
  const taskCount = Math.floor(Math.random() * 4)

  return (
    <Card
      style={{
        position: "absolute",
        left: idea.x_pos,
        top: idea.y_pos,
        width: idea.width,
        minHeight: idea.height,
        cursor: "grab",
      }}
      className={cn(
        "group border-border/50 bg-card shadow-sm hover:shadow-md hover:border-accent/30 transition-all active:cursor-grabbing",
      )}
      onMouseDown={handleDragStart}
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 gap-2">
        <div className="flex-1 space-y-2">
          <CardTitle className="text-base font-medium leading-tight tracking-tight">{idea.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{idea.content}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onSelect(idea.id)}>Open</DropdownMenuItem>
            {onDuplicate && <DropdownMenuItem onClick={() => onDuplicate(idea.id)}>Duplicate idea</DropdownMenuItem>}
            <DropdownMenuSeparator />
            {onCreateTask && (
              <DropdownMenuItem onClick={() => onCreateTask(idea.id)}>Create task from idea</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground" onClick={() => onDelete(idea.id)}>
              Move to Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {hasCanvas && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal gap-1">
              <Layers className="size-3" />
              Canvas
            </Badge>
          )}
          {taskCount > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 font-normal gap-1">
              <CheckSquare className="size-3" />
              {taskCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          <Clock className="size-3" />
          <span>{new Date(idea.updated_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
