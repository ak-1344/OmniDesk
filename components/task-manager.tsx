"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Plus, Filter, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function TaskManager() {
  const [tasks] = useState([
    { id: "1", title: "Finalize OmniDesk Brand Identity", status: "in-progress", priority: "high", category: "Design" },
    { id: "2", title: "Implement Infinite Canvas Logic", status: "todo", priority: "high", category: "Engineering" },
    { id: "3", title: "Initial Team Onboarding", status: "done", priority: "medium", category: "Ops" },
  ])

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif">Tasks</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage your active workstreams</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-none gap-2 bg-transparent">
            <Filter className="size-3" /> Filter
          </Button>
          <Button size="sm" className="rounded-none gap-2">
            <Plus className="size-3" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center justify-between p-4 bg-muted/20 border border-border/50 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-4">
              {task.status === "done" ? (
                <CheckCircle2 className="size-5 text-accent" />
              ) : (
                <Circle className="size-5 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span
                  className={cn("text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}
                >
                  {task.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-[8px] uppercase tracking-widest font-bold py-0 h-4 rounded-none"
                  >
                    {task.category}
                  </Badge>
                  <span
                    className={cn(
                      "text-[8px] uppercase tracking-widest font-bold",
                      task.priority === "high" ? "text-accent" : "text-muted-foreground",
                    )}
                  >
                    {task.priority} priority
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
