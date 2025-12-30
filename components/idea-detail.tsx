"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, Circle, Clock, Tag, MessageSquare, Plus } from "lucide-react"
import type { Idea } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface IdeaDetailProps {
  idea: Idea | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Idea>) => void
}

export function IdeaDetail({ idea, isOpen, onClose, onUpdate }: IdeaDetailProps) {
  const [title, setTitle] = useState(idea?.title || "")
  const [content, setContent] = useState(idea?.content || "")

  useEffect(() => {
    if (idea) {
      setTitle(idea.title)
      setContent(idea.content || "")
    }
  }, [idea])

  if (!idea) return null

  const handleTitleBlur = () => {
    if (title !== idea.title) {
      onUpdate(idea.id, { title })
    }
  }

  const handleContentBlur = () => {
    if (content !== idea.content) {
      onUpdate(idea.id, { content })
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-full sm:w-[450px] bg-background border-l border-border z-[100] transition-transform duration-300 ease-in-out shadow-2xl flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex items-center justify-between p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-mono rounded-none">
            Idea Detail
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono">ID: {idea.id.slice(0, 8)}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-none">
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-3xl font-serif border-none p-0 focus-visible:ring-0 bg-transparent h-auto"
              placeholder="Idea Title"
            />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Updated {new Date(idea.updated_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="size-3" /> Strategy
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleContentBlur}
              className="min-h-[200px] border-none p-0 focus-visible:ring-0 bg-transparent text-sm leading-relaxed resize-none"
              placeholder="Start describing your idea..."
            />
          </div>

          <Separator className="bg-border/50" />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Tasks</label>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase tracking-widest font-bold gap-1">
                <Plus className="size-3" /> Add Task
              </Button>
            </div>

            <div className="space-y-2">
              {[
                { id: "1", title: "Review technical requirements", status: "done" },
                { id: "2", title: "Draft initial sketches", status: "todo" },
                { id: "3", title: "Team alignment meeting", status: "todo" },
              ].map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center justify-between p-3 bg-muted/30 border border-border/50 hover:border-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {task.status === "done" ? (
                      <CheckCircle2 className="size-4 text-accent" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground" />
                    )}
                    <span className={cn("text-sm", task.status === "done" && "text-muted-foreground line-through")}>
                      {task.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border/50 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
            <MessageSquare className="size-3" /> 4 Comments
          </span>
        </div>
        <Button size="sm" className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90">
          Sync Changes
        </Button>
      </div>
    </div>
  )
}
