"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Plus,
    Trash2,
    Save,
    Circle,
    CheckCircle2,
    Lightbulb,
    GripVertical,
    Pencil,
    Settings,
    Check,
    X,
} from "lucide-react"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"
import type { Subtask, SubtaskState, TaskState } from "@/types"
import { formatDistanceToNow } from "date-fns"

// Default subtask kanban columns
const DEFAULT_SUBTASK_COLUMNS = [
    { id: 'todo', label: 'To Do', color: '#3b82f6', order: 0 },
    { id: 'in-progress', label: 'In Progress', color: '#f97316', order: 1 },
    { id: 'completed', label: 'Completed', color: '#22c55e', order: 2 },
]

interface SubtaskColumn {
    id: string
    label: string
    color: string
    order: number
}

export default function TaskDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { state, updateTask, deleteTask, addSubtask, updateSubtask, deleteSubtask, updateSettings } = useApp()

    const taskId = params?.id as string
    const task = taskId ? state.tasks.find(t => t.id === taskId) : null

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [taskState, setTaskState] = useState<TaskState>("gotta-start")
    const [domainId, setDomainId] = useState("")
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
    const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
    const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null)
    const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null)
    const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)

    // Column management
    const [columnSettingsOpen, setColumnSettingsOpen] = useState(false)
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
    const [newColumnName, setNewColumnName] = useState("")
    const [newColumnColor, setNewColumnColor] = useState("#8b5cf6")

    // Get subtask kanban columns from settings or use defaults
    const subtaskColumns: SubtaskColumn[] = state.settings.subtaskKanbanColumns || DEFAULT_SUBTASK_COLUMNS

    // Get task-level kanban columns from settings
    const kanbanColumns = state.settings.kanbanColumns || [
        { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
        { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
        { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
        { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
    ]

    useEffect(() => {
        if (task) {
            setTitle(task.title || "")
            setDescription(task.description || "")
            setTaskState(task.state)
            setDomainId(task.domainId)
        }
    }, [task])

    const handleSave = async () => {
        if (!task) return
        await updateTask(task.id, {
            title,
            description,
            state: taskState,
            domainId,
        })
    }

    const handleAddSubtask = async (columnId: string) => {
        if (!task || !newSubtaskTitle.trim()) return
        await addSubtask(task.id, {
            title: newSubtaskTitle.trim(),
            state: columnId as SubtaskState,
        })
        setNewSubtaskTitle("")
        setAddingToColumn(null)
    }

    const handleDeleteSubtask = async (subtaskId: string) => {
        if (!task) return
        await deleteSubtask(task.id, subtaskId)
    }

    const handleDelete = async () => {
        if (!task) return
        if (confirm('Move this task to trash?')) {
            await deleteTask(task.id)
            router.push('/tasks')
        }
    }

    // Drag and drop for subtasks
    const handleSubtaskDragStart = useCallback((subtaskId: string) => {
        setDraggedSubtaskId(subtaskId)
    }, [])

    const handleSubtaskDrop = useCallback(async (newState: string) => {
        if (!draggedSubtaskId || !task) return
        await updateSubtask(task.id, draggedSubtaskId, {
            state: newState as SubtaskState,
            completedAt: newState === 'completed' ? new Date().toISOString() : undefined,
        })
        setDraggedSubtaskId(null)
    }, [draggedSubtaskId, task, updateSubtask])

    // Drag and drop for columns
    const handleColumnDragStart = useCallback((columnId: string) => {
        setDraggedColumnId(columnId)
    }, [])

    const handleColumnDrop = useCallback(async (targetId: string) => {
        if (!draggedColumnId || draggedColumnId === targetId) return

        const currentColumns = [...subtaskColumns]
        const draggedIndex = currentColumns.findIndex(c => c.id === draggedColumnId)
        const targetIndex = currentColumns.findIndex(c => c.id === targetId)

        const [draggedCol] = currentColumns.splice(draggedIndex, 1)
        currentColumns.splice(targetIndex, 0, draggedCol)

        // Update order field
        const newColumns = currentColumns.map((col, idx) => ({ ...col, order: idx }))
        await updateSettings({ subtaskKanbanColumns: newColumns })
        setDraggedColumnId(null)
    }, [draggedColumnId, subtaskColumns, updateSettings])

    // Column CRUD operations
    const handleAddColumn = async () => {
        if (!newColumnName.trim()) return
        const newColumn: SubtaskColumn = {
            id: newColumnName.toLowerCase().replace(/\s+/g, '-'),
            label: newColumnName.trim(),
            color: newColumnColor,
            order: subtaskColumns.length,
        }
        await updateSettings({ subtaskKanbanColumns: [...subtaskColumns, newColumn] })
        setNewColumnName("")
        setNewColumnColor("#8b5cf6")
    }

    const handleUpdateColumn = async (id: string, updates: Partial<SubtaskColumn>) => {
        const newColumns = subtaskColumns.map(col =>
            col.id === id ? { ...col, ...updates } : col
        )
        await updateSettings({ subtaskKanbanColumns: newColumns })
        setEditingColumnId(null)
    }

    const handleDeleteColumn = async (id: string) => {
        if (subtaskColumns.length <= 1) {
            alert("You must have at least one column")
            return
        }
        // Move all subtasks in this column to the first remaining column
        const remainingColumns = subtaskColumns.filter(c => c.id !== id)
        const firstColumnId = remainingColumns[0].id

        if (task) {
            for (const subtask of task.subtasks.filter(s => s.state === id)) {
                await updateSubtask(task.id, subtask.id, { state: firstColumnId as SubtaskState })
            }
        }

        await updateSettings({ subtaskKanbanColumns: remainingColumns })
    }

    if (!task) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">Task not found</p>
            </div>
        )
    }

    const domain = state.domains.find(d => d.id === task.domainId)
    const originIdea = task.ideaId ? state.ideas.find(i => i.id === task.ideaId) : null
    const completedSubtasks = task.subtasks.filter(s => s.state === 'completed').length
    const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0
    const currentColumn = kanbanColumns.find(c => c.id === taskState)
    const sortedColumns = [...subtaskColumns].sort((a, b) => a.order - b.order)

    return (
        <div className="h-full w-full overflow-auto bg-background">
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Task title..."
                            className="text-2xl font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                        />
                        {originIdea && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lightbulb className="size-4" />
                                <span>From idea:</span>
                                <a href={`/ideas/${originIdea.id}`} className="text-primary hover:underline">
                                    {originIdea.title}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleSave} className="gap-1">
                            <Save className="size-3" />
                            Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive gap-1">
                            <Trash2 className="size-3" />
                        </Button>
                    </div>
                </div>

                {/* Status row */}
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">State:</label>
                        <Select value={taskState} onValueChange={(v: string) => { setTaskState(v as TaskState); handleSave() }}>
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {kanbanColumns.sort((a, b) => a.order - b.order).map(col => (
                                    <SelectItem key={col.id} value={col.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: col.color }} />
                                            {col.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Domain:</label>
                        <Select value={domainId} onValueChange={(v: string) => { setDomainId(v); handleSave() }}>
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {state.domains.map(d => (
                                    <SelectItem key={d.id} value={d.id}>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                                            {d.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {currentColumn && (
                        <Badge style={{ backgroundColor: currentColumn.color }} className="text-white">
                            {currentColumn.label}
                        </Badge>
                    )}

                    <div className="text-xs text-muted-foreground ml-auto">
                        Updated {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                    </div>
                </div>

                {/* Description */}
                <Card className="border-border/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleSave}
                            placeholder="Add a description..."
                            className="min-h-[80px] resize-none border-border/50"
                        />
                    </CardContent>
                </Card>

                {/* Subtasks Kanban Board */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold">Subtasks</h2>
                            <Badge variant="secondary" className="text-xs">
                                {completedSubtasks}/{task.subtasks.length}
                            </Badge>
                            {task.subtasks.length > 0 && (
                                <div className="w-32">
                                    <Progress value={progress} className="h-1.5" />
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setColumnSettingsOpen(true)}
                            className="gap-1"
                        >
                            <Settings className="size-3" />
                            Manage Columns
                        </Button>
                    </div>

                    {/* Kanban Board */}
                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${sortedColumns.length}, minmax(250px, 1fr))` }}>
                        {sortedColumns.map((column) => {
                            const columnSubtasks = task.subtasks.filter(s => s.state === column.id)
                            return (
                                <div
                                    key={column.id}
                                    draggable
                                    onDragStart={() => handleColumnDragStart(column.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        if (draggedColumnId) {
                                            handleColumnDrop(column.id)
                                        } else if (draggedSubtaskId) {
                                            handleSubtaskDrop(column.id)
                                        }
                                    }}
                                    className={cn(
                                        "min-h-[300px] bg-muted/20 rounded-xl border border-border/30 p-3 transition-all",
                                        draggedColumnId === column.id && "opacity-50 scale-95",
                                        draggedSubtaskId && "ring-2 ring-primary/20"
                                    )}
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between mb-3 px-1 cursor-grab active:cursor-grabbing">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="size-3 text-muted-foreground/40" />
                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {column.label}
                                            </h3>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                            {columnSubtasks.length}
                                        </Badge>
                                    </div>

                                    {/* Subtasks in Column */}
                                    <div className="space-y-2">
                                        {columnSubtasks.map((subtask) => (
                                            <Card
                                                key={subtask.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.stopPropagation()
                                                    handleSubtaskDragStart(subtask.id)
                                                }}
                                                className={cn(
                                                    "border border-border/50 bg-card shadow-sm cursor-grab active:cursor-grabbing group",
                                                    "hover:border-primary/30 transition-all",
                                                    draggedSubtaskId === subtask.id && "opacity-40 scale-95",
                                                    subtask.state === 'completed' && "bg-muted/30"
                                                )}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex items-start gap-2">
                                                        <GripVertical className="size-3 text-muted-foreground/30 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            {editingSubtaskId === subtask.id ? (
                                                                <Input
                                                                    defaultValue={subtask.title}
                                                                    onBlur={(e) => {
                                                                        updateSubtask(task.id, subtask.id, { title: e.target.value })
                                                                        setEditingSubtaskId(null)
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            updateSubtask(task.id, subtask.id, { title: (e.target as HTMLInputElement).value })
                                                                            setEditingSubtaskId(null)
                                                                        }
                                                                        if (e.key === 'Escape') {
                                                                            setEditingSubtaskId(null)
                                                                        }
                                                                    }}
                                                                    className="h-6 text-sm"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <p className={cn(
                                                                    "text-sm leading-tight",
                                                                    subtask.state === 'completed' && "line-through text-muted-foreground"
                                                                )}>
                                                                    {subtask.title}
                                                                </p>
                                                            )}
                                                            {subtask.state === 'completed' && subtask.completedAt && (
                                                                <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                    <CheckCircle2 className="size-2.5" />
                                                                    {formatDistanceToNow(new Date(subtask.completedAt), { addSuffix: true })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0"
                                                                onClick={() => setEditingSubtaskId(subtask.id)}
                                                            >
                                                                <Pencil className="size-2.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0 text-destructive"
                                                                onClick={() => handleDeleteSubtask(subtask.id)}
                                                            >
                                                                <Trash2 className="size-2.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}

                                        {/* Add subtask to column */}
                                        {addingToColumn === column.id ? (
                                            <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-primary/30">
                                                <Input
                                                    value={newSubtaskTitle}
                                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddSubtask(column.id)
                                                        if (e.key === 'Escape') {
                                                            setAddingToColumn(null)
                                                            setNewSubtaskTitle("")
                                                        }
                                                    }}
                                                    placeholder="Subtask title..."
                                                    className="h-7 text-sm"
                                                    autoFocus
                                                />
                                                <Button size="sm" className="h-7 px-2" onClick={() => handleAddSubtask(column.id)}>
                                                    <Check className="size-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-7 px-2"
                                                    onClick={() => {
                                                        setAddingToColumn(null)
                                                        setNewSubtaskTitle("")
                                                    }}
                                                >
                                                    <X className="size-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full justify-start gap-1 text-muted-foreground h-8 border border-dashed border-border/50"
                                                onClick={() => setAddingToColumn(column.id)}
                                            >
                                                <Plus className="size-3" />
                                                Add subtask
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground text-center space-y-1 pt-4">
                    <p>Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</p>
                    <p className="font-mono text-[10px]">ID: {task.id}</p>
                </div>
            </div>

            {/* Column Settings Dialog */}
            <Dialog open={columnSettingsOpen} onOpenChange={setColumnSettingsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Subtask Columns</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Customize the columns for organizing subtasks. Drag to reorder.
                        </p>

                        {/* Existing columns */}
                        <div className="space-y-2">
                            {sortedColumns.map(column => (
                                <div
                                    key={column.id}
                                    className="flex items-center gap-3 p-2 rounded-lg border border-border/50 group"
                                >
                                    <GripVertical className="size-4 text-muted-foreground/30 cursor-grab" />
                                    {editingColumnId === column.id ? (
                                        <>
                                            <Input
                                                type="color"
                                                value={column.color}
                                                onChange={(e) => handleUpdateColumn(column.id, { color: e.target.value })}
                                                className="w-10 h-8 p-0"
                                            />
                                            <Input
                                                defaultValue={column.label}
                                                onBlur={(e) => handleUpdateColumn(column.id, { label: e.target.value })}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleUpdateColumn(column.id, { label: (e.target as HTMLInputElement).value })
                                                    }
                                                }}
                                                className="flex-1 h-8 text-sm"
                                                autoFocus
                                            />
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingColumnId(null)}>
                                                <Check className="size-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="size-5 rounded-full" style={{ backgroundColor: column.color }} />
                                            <span className="flex-1 text-sm font-medium">{column.label}</span>
                                            <Badge variant="outline" className="text-[10px]">{column.id}</Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                                                onClick={() => setEditingColumnId(column.id)}
                                            >
                                                <Pencil className="size-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                                                onClick={() => handleDeleteColumn(column.id)}
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add new column */}
                        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                            <Input
                                type="color"
                                value={newColumnColor}
                                onChange={(e) => setNewColumnColor(e.target.value)}
                                className="w-10 h-8 p-0"
                            />
                            <Input
                                placeholder="New column name..."
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                                className="flex-1 h-8 text-sm"
                            />
                            <Button size="sm" onClick={handleAddColumn} disabled={!newColumnName.trim()} className="h-8">
                                <Plus className="size-3 mr-1" /> Add
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setColumnSettingsOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
