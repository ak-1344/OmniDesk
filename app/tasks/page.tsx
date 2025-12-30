"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Circle, Lightbulb, LayoutList, Columns, Plus, Filter, GripVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow } from "date-fns"
import type { TaskState } from "@/types"

const TASK_STATES = [
  { id: "gotta-start", label: "Exploring", color: "bg-blue-500" },
  { id: "paused", label: "Shaping", color: "bg-purple-500" },
  { id: "in-progress", label: "Doing", color: "bg-orange-500" },
  { id: "completed", label: "Done", color: "bg-green-500" },
]

export default function TasksPage() {
  const { state, addTask, updateTask, deleteTask } = useApp()
  const [viewMode, setViewMode] = useState<"list" | "board">("board")
  const [newTaskOpen, setNewTaskOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDomain, setNewTaskDomain] = useState("")
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")

  const tasks = useMemo(() => {
    let filtered = [...state.tasks]

    // Filter by domain
    if (selectedDomain !== "all") {
      filtered = filtered.filter(task => task.domainId === selectedDomain)
    }

    // Filter by state
    if (selectedState !== "all") {
      filtered = filtered.filter(task => task.state === selectedState)
    }

    return filtered.map(task => {
      const idea = state.ideas.find(i => i.id === task.ideaId)
      const domain = state.domains.find(d => d.id === task.domainId)
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        state: task.state,
        domain,
        origin: idea ? { type: 'idea' as const, title: idea.title } : null,
        subtasks: task.subtasks.length,
        subtasksCompleted: task.subtasks.filter(s => s.state === 'completed').length,
        updatedAt: formatDistanceToNow(new Date(task.updatedAt), { addSuffix: false }) + ' ago',
      }
    })
  }, [state.tasks, state.ideas, state.domains, selectedDomain, selectedState])

  const getTasksByState = (stateId: string) => tasks.filter((task) => task.state === stateId)

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    const domainId = newTaskDomain || state.domains[0]?.id || 'default'

    await addTask({
      title: newTaskTitle.trim(),
      description: '',
      domainId,
      state: 'gotta-start' as TaskState,
    })
    setNewTaskTitle("")
    setNewTaskDomain("")
    setNewTaskOpen(false)
  }

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteTask(id)
  }

  const handleDragStart = (id: string) => {
    setDraggedTaskId(id)
  }

  const handleDrop = async (stateId: string) => {
    if (!draggedTaskId) return
    await updateTask(draggedTaskId, { state: stateId as TaskState })
    setDraggedTaskId(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif">Tasks</h1>
            <p className="text-xs text-muted-foreground">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} •
              {tasks.filter(t => t.state === 'completed').length} completed
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="size-3 text-muted-foreground" />
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <SelectValue placeholder="Domain" />
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
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {TASK_STATES.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "board")}>
              <TabsList className="h-8">
                <TabsTrigger value="board" className="text-xs h-7 px-2">
                  <Columns className="size-3 mr-1" />
                  Board
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs h-7 px-2">
                  <LayoutList className="size-3 mr-1" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => setNewTaskOpen(true)} size="sm" className="h-8 text-xs">
              <Plus className="size-3 mr-1" />
              New Task
            </Button>
          </div>
        </div>

        {viewMode === "board" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TASK_STATES.map((taskState) => {
              const stateTasks = getTasksByState(taskState.id)
              return (
                <div
                  key={taskState.id}
                  className="min-h-[400px] bg-muted/20 rounded-xl border border-border/30 p-3"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(taskState.id)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("size-2 rounded-full", taskState.color)} />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {taskState.label}
                      </h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                      {stateTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {stateTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={cn(
                          "border border-border/50 bg-card cursor-grab active:cursor-grabbing",
                          "hover:border-primary/30 hover:shadow-md transition-all",
                          draggedTaskId === task.id && "opacity-40 scale-95"
                        )}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Link href={`/tasks/${task.id}`} className="hover:text-primary">
                                <h4 className="text-sm font-medium leading-tight line-clamp-2">{task.title}</h4>
                              </Link>
                              {task.domain && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 h-4 mt-1"
                                  style={{ borderColor: task.domain.color, color: task.domain.color }}
                                >
                                  {task.domain.name}
                                </Badge>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-6">
                                  <MoreHorizontal className="size-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/tasks/${task.id}`}>Open</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => handleDeleteTask(task.id, e)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {task.origin && (
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 italic">
                              <Lightbulb className="size-2.5" />
                              <span className="truncate">{task.origin.title}</span>
                            </div>
                          )}

                          {task.subtasks > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${(task.subtasksCompleted / task.subtasks) * 100}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-muted-foreground">
                                {task.subtasksCompleted}/{task.subtasks}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {stateTasks.length === 0 && (
                      <div className="p-4 text-center border border-dashed border-border/30 rounded-lg">
                        <p className="text-[10px] text-muted-foreground/50">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <Card className="border-border/50 overflow-hidden">
            {tasks.length === 0 ? (
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Domain</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</th>
                    <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const taskState = TASK_STATES.find((s) => s.id === task.state)
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-border/30 hover:bg-muted/20 cursor-pointer"
                        onClick={() => window.location.href = `/tasks/${task.id}`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Circle className={cn("size-2", task.state === "completed" && "fill-green-500 text-green-500")} />
                            <span className="text-sm font-medium">{task.title}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {task.domain && (
                            <Badge
                              variant="outline"
                              className="text-[9px]"
                              style={{ borderColor: task.domain.color, color: task.domain.color }}
                            >
                              {task.domain.name}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {taskState && (
                            <div className="flex items-center gap-1.5">
                              <div className={cn("size-2 rounded-full", taskState.color)} />
                              <span className="text-xs text-muted-foreground">{taskState.label}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] text-muted-foreground">{task.updatedAt}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="What needs to be done?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskTitle.trim()) handleCreateTask()
              }}
              autoFocus
            />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewTaskOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
