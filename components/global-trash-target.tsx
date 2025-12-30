"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useApp } from "@/context/AppContext"

export function GlobalTrashTarget() {
  const [isOver, setIsOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)
  const { deleteTask, deleteIdea, deleteDomain, trash, restoreFromTrash, state } = useApp()

  // Listen for any drag events to expand the trash zone
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      setIsDraggingGlobal(true)
      setIsExpanded(true)
    }

    const handleDragEnd = () => {
      setIsDraggingGlobal(false)
      // Delay collapsing to allow for drop
      setTimeout(() => {
        setIsExpanded(false)
        setIsOver(false)
      }, 300)
    }

    window.addEventListener('dragstart', handleDragStart)
    window.addEventListener('dragend', handleDragEnd)

    return () => {
      window.removeEventListener('dragstart', handleDragStart)
      window.removeEventListener('dragend', handleDragEnd)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOver(false)
    setIsExpanded(false)
    setIsDraggingGlobal(false)

    // Try to get data from different possible formats
    let item: any = null
    let itemTitle = "Item"

    // Try JSON data first
    try {
      const jsonData = e.dataTransfer.getData("application/json")
      if (jsonData) {
        item = JSON.parse(jsonData)
        itemTitle = item.title || "Item"
      }
    } catch (err) {
      console.warn("[OmniDesk] Could not parse JSON data")
    }

    // Try text data as fallback
    if (!item) {
      try {
        const textData = e.dataTransfer.getData("text/plain")
        if (textData) {
          item = JSON.parse(textData)
          itemTitle = item.title || "Item"
        }
      } catch (err) {
        console.warn("[OmniDesk] Could not parse text data")
      }
    }

    // If still no item, try to extract from data transfer types
    if (!item) {
      const types = e.dataTransfer.types
      console.log("[OmniDesk] Available data types:", types)

      // Check for custom types
      for (const type of types) {
        if (type.startsWith('application/') || type === 'text/plain') {
          try {
            const data = e.dataTransfer.getData(type)
            if (data) {
              item = JSON.parse(data)
              itemTitle = item.title || "Item"
              break
            }
          } catch (err) {
            // Continue to next type
          }
        }
      }
    }

    if (!item) {
      console.warn("[OmniDesk] No valid drag data found")
      toast.error("Could not move item to trash", {
        description: "No valid item data found in drag event.",
      })
      return
    }

    console.log("[OmniDesk] Item moved to trash:", item)

    try {
      // Handle different item types
      switch (item.type) {
        case 'task':
          if (item.id) {
            await deleteTask(item.id)
            showSuccessToast('Task', itemTitle, item.id)
          }
          break

        case 'idea':
          if (item.id) {
            await deleteIdea(item.id)
            showSuccessToast('Idea', itemTitle, item.id)
          }
          break

        case 'subtask':
          // Subtasks need parent task context - inform user
          toast.info("Subtask deletion", {
            description: "Delete subtasks from the task detail page.",
            duration: 4000,
          })
          break

        case 'domain':
          // Domains need confirmation - inform user
          toast.warning("Domain deletion", {
            description: "Delete domains from Settings to ensure tasks are reassigned.",
            duration: 4000,
          })
          break

        case 'event':
          // Events deletion
          toast.info("Event deletion", {
            description: "Events can be deleted from the calendar view.",
            duration: 4000,
          })
          break

        default:
          // Try to infer type from item structure
          if (item.id) {
            // Check if it's a task
            const isTask = state.tasks.find(t => t.id === item.id)
            if (isTask) {
              await deleteTask(item.id)
              showSuccessToast('Task', isTask.title, item.id)
              return
            }

            // Check if it's an idea
            const isIdea = state.ideas.find(i => i.id === item.id)
            if (isIdea) {
              await deleteIdea(item.id)
              showSuccessToast('Idea', isIdea.title, item.id)
              return
            }

            // Unknown item with ID
            toast.warning("Item moved to trash", {
              description: `"${itemTitle}" has been handled.`,
              duration: 4000,
            })
          } else {
            toast.error("Unknown item type", {
              description: "Could not determine the item type to delete.",
            })
          }
      }
    } catch (error) {
      console.error("[OmniDesk] Failed to move to trash:", error)
      toast.error("Failed to move to trash", {
        description: "An error occurred while processing the deletion.",
      })
    }
  }

  const showSuccessToast = (type: string, title: string, itemId: string) => {
    toast.success(`${type} moved to trash`, {
      description: `"${title}" has been moved to Trash.`,
      duration: 8000,
      action: {
        label: "Undo",
        onClick: async () => {
          // Find the item in trash and restore it
          const trashItem = trash.find(t => t.item && (t.item as any).id === itemId)
          if (trashItem) {
            await restoreFromTrash(trashItem.id)
            toast.success(`${type} restored`, {
              description: `"${title}" has been restored.`,
            })
          } else {
            toast.error("Could not restore", {
              description: "The item was not found in trash.",
            })
          }
        },
      },
    })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "fixed bottom-6 left-6 z-[100] transition-all duration-300 ease-out",
        "flex items-center justify-center rounded-full",
        "border-2 border-dashed",
        // Size changes when dragging
        isExpanded || isDraggingGlobal
          ? "size-24 shadow-lg"
          : "size-12 shadow-sm opacity-50 hover:opacity-100",
        // Colors based on hover state
        isOver
          ? "bg-destructive/20 border-destructive scale-110 shadow-xl shadow-destructive/20"
          : isDraggingGlobal
            ? "bg-destructive/5 border-destructive/50 animate-pulse"
            : "bg-background/90 backdrop-blur-xl border-border hover:border-destructive/50 text-muted-foreground",
      )}
      title="Drop items here to move to trash"
    >
      <Trash2
        className={cn(
          "transition-all duration-200",
          isExpanded || isDraggingGlobal ? "size-10" : "size-5",
          isOver && "text-destructive animate-bounce"
        )}
      />

      {/* Expanded drop zone indicator */}
      {(isExpanded || isDraggingGlobal) && (
        <div className="absolute inset-0 rounded-full animate-ping bg-destructive/10 pointer-events-none" />
      )}

      {/* Label when hovering */}
      {isOver && (
        <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] px-3 py-1.5 tracking-widest uppercase font-bold animate-in fade-in slide-in-from-bottom-2 rounded-lg whitespace-nowrap">
          Release to Delete
        </span>
      )}

      {/* Hint when dragging */}
      {isDraggingGlobal && !isOver && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground text-[9px] px-2 py-1 tracking-wider uppercase animate-in fade-in slide-in-from-bottom-2 rounded whitespace-nowrap">
          Drop here
        </span>
      )}
    </div>
  )
}
