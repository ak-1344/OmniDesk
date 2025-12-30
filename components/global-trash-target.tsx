"use client"

import type React from "react"
import { useState } from "react"
import { Trash2, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useApp } from "@/context/AppContext"

export function GlobalTrashTarget() {
  const [isOver, setIsOver] = useState(false)
  const { deleteTask, deleteIdea } = useApp()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)

    try {
      const data = e.dataTransfer.getData("application/json")
      if (data) {
        const item = JSON.parse(data)
        console.log("[OmniDesk] Item moved to trash:", item)

        // Actually delete the item based on type
        if (item.type === 'task' && item.id) {
          await deleteTask(item.id)
          toast.success("Task moved to trash", {
            description: `"${item.title || "Task"}" has been moved to Trash.`,
            duration: 5000,
            icon: <Undo2 className="size-4 text-accent" />,
          })
        } else if (item.type === 'idea' && item.id) {
          await deleteIdea(item.id)
          toast.success("Idea moved to trash", {
            description: `"${item.title || "Idea"}" has been moved to Trash.`,
            duration: 5000,
            icon: <Undo2 className="size-4 text-accent" />,
          })
        } else {
          // Legacy handling for items without explicit type
          toast.success("Item moved to trash", {
            description: `"${item.title || "Item"}" has been moved to Trash.`,
            duration: 5000,
          })
        }
      }
    } catch (error) {
      console.error("Failed to move to trash:", error)
      toast.error("Failed to move to trash")
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "fixed bottom-6 right-6 z-[100] transition-all duration-300",
        "flex items-center justify-center size-12 rounded-full",
        "border-2 border-dashed shadow-sm",
        isOver
          ? "bg-destructive/10 border-destructive scale-110 shadow-lg shadow-destructive/10"
          : "bg-background/90 backdrop-blur-xl border-border hover:border-primary/50 text-muted-foreground",
      )}
      title="Drop items here to move to trash"
    >
      <Trash2 className={cn("size-5 transition-colors", isOver && "text-destructive")} />
      {isOver && (
        <span className="absolute -top-10 bg-destructive text-destructive-foreground text-[10px] px-2 py-1 tracking-widest uppercase font-bold animate-in fade-in slide-in-from-bottom-2 rounded">
          Delete
        </span>
      )}
    </div>
  )
}
