"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" // added textarea for reflections
import { Lightbulb, Plus, Circle, GripHorizontal, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Subtask {
  id: string
  title: string
  state: "exploring" | "shaping" | "done"
}

interface TaskDetailProps {
  task: any
  isOpen: boolean
  onClose: () => void
}

const SUBTASK_COLUMNS = [
  { id: "exploring", label: "To Explore" },
  { id: "shaping", label: "In Motion" },
  { id: "done", label: "Done" },
]

export function TaskDetail({ task, isOpen, onClose }: TaskDetailProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: "s1", title: "Review brand guidelines", state: "done" },
    { id: "s2", title: "Draft typography scale", state: "shaping" },
    { id: "s3", title: "Select primary blue palette", state: "exploring" },
    { id: "s4", title: "Define radius system", state: "exploring" },
  ])
  const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null)
  const [reflection, setReflection] = useState("")
  const [showReflection, setShowReflection] = useState(false)

  if (!task) return null

  const handleDragStart = (id: string) => setDraggedSubtaskId(id)

  const handleDrop = (state: any) => {
    if (!draggedSubtaskId) return
    setSubtasks((prev) => prev.map((s) => (s.id === draggedSubtaskId ? { ...s, state } : s)))
    if (state === "done") {
      setShowReflection(true)
    }
    setDraggedSubtaskId(null)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl flex flex-col h-full bg-background border-l border-border/50 p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <SheetHeader className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase"
                >
                  {task.state}
                </Badge>
                <div className="flex gap-1">
                  {task.tags?.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[8px] font-normal uppercase py-0 h-4">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <SheetTitle className="text-3xl font-serif tracking-tight leading-tight">{task.title}</SheetTitle>
              <SheetDescription className="text-sm leading-relaxed">{task.description}</SheetDescription>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 group cursor-pointer hover:text-primary transition-colors">
                <Lightbulb className="size-3.5 group-hover:scale-110 transition-transform" />
                <span>from</span>
                <span className="italic font-serif underline decoration-primary/30 underline-offset-4">
                  {task.origin.title}
                </span>
              </div>
            </SheetHeader>

            <Separator className="opacity-50" />

            {showReflection && (
              <section className="p-6 bg-accent/5 border border-accent/20 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-2 text-accent">
                  <MessageCircle className="size-4" />
                  <h4 className="text-xs font-bold uppercase tracking-widest">Completion Reflection</h4>
                </div>
                <Textarea
                  placeholder="Anything to note about this execution? How did the idea evolve?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[80px] text-xs bg-transparent border-accent/10 focus-visible:ring-accent/20 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase"
                    onClick={() => setShowReflection(false)}
                  >
                    Skip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] uppercase border-accent/30 text-accent hover:bg-accent/10 bg-transparent"
                    onClick={() => setShowReflection(false)}
                  >
                    Save Reflection
                  </Button>
                </div>
              </section>
            )}

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                  Subtask Kanban
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs"
                  onClick={() => {
                    /* Add Subtask Logic */
                  }}
                >
                  <Plus className="size-3.5" />
                  Add Subtask
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBTASK_COLUMNS.map((col) => (
                  <div
                    key={col.id}
                    className="space-y-3"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(col.id)}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                        {col.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 min-h-[150px]">
                      {subtasks
                        .filter((s) => s.state === col.id)
                        .map((sub) => (
                          <div
                            key={sub.id}
                            draggable
                            onDragStart={() => handleDragStart(sub.id)}
                            className={cn(
                              "group p-3 rounded-lg border border-border/40 bg-card/30 hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing",
                              draggedSubtaskId === sub.id && "opacity-50 grayscale",
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <GripHorizontal className="size-3 text-muted-foreground/20 mt-1" />
                              <span className="text-xs leading-snug group-hover:text-primary transition-colors">
                                {sub.title}
                              </span>
                            </div>
                            {col.id === "done" && (
                              <div className="flex justify-end pt-2">
                                <Circle className="size-2 fill-accent text-accent" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="p-6 bg-muted/20 border-t border-border/50 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-mono">TASK_ID: {task.id}</p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Detail
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
