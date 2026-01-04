"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Trash2, RotateCcw, X, ChevronUp, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GlobalTrashTarget() {
  const [isOver, setIsOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false)
  const [showTrashPopover, setShowTrashPopover] = useState(false)
  const { deleteTask, deleteIdea, deleteDomain, trash, restoreFromTrash, permanentlyDelete, emptyTrash, state } = useApp()

  const retentionDays = state.settings.trashRetentionDays || 30

  // Calculate days until deletion for each item
  const getExpirationInfo = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt)
    const expirationDate = addDays(deleteDate, retentionDays)
    const daysLeft = differenceInDays(expirationDate, new Date())

    if (daysLeft <= 0) {
      return { daysLeft: 0, isUrgent: true, label: "Expiring soon" }
    } else if (daysLeft <= 7) {
      return { daysLeft, isUrgent: true, label: `${daysLeft}d left` }
    } else {
      return { daysLeft, isUrgent: false, label: `${daysLeft}d` }
    }
  }

  // Listen for any drag events to expand the trash zone
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      setIsDraggingGlobal(true)
      setIsExpanded(true)
      setShowTrashPopover(false) // Close popover when dragging
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

  const handleRestore = async (id: string) => {
    const item = trash.find(t => t.id === id)
    const title = item?.item && 'title' in item.item ? item.item.title : 'Item'
    await restoreFromTrash(id)
    toast.success("Restored", { description: `"${title}" has been restored.` })
  }

  const handlePermanentDelete = async (id: string) => {
    const item = trash.find(t => t.id === id)
    const title = item?.item && 'title' in item.item ? item.item.title : 'Item'
    await permanentlyDelete(id)
    toast.success("Permanently deleted", { description: `"${title}" has been deleted forever.` })
  }

  const handleEmptyTrash = async () => {
    await emptyTrash()
    toast.success("Trash emptied", { description: "All items have been permanently deleted." })
    setShowTrashPopover(false)
  }

  const handleIconClick = () => {
    if (!isDraggingGlobal && !isExpanded) {
      setShowTrashPopover(prev => !prev)
    }
  }

  return (
    <>
      {/* Trash popover */}
      {showTrashPopover && !isDraggingGlobal && (
        <div className="fixed bottom-24 right-6 z-[100] w-80 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Trash2 className="size-4 text-muted-foreground" />
              <span className="font-medium text-sm">Trash</span>
              <Badge variant="secondary" className="text-[10px] h-5">{trash.length}</Badge>
            </div>
            <div className="flex items-center gap-1">
              {trash.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={handleEmptyTrash}
                >
                  Empty All
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => setShowTrashPopover(false)}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>

          <ScrollArea className="max-h-64">
            {trash.length === 0 ? (
              <div className="p-6 text-center">
                <Trash2 className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Trash is empty</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Deleted items appear here for {retentionDays} days
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {trash.slice(0, 10).map((item) => {
                  const title = 'title' in item.item ? item.item.title : 'Untitled'
                  const expiration = getExpirationInfo(item.deletedAt)
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 group transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="h-4 px-1 text-[9px] capitalize">{item.type}</Badge>
                          <span className="flex items-center gap-0.5">
                            <Clock className="size-2.5" />
                            {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: false })}
                          </span>
                          <span className={cn(
                            "flex items-center gap-0.5",
                            expiration.isUrgent && "text-orange-500"
                          )}>
                            {expiration.isUrgent && <AlertTriangle className="size-2.5" />}
                            {expiration.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleRestore(item.id)}
                          title="Restore"
                        >
                          <RotateCcw className="size-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => handlePermanentDelete(item.id)}
                          title="Delete forever"
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {trash.length > 10 && (
                  <p className="text-[10px] text-muted-foreground text-center py-2">
                    +{trash.length - 10} more items
                  </p>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 border-t border-border/50 text-[10px] text-muted-foreground text-center">
            Items auto-delete after {retentionDays} days
          </div>
        </div>
      )}

      {/* Main trash drop zone - now at bottom-right */}
      <div
        onClick={handleIconClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "fixed bottom-6 right-6 z-[100] transition-all duration-300 ease-out cursor-pointer",
          "flex items-center justify-center rounded-full",
          "border-2",
          // Size changes when dragging
          isExpanded || isDraggingGlobal
            ? "size-24 shadow-lg border-dashed"
            : "size-12 shadow-md hover:shadow-lg",
          // Colors based on state
          isOver
            ? "bg-destructive/20 border-destructive scale-110 shadow-xl shadow-destructive/20 border-dashed"
            : isDraggingGlobal
              ? "bg-destructive/5 border-destructive/50 animate-pulse border-dashed"
              : showTrashPopover
                ? "bg-primary/10 border-primary shadow-lg"
                : trash.length > 0
                  ? "bg-background/90 backdrop-blur-xl border-border hover:border-destructive/50"
                  : "bg-background/90 backdrop-blur-xl border-border/50 opacity-60 hover:opacity-100 hover:border-border",
        )}
        title={isDraggingGlobal ? "Drop items here to delete" : "Click to view trash"}
      >
        <Trash2
          className={cn(
            "transition-all duration-200",
            isExpanded || isDraggingGlobal ? "size-10" : "size-5",
            isOver && "text-destructive animate-bounce",
            showTrashPopover && "text-primary"
          )}
        />

        {/* Badge showing trash count */}
        {trash.length > 0 && !isDraggingGlobal && !isExpanded && (
          <span className="absolute -top-1 -right-1 size-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {trash.length > 9 ? '9+' : trash.length}
          </span>
        )}

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

        {/* Popover toggle indicator */}
        {!isDraggingGlobal && !isExpanded && (
          <ChevronUp className={cn(
            "absolute -top-1 size-3 text-muted-foreground transition-transform",
            showTrashPopover && "rotate-180"
          )} />
        )}
      </div>
    </>
  )
}
