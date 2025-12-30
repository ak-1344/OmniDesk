"use client"

import type React from "react"
import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lightbulb, ChevronRight, Circle, Clock, CheckCircle2, Plus, Filter, GripVertical } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { state, addIdea, updateTask } = useApp()
  const [ideaTitle, setIdeaTitle] = useState("")
  const [ideaDescription, setIdeaDescription] = useState("")
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")

  // Get kanban columns from settings
  const kanbanColumns = state.settings.kanbanColumns || [
    { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
    { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
    { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
    { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
  ]

  // Map task states to column IDs
  const STATE_TO_COLUMN: Record<string, string> = {
    'gotta-start': 'gotta-start',
    'in-progress': 'in-progress',
    'nearly-done': 'in-progress',
    'paused': 'paused',
    'completed': 'completed',
  }

  // Get recent ideas
  const recentIdeas = useMemo(() => {
    let ideas = [...state.ideas]
    if (selectedDomain !== "all") {
      ideas = ideas.filter(idea => {
        const task = state.tasks.find(t => t.ideaId === idea.id)
        return task?.domainId === selectedDomain
      })
    }
    return ideas
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4)
      .map(idea => ({
        id: idea.id,
        title: idea.title || 'Untitled Idea',
        updated: formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: false }) + ' ago',
        hasCanvas: idea.canvasEnabled || false,
        taskCount: idea.convertedToTasks?.length || 0,
      }))
  }, [state.ideas, state.tasks, selectedDomain])

  // Transform tasks for Kanban
  const kanbanTasks = useMemo(() => {
    let tasks = [...state.tasks]
    if (selectedDomain !== "all") {
      tasks = tasks.filter(task => task.domainId === selectedDomain)
    }
    if (selectedState !== "all") {
      tasks = tasks.filter(task => STATE_TO_COLUMN[task.state] === selectedState)
    }
    return tasks.map(task => {
      const idea = state.ideas.find(i => i.id === task.ideaId)
      const domain = state.domains.find(d => d.id === task.domainId)
      return {
        id: task.id,
        title: task.title,
        origin: idea?.title || 'Direct Task',
        state: STATE_TO_COLUMN[task.state] || 'gotta-start',
        subtasks: task.subtasks.map(s => s.title),
        domain,
      }
    })
  }, [state.tasks, state.ideas, state.domains, selectedDomain, selectedState])

  const handleDragStart = useCallback((id: string) => {
    setDraggedTaskId(id)
  }, [])

  const handleDrop = useCallback(async (columnId: string) => {
    if (!draggedTaskId) return
    await updateTask(draggedTaskId, { state: columnId as any })
    setDraggedTaskId(null)
  }, [draggedTaskId, updateTask])

  const handleQuickCapture = useCallback(async () => {
    if (!ideaTitle.trim()) return
    await addIdea({
      title: ideaTitle.trim(),
      notes: ideaDescription.trim() ? [{
        id: Date.now().toString(),
        type: 'text',
        content: ideaDescription,
        createdAt: new Date().toISOString(),
        order: 0
      }] : [],
    })
    setIdeaTitle("")
    setIdeaDescription("")
  }, [ideaTitle, ideaDescription, addIdea])

  const sortedColumns = [...kanbanColumns].sort((a, b) => a.order - b.order)

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="size-3" />
            <span>Filter:</span>
          </div>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {state.domains.map(domain => (
                <SelectItem key={domain.id} value={domain.id}>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: domain.color }} />
                    {domain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[110px] h-8 text-xs">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {sortedColumns.map(col => (
                <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Global Kanban - NOW FIRST */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Global Kanban</h2>
              <p className="text-xs text-muted-foreground">Drag tasks to update state</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-7">
              <Link href="/tasks">View all <ChevronRight className="size-3" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedColumns.map((column) => {
              const columnTasks = kanbanTasks.filter((t) => t.state === column.id)
              return (
                <div
                  key={column.id}
                  className="min-h-[250px] bg-muted/20 rounded-xl border border-border/30 p-3"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(column.id)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: column.color }} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {column.label}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{columnTasks.length}</Badge>
                  </div>

                  <div className="space-y-2">
                    {columnTasks.slice(0, 5).map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={cn(
                          "border border-border/50 bg-card shadow-sm cursor-grab active:cursor-grabbing",
                          "hover:border-primary/30 transition-all",
                          draggedTaskId === task.id && "opacity-40 scale-95"
                        )}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <GripVertical className="size-3 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <Link href={`/tasks/${task.id}`} className="hover:text-primary transition-colors">
                                <h4 className="text-sm font-medium leading-tight line-clamp-2">{task.title}</h4>
                              </Link>
                              {task.domain && (
                                <Badge variant="outline" className="text-[9px] px-1 h-4 mt-1" style={{ borderColor: task.domain.color, color: task.domain.color }}>
                                  {task.domain.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {task.origin !== 'Direct Task' && (
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 italic pl-5">
                              <span>from</span>
                              <span className="truncate">{task.origin}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {columnTasks.length === 0 && (
                      <div className="p-4 text-center border border-dashed border-border/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground/50">Drop tasks here</p>
                      </div>
                    )}
                    {columnTasks.length > 5 && (
                      <p className="text-[10px] text-muted-foreground text-center">+{columnTasks.length - 5} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Idea Capture & Recent Ideas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="space-y-3">
            <h2 className="text-lg font-medium">Capture Idea</h2>
            <Card className="border-border/40 bg-card/30">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Idea title..."
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  className="border-border/50"
                />
                <Textarea
                  placeholder="Description (optional)..."
                  className="min-h-[60px] border-border/50 resize-none text-sm"
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.metaKey) {
                      handleQuickCapture()
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground">⌘↵ to save</span>
                  <Button size="sm" onClick={handleQuickCapture} disabled={!ideaTitle.trim()} className="text-xs h-7">
                    <Plus className="size-3 mr-1" /> Capture
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent Ideas</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-7">
                <Link href="/ideas">View all <ChevronRight className="size-3" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentIdeas.length === 0 ? (
                <Card className="border-dashed col-span-2">
                  <CardContent className="p-6 text-center">
                    <Lightbulb className="size-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No ideas yet. Capture your first thought!</p>
                  </CardContent>
                </Card>
              ) : (
                recentIdeas.map((idea) => (
                  <Link key={idea.id} href={`/ideas/${idea.id}`}>
                    <Card className="border-border/40 bg-card/30 hover:border-primary/20 transition-all group h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Lightbulb className="size-4 text-muted-foreground" />
                          <div className="flex gap-1">
                            {idea.hasCanvas && <Badge variant="secondary" className="text-[8px] px-1 h-4">Canvas</Badge>}
                            {idea.taskCount > 0 && <Badge variant="outline" className="text-[8px] px-1 h-4">{idea.taskCount} tasks</Badge>}
                          </div>
                        </div>
                        <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{idea.title}</h3>
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{idea.updated}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{state.ideas.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Ideas</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">{state.tasks.filter(t => t.state !== 'completed').length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Active</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{state.tasks.filter(t => t.state === 'completed').length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Completed</div>
            </CardContent>
          </Card>
          <Card className="border-border/40">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-500">{state.domains.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Domains</div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
