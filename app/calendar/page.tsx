"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Ban,
  Check,
  Calendar as CalendarIcon,
  Trash2,
  Copy,
  AlertTriangle,
  GripVertical,
  Filter,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"
import { toast } from "sonner"

type SlotStatus = "available" | "booked" | "blocked" | "empty"

interface TimeSlot {
  id: string
  date: string
  time: string
  status: SlotStatus
  eventId?: string
  blockReason?: string
}

const formatDate = (date: Date) => date.toISOString().split("T")[0]

const formatHour = (hour: number) => {
  if (hour === 0) return "12am"
  if (hour === 12) return "12pm"
  if (hour < 12) return `${hour}am`
  return `${hour - 12}pm`
}

const getWeekDates = (baseDate: Date) => {
  const dates: Date[] = []
  const startOfWeek = new Date(baseDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
  startOfWeek.setDate(diff)
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(date)
  }
  return dates
}

const getMonthDates = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const dates: (Date | null)[] = []
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  for (let i = 0; i < startDay; i++) dates.push(null)
  for (let i = 1; i <= lastDay.getDate(); i++) dates.push(new Date(year, month, i))
  return dates
}

const isPastDateTime = (date: Date, hour?: number) => {
  const now = new Date()
  const checkDate = new Date(date)
  if (hour !== undefined) {
    checkDate.setHours(hour, 0, 0, 0)
    return checkDate < now
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
  return targetDay < today
}

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  meeting: { bg: "bg-pink-100", border: "border-pink-500", text: "text-pink-700" },
  task: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-700" },
  event: { bg: "bg-green-100", border: "border-green-500", text: "text-green-700" },
  blocked: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
  available: { bg: "bg-emerald-100", border: "border-emerald-500", text: "text-emerald-700" },
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarPage() {
  const { state, addEvent, updateEvent, deleteEvent } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 4)) // January 4, 2026
  const [viewMode, setViewMode] = useState<"week" | "month">("month") // Start with month view
  const [selectedDomain, setSelectedDomain] = useState<string>("all")

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showSlotDialog, setShowSlotDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [blockReason, setBlockReason] = useState("")

  type EventType = "task-deadline" | "subtask-scheduled" | "personal-event" | "meeting" | "event" | "task" | "idea" | "blocked"
  
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    type: "event" as EventType,
    date: "",
    startHour: 9,
  })

  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkEndDate, setBulkEndDate] = useState("")
  const [bulkStartTime, setBulkStartTime] = useState(9)
  const [bulkEndTime, setBulkEndTime] = useState(17)
  const [bulkSelectedDays, setBulkSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [slotDuration, setSlotDuration] = useState(60)

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const monthDates = useMemo(() => getMonthDates(year, month), [year, month])

  const navigateWeek = (dir: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + dir * 7)
    setCurrentDate(newDate)
  }

  const navigateMonth = (dir: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + dir)
    setCurrentDate(newDate)
  }

  const events = useMemo(() => {
    let filtered = state.events
    if (selectedDomain !== "all") {
      filtered = filtered.filter((event) => {
        if (event.relatedTaskId) {
          const task = state.tasks.find((t) => t.id === event.relatedTaskId)
          return task?.domainId === selectedDomain
        }
        return true
      })
    }
    return filtered.map((event) => {
      let domainColor: string | null = null
      if (event.relatedTaskId) {
        const task = state.tasks.find((t) => t.id === event.relatedTaskId)
        if (task) {
          const domain = state.domains.find((d) => d.id === task.domainId)
          domainColor = domain?.color || null
        }
      }
      return {
        ...event,
        startHour: event.startTime ? parseInt(event.startTime.split(":")[0]) : 9,
        duration: event.duration || 1,
        domainColor,
      }
    })
  }, [state.events, state.tasks, state.domains, selectedDomain])

  const unscheduledTasks = useMemo(() => {
    const scheduledTaskIds = new Set(state.events.filter((e) => e.relatedTaskId).map((e) => e.relatedTaskId))
    let tasks = state.tasks.filter((t) => !scheduledTaskIds.has(t.id) && t.state !== "completed")
    if (selectedDomain !== "all") {
      tasks = tasks.filter((t) => t.domainId === selectedDomain)
    }
    return tasks.slice(0, 10).map((task) => {
      const domain = state.domains.find((d) => d.id === task.domainId)
      return { id: task.id, title: task.title, domain }
    })
  }, [state.tasks, state.events, state.domains, selectedDomain])

  const monthAppointments = useMemo(() => {
    return events
      .filter((e) => {
        const eventDate = new Date(e.date)
        return eventDate.getFullYear() === year && eventDate.getMonth() === month
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events, year, month])

  const getSlotInfo = (
    dateStr: string,
    time: string
  ): { status: SlotStatus; event?: (typeof events)[0]; slot?: TimeSlot } => {
    const slot = timeSlots.find((s) => s.date === dateStr && s.time === time)
    const event = events.find((e) => {
      const eventDateStr = e.date.split("T")[0]
      const eventTime = `${e.startHour.toString().padStart(2, "0")}:00`
      return eventDateStr === dateStr && eventTime === time
    })
    if (event) return { status: "booked", event }
    if (slot?.status === "blocked") return { status: "blocked", slot }
    if (slot?.status === "available") return { status: "available", slot }
    return { status: "empty" }
  }

  const createAvailableSlot = (dateStr: string, time: string) => {
    const existing = timeSlots.find((s) => s.date === dateStr && s.time === time)
    if (existing) return
    setTimeSlots((prev) => [...prev, { id: `slot-${Date.now()}`, date: dateStr, time, status: "available" }])
    toast.success("Slot created", { description: "Available slot created successfully" })
  }

  const blockSlot = (dateStr: string, time: string, reason: string) => {
    setTimeSlots((prev) => {
      const idx = prev.findIndex((s) => s.date === dateStr && s.time === time)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], status: "blocked", blockReason: reason }
        return updated
      }
      return [...prev, { id: `slot-${Date.now()}`, date: dateStr, time, status: "blocked", blockReason: reason }]
    })
    toast.success("Slot blocked", { description: reason || "Time slot has been blocked" })
  }

  const unblockSlot = (dateStr: string, time: string) => {
    setTimeSlots((prev) =>
      prev.map((s) => (s.date === dateStr && s.time === time ? { ...s, status: "available" as const, blockReason: undefined } : s))
    )
    toast.success("Slot unblocked")
  }

  const deleteSlot = (dateStr: string, time: string) => {
    setTimeSlots((prev) => prev.filter((s) => !(s.date === dateStr && s.time === time)))
    toast.success("Slot removed")
  }

  const handleSlotClick = (dateStr: string, time: string) => {
    setSelectedSlot({ date: dateStr, time })
    const { status, event } = getSlotInfo(dateStr, time)
    if (event) {
      setEditingEventId(event.id)
      setNewEvent({
        title: event.title,
        description: event.description || "",
        type: event.type || "event",
        date: event.date.split("T")[0],
        startHour: event.startHour,
      })
      setShowEventDialog(true)
    } else {
      setShowSlotDialog(true)
    }
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim() || !selectedSlot) return
    const isPast = isPastDateTime(new Date(selectedSlot.date), parseInt(selectedSlot.time))

    if (editingEventId) {
      await updateEvent(editingEventId, {
        title: newEvent.title,
        description: newEvent.description,
        date: selectedSlot.date,
        startTime: selectedSlot.time,
        endTime: `${((parseInt(selectedSlot.time) + 1) % 24).toString().padStart(2, "0")}:00`,
        type: newEvent.type,
      })
      toast.success("Event updated")
    } else {
      if (isPast && newEvent.type !== "event") {
        toast.error("Past events can only be notes")
        return
      }
      await addEvent({
        title: newEvent.title,
        description: newEvent.description,
        date: selectedSlot.date,
        startTime: selectedSlot.time,
        endTime: `${((parseInt(selectedSlot.time) + 1) % 24).toString().padStart(2, "0")}:00`,
        type: isPast ? "event" : newEvent.type,
      })
      setTimeSlots((prev) => prev.filter((s) => !(s.date === selectedSlot.date && s.time === selectedSlot.time)))
      toast.success(isPast ? "Note added" : "Event created")
    }
    resetEventDialog()
  }

  const handleDeleteEvent = async () => {
    if (!editingEventId) return
    await deleteEvent(editingEventId)
    toast.success("Event deleted")
    resetEventDialog()
  }

  const resetEventDialog = () => {
    setShowEventDialog(false)
    setEditingEventId(null)
    setNewEvent({ title: "", description: "", type: "event" as EventType, date: "", startHour: 9 })
    setSelectedSlot(null)
  }

  const handleBlockAction = () => {
    if (!selectedSlot) return
    blockSlot(selectedSlot.date, selectedSlot.time, blockReason)
    setShowBlockDialog(false)
    setShowSlotDialog(false)
    setBlockReason("")
    setSelectedSlot(null)
  }

  const handleBulkCreate = () => {
    if (!bulkStartDate || !bulkEndDate) return
    const start = new Date(bulkStartDate)
    const end = new Date(bulkEndDate)
    const newSlots: TimeSlot[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay()
      if (bulkSelectedDays.includes(dayOfWeek)) {
        for (let hour = bulkStartTime; hour <= bulkEndTime; hour += slotDuration / 60) {
          const dateStr = formatDate(d)
          const timeStr = `${Math.floor(hour).toString().padStart(2, "0")}:00`
          if (!timeSlots.find((s) => s.date === dateStr && s.time === timeStr)) {
            newSlots.push({
              id: `slot-${Date.now()}-${dateStr}-${timeStr}`,
              date: dateStr,
              time: timeStr,
              status: "available",
            })
          }
        }
      }
    }

    setTimeSlots((prev) => [...prev, ...newSlots])
    setShowBulkDialog(false)
    setBulkStartDate("")
    setBulkEndDate("")
    toast.success(`Created ${newSlots.length} available slots`)
  }

  const handleDrop = async (dateStr: string, time: string) => {
    if (!draggedTaskId) return
    const isPast = isPastDateTime(new Date(dateStr), parseInt(time))
    if (isPast) {
      toast.error("Cannot schedule in the past")
      setDraggedTaskId(null)
      return
    }
    const task = state.tasks.find((t) => t.id === draggedTaskId)
    if (!task) return

    await addEvent({
      title: task.title,
      description: task.description,
      date: dateStr,
      startTime: time,
      endTime: `${((parseInt(time) + 1) % 24).toString().padStart(2, "0")}:00`,
      type: "task",
      relatedTaskId: task.id,
    })
    setTimeSlots((prev) => prev.filter((s) => !(s.date === dateStr && s.time === time)))
    setDraggedTaskId(null)
    toast.success("Task scheduled")
  }

  const stats = useMemo(
    () => ({
      available: timeSlots.filter((s) => s.status === "available").length,
      booked: events.length,
      blocked: timeSlots.filter((s) => s.status === "blocked").length,
      monthTotal: monthAppointments.length,
    }),
    [timeSlots, events, monthAppointments]
  )

  const weekRange = `${weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  const monthYear = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Calendar</h1>
            <p className="text-sm text-muted-foreground">Manage your schedule and availability</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[140px] h-9">
                <Filter className="size-3 mr-2" />
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {state.domains.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowBulkDialog(true)} className="h-9">
              <Copy className="size-4 mr-2" />
              Bulk Create
            </Button>
            <div className="flex border rounded-lg overflow-hidden">
              <Button variant={viewMode === "week" ? "default" : "ghost"} onClick={() => setViewMode("week")} className="rounded-none h-9">
                Week
              </Button>
              <Button variant={viewMode === "month" ? "default" : "ghost"} onClick={() => setViewMode("month")} className="rounded-none h-9">
                Month
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "week" ? (
          <div className="flex gap-6">
            <Card className="flex-1 border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateWeek(-1)}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <h3 className="font-semibold text-lg">{weekRange}</h3>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateWeek(1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 0, 4))}>
                    Today
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <div className="min-w-[1600px]">
                    <div className="grid border-b border-border/50" style={{ gridTemplateColumns: `140px repeat(24, minmax(60px, 1fr))` }}>
                      <div className="p-3 text-xs font-bold uppercase text-muted-foreground bg-muted/30 sticky left-0 z-10">Date</div>
                      {ALL_HOURS.map((hour) => (
                        <div key={hour} className="p-2 text-center text-xs font-medium text-muted-foreground bg-muted/30 border-l border-border/30">
                          {formatHour(hour)}
                        </div>
                      ))}
                    </div>
                    {weekDates.map((date, idx) => {
                      const dateStr = formatDate(date)
                      const today = new Date(2026, 0, 4) // January 4, 2026
                      const isToday = formatDate(today) === dateStr
                      return (
                        <div
                          key={idx}
                          className={cn("grid border-b border-border/30", isToday && "bg-primary/5")}
                          style={{ gridTemplateColumns: `140px repeat(24, minmax(60px, 1fr))` }}
                        >
                          <div className={cn("p-3 sticky left-0 z-10 bg-card border-r border-border/30", isToday && "bg-primary/10")}>
                            <p className="text-xs font-bold uppercase text-muted-foreground">{FULL_WEEKDAYS[idx]}</p>
                            <p className={cn("text-2xl font-bold", isToday && "text-primary")}>
                              {date.getDate()}
                              {isToday && <span className="text-xs ml-2 font-normal text-primary">(Today)</span>}
                            </p>
                          </div>
                          {ALL_HOURS.map((hour) => {
                            const time = `${hour.toString().padStart(2, "0")}:00`
                            const { status, event, slot } = getSlotInfo(dateStr, time)
                            const isPast = isPastDateTime(date, hour)
                            return (
                              <div
                                key={hour}
                                onClick={() => handleSlotClick(dateStr, time)}
                                onDragOver={(e) => !isPast && status !== "blocked" && e.preventDefault()}
                                onDrop={() => handleDrop(dateStr, time)}
                                className={cn(
                                  "min-h-[80px] p-1 border-l border-border/20 cursor-pointer transition-all relative group",
                                  status === "empty" && !isPast && "hover:bg-emerald-50",
                                  status === "available" && "bg-emerald-50 hover:bg-emerald-100",
                                  status === "blocked" && "bg-red-50",
                                  status === "booked" && "bg-white",
                                  isPast && status === "empty" && "bg-muted/20 hover:bg-muted/30"
                                )}
                              >
                                {status === "empty" && !isPast && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="size-5 text-emerald-500" />
                                  </div>
                                )}
                                {status === "empty" && isPast && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity">
                                    <FileText className="size-4 text-muted-foreground" />
                                  </div>
                                )}
                                {status === "available" && (
                                  <div className="h-full flex items-center justify-center">
                                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">
                                      <Check className="size-3 mr-1" />
                                      Available
                                    </Badge>
                                  </div>
                                )}
                                {status === "blocked" && (
                                  <div className="h-full flex flex-col items-center justify-center">
                                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-[10px]">
                                      <Ban className="size-3 mr-1" />
                                      Blocked
                                    </Badge>
                                    {slot?.blockReason && <p className="text-[9px] text-red-600 mt-1 text-center px-1 line-clamp-2">{slot.blockReason}</p>}
                                  </div>
                                )}
                                {status === "booked" && event && (
                                  <div
                                    className={cn(
                                      "h-full rounded-lg p-2 border-l-4",
                                      EVENT_COLORS[event.type || "event"]?.bg || "bg-primary/10",
                                      EVENT_COLORS[event.type || "event"]?.text || "text-primary"
                                    )}
                                    style={{ borderLeftColor: event.domainColor || undefined }}
                                  >
                                    <p className="text-[10px] font-bold line-clamp-1">{event.title}</p>
                                    <p className="text-[9px] opacity-70 flex items-center gap-1 mt-0.5">
                                      <Clock className="size-2.5" />
                                      {formatHour(event.startHour)}
                                    </p>
                                    {event.type && (
                                      <Badge variant="secondary" className="text-[8px] h-4 mt-1 capitalize">
                                        {event.type}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center gap-6 flex-wrap">
                  <span className="text-xs font-medium text-muted-foreground">Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded bg-emerald-100 border border-emerald-300" />
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded bg-red-100 border border-red-300" />
                    <span className="text-xs text-muted-foreground">Blocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded bg-blue-100 border border-blue-300" />
                    <span className="text-xs text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded bg-white border border-gray-200" />
                    <span className="text-xs text-muted-foreground">No Slot</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="w-64 border-border/50 flex-shrink-0 hidden xl:block">
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Unscheduled</h3>
                  <p className="text-xs text-muted-foreground">Drag to schedule</p>
                </div>
                <div className="space-y-2">
                  {unscheduledTasks.length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 text-center py-6">All tasks scheduled!</p>
                  ) : (
                    unscheduledTasks.map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        className="p-2.5 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="size-3 text-muted-foreground/30 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-2">{task.title}</p>
                            {task.domain && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="size-2 rounded-full" style={{ backgroundColor: task.domain.color }} />
                                <span className="text-[9px] text-muted-foreground">{task.domain.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    <h3 className="font-semibold text-lg">{monthYear}</h3>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(2026, 0, 4))}>
                    Today
                  </Button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 mb-2">
                    {WEEKDAYS.map((day) => (
                      <div key={day} className="p-2 text-center text-xs font-bold uppercase text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {monthDates.map((date, i) => {
                      if (!date) return <div key={`empty-${i}`} className="aspect-square" />
                      const dateStr = formatDate(date)
                      const today = new Date(2026, 0, 4) // January 4, 2026
                      const isToday = formatDate(today) === dateStr
                      const daySlots = timeSlots.filter((s) => s.date === dateStr)
                      const dayEvents = events.filter((e) => e.date.split("T")[0] === dateStr)
                      const availableCount = daySlots.filter((s) => s.status === "available").length
                      const bookedCount = dayEvents.length
                      const blockedCount = daySlots.filter((s) => s.status === "blocked").length

                      return (
                        <div
                          key={dateStr}
                          onClick={() => {
                            setCurrentDate(date)
                            setViewMode("week")
                          }}
                          className={cn(
                            "aspect-square p-2 rounded-xl border transition-all cursor-pointer hover:border-primary/50",
                            isToday ? "bg-primary/10 border-primary" : "border-border/50 hover:bg-muted/30"
                          )}
                        >
                          <p className={cn("text-sm font-bold", isToday && "text-primary")}>{date.getDate()}</p>
                          {(availableCount > 0 || bookedCount > 0 || blockedCount > 0) && (
                            <div className="mt-1 space-y-0.5">
                              {availableCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="size-2 rounded-full bg-emerald-500" />
                                  <span className="text-[9px] text-muted-foreground">{availableCount}</span>
                                </div>
                              )}
                              {bookedCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="size-2 rounded-full bg-blue-500" />
                                  <span className="text-[9px] text-muted-foreground">{bookedCount}</span>
                                </div>
                              )}
                              {blockedCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="size-2 rounded-full bg-red-500" />
                                  <span className="text-[9px] text-muted-foreground">{blockedCount}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center gap-6">
                  <span className="text-xs font-medium text-muted-foreground">Legend:</span>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500" />
                    <span className="text-xs text-muted-foreground">Blocked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CalendarIcon className="size-5 text-primary" />
                    Upcoming in {currentDate.toLocaleDateString("en-US", { month: "long" })}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{monthAppointments.length} events scheduled</p>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {monthAppointments.length === 0 ? (
                    <div className="p-8 text-center">
                      <CalendarIcon className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No events this month</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {monthAppointments.map((apt) => {
                        const aptDate = new Date(apt.date)
                        return (
                          <div key={apt.id} className="p-4 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="text-center flex-shrink-0">
                                <p className="text-xs font-bold uppercase text-muted-foreground">
                                  {aptDate.toLocaleDateString("en-US", { weekday: "short" })}
                                </p>
                                <p className="text-2xl font-bold text-primary">{aptDate.getDate()}</p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <Badge variant="secondary" className="text-[10px] capitalize mb-1">
                                  {apt.type || "event"}
                                </Badge>
                                <p className="text-sm font-medium truncate">{apt.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="size-3" />
                                  {formatHour(apt.startHour)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Available Slots</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.available}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Booked Events</p>
              <p className="text-3xl font-bold text-blue-600">{stats.booked}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Blocked Slots</p>
              <p className="text-3xl font-bold text-red-600">{stats.blocked}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">This Month</p>
              <p className="text-3xl font-bold text-primary">{stats.monthTotal}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Time Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot &&
                new Date(selectedSlot.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}{" "}
              at {selectedSlot?.time}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot &&
            (() => {
              const { status, slot } = getSlotInfo(selectedSlot.date, selectedSlot.time)
              const isPast = isPastDateTime(new Date(selectedSlot.date), parseInt(selectedSlot.time))
              return (
                <div className="space-y-4 py-4">
                  {status === "blocked" && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                      <p className="font-medium text-red-900 flex items-center gap-2">
                        <Ban className="size-4" />
                        This slot is blocked
                      </p>
                      {slot?.blockReason && <p className="text-sm text-red-700 mt-1">Reason: {slot.blockReason}</p>}
                    </div>
                  )}
                  {status === "available" && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <p className="font-medium text-emerald-900 flex items-center gap-2">
                        <Check className="size-4" />
                        This slot is available for booking
                      </p>
                    </div>
                  )}
                  {status === "empty" && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-600">
                        {isPast ? "This is a past time slot. You can add a note." : "No slot exists. You can create one or add an event."}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {(status === "empty" || status === "available") && (
                      <Button
                        onClick={() => {
                          setNewEvent({ title: "", description: "", type: "event" as EventType, date: selectedSlot.date, startHour: parseInt(selectedSlot.time) })
                          setShowSlotDialog(false)
                          setShowEventDialog(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="size-4 mr-2" />
                        {isPast ? "Add Note" : "Add Event"}
                      </Button>
                    )}
                    {status === "empty" && !isPast && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          createAvailableSlot(selectedSlot.date, selectedSlot.time)
                          setShowSlotDialog(false)
                          setSelectedSlot(null)
                        }}
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="size-4 mr-2" />
                        Create Available Slot
                      </Button>
                    )}
                    {(status === "empty" || status === "available") && !isPast && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSlotDialog(false)
                          setShowBlockDialog(true)
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Ban className="size-4 mr-2" />
                        Block This Slot
                      </Button>
                    )}
                    {status === "blocked" && (
                      <Button
                        onClick={() => {
                          unblockSlot(selectedSlot.date, selectedSlot.time)
                          setShowSlotDialog(false)
                          setSelectedSlot(null)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="size-4 mr-2" />
                        Unblock Slot
                      </Button>
                    )}
                    {(status === "available" || status === "blocked") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          deleteSlot(selectedSlot.date, selectedSlot.time)
                          setShowSlotDialog(false)
                          setSelectedSlot(null)
                        }}
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        <Trash2 className="size-4 mr-2" />
                        Remove Slot
                      </Button>
                    )}
                  </div>
                </div>
              )
            })()}
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              Block Time Slot
            </DialogTitle>
            <DialogDescription>This will prevent any events from being scheduled at this time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea placeholder="e.g., Personal time, Travel, etc." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockAction} className="bg-red-600 hover:bg-red-700">
              <Ban className="size-4 mr-2" />
              Block Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEventDialog} onOpenChange={(open) => { if (!open) resetEventDialog() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              {editingEventId ? "Edit Event" : "Add Event"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Event title..." value={newEvent.title} onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Add details..."
                value={newEvent.description}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newEvent.type} onValueChange={(v) => setNewEvent((prev) => ({ ...prev, type: v as EventType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedSlot && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <CalendarIcon className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(selectedSlot.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at {selectedSlot.time}
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div>
              {editingEventId && (
                <Button variant="ghost" onClick={handleDeleteEvent} className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetEventDialog}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent} disabled={!newEvent.title.trim()}>
                {editingEventId ? (
                  <>
                    <Check className="size-4 mr-1" /> Save
                  </>
                ) : (
                  <>
                    <Plus className="size-4 mr-1" /> Add Event
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Create Time Slots</DialogTitle>
            <DialogDescription>Create multiple available time slots at once for a date range.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={bulkStartDate} onChange={(e) => setBulkStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={bulkEndDate} onChange={(e) => setBulkEndDate(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Select value={bulkStartTime.toString()} onValueChange={(v) => setBulkStartTime(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_HOURS.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {formatHour(h)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Select value={bulkEndTime.toString()} onValueChange={(v) => setBulkEndTime(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_HOURS.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {formatHour(h)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Slot Duration</Label>
              <Select value={slotDuration.toString()} onValueChange={(v) => setSlotDuration(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes (2 hours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 1, label: "Mon" },
                  { value: 2, label: "Tue" },
                  { value: 3, label: "Wed" },
                  { value: 4, label: "Thu" },
                  { value: 5, label: "Fri" },
                  { value: 6, label: "Sat" },
                  { value: 7, label: "Sun" },
                ].map((day) => (
                  <label
                    key={day.value}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                      bulkSelectedDays.includes(day.value) ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:bg-muted/30"
                    )}
                  >
                    <Checkbox
                      checked={bulkSelectedDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelectedDays((prev) => [...prev, day.value])
                        } else {
                          setBulkSelectedDays((prev) => prev.filter((d) => d !== day.value))
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const nextWeek = new Date(today)
                    nextWeek.setDate(today.getDate() + 7)
                    setBulkStartDate(formatDate(today))
                    setBulkEndDate(formatDate(nextWeek))
                  }}
                >
                  Next Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    const nextMonth = new Date(today)
                    nextMonth.setMonth(today.getMonth() + 1)
                    setBulkStartDate(formatDate(today))
                    setBulkEndDate(formatDate(nextMonth))
                  }}
                >
                  Next Month
                </Button>
                <Button variant="outline" size="sm" onClick={() => setBulkSelectedDays([1, 2, 3, 4, 5])}>
                  Weekdays Only
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreate} disabled={!bulkStartDate || !bulkEndDate || bulkSelectedDays.length === 0}>
              <Plus className="size-4 mr-2" />
              Create Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}