"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, GripVertical, Filter } from "lucide-react"
import { useState, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { useApp } from "@/context/AppContext"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Work hours for week view (7am to 10pm)
const WORK_HOURS = Array.from({ length: 16 }, (_, i) => i + 7)

export default function CalendarPage() {
  const { state, addEvent } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "week">("month")
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const prevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
  const nextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))

  // Get calendar events with domain filtering
  const events = useMemo(() => {
    let filtered = state.events
    if (selectedDomain !== "all") {
      filtered = filtered.filter(event => {
        if (event.relatedTaskId) {
          const task = state.tasks.find(t => t.id === event.relatedTaskId)
          return task?.domainId === selectedDomain
        }
        return true
      })
    }
    return filtered.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      startHour: event.startTime ? parseInt(event.startTime.split(':')[0]) : 9,
      duration: 1,
      type: event.type,
    }))
  }, [state.events, state.tasks, selectedDomain])

  // Get unscheduled tasks
  const unscheduledTasks = useMemo(() => {
    const scheduledTaskIds = new Set(
      state.events.filter(e => e.relatedTaskId).map(e => e.relatedTaskId)
    )
    let tasks = state.tasks.filter(t => !scheduledTaskIds.has(t.id) && t.state !== 'completed')
    if (selectedDomain !== "all") {
      tasks = tasks.filter(t => t.domainId === selectedDomain)
    }
    return tasks.slice(0, 10).map(task => {
      const domain = state.domains.find(d => d.id === task.domainId)
      return { id: task.id, title: task.title, domain }
    })
  }, [state.tasks, state.events, state.domains, selectedDomain])

  const getEventsForDay = (day: number) => {
    return events.filter((event) => {
      return event.date.getFullYear() === year && event.date.getMonth() === month && event.date.getDate() === day
    })
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })
  }

  const weekDays = getWeekDays()

  const getEventsForHour = (day: Date, hour: number) => {
    return events.filter(
      (event) =>
        event.date.getFullYear() === day.getFullYear() &&
        event.date.getMonth() === day.getMonth() &&
        event.date.getDate() === day.getDate() &&
        hour >= event.startHour &&
        hour < event.startHour + event.duration
    )
  }

  const handleDrop = async (day: Date, hour?: number) => {
    if (!draggedTaskId) return
    const task = state.tasks.find((t) => t.id === draggedTaskId)
    if (!task) return

    await addEvent({
      title: task.title,
      description: task.description,
      date: day.toISOString().split('T')[0],
      startTime: hour ? `${hour.toString().padStart(2, '0')}:00` : undefined,
      endTime: hour ? `${(hour + 1).toString().padStart(2, '0')}:00` : undefined,
      type: 'subtask-scheduled',
      relatedTaskId: task.id,
    })
    setDraggedTaskId(null)
  }

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="h-full w-full overflow-hidden flex bg-background">
      <div className="flex-1 overflow-hidden flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-serif">
              {viewMode === "month"
                ? `${MONTHS[month]} ${year}`
                : `Week of ${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
            </h1>
            <p className="text-xs text-muted-foreground">{events.length} events</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <Filter className="size-3 mr-1" />
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

            <Tabs value={viewMode} onValueChange={(v: string) => setViewMode(v as "month" | "week")}>
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs h-7">Month</TabsTrigger>
                <TabsTrigger value="week" className="text-xs h-7">Week</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-8" onClick={viewMode === "month" ? prevMonth : prevWeek}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="icon" className="size-8" onClick={viewMode === "month" ? nextMonth : nextWeek}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === "month" ? (
          <Card className="flex-1 border-border/40 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="grid grid-cols-7 border-b border-border/50">
                {DAYS_SHORT.map((day) => (
                  <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2 border-r border-border/30 last:border-0">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1">
                {days.map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : []
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
                  return (
                    <div
                      key={index}
                      className={cn(
                        "min-h-[80px] p-2 border-r border-b border-border/30 transition-colors",
                        day ? "hover:bg-primary/[0.02] cursor-pointer" : "bg-muted/10",
                        isToday && "bg-primary/5"
                      )}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => day && handleDrop(new Date(year, month, day))}
                    >
                      {day && (
                        <>
                          <div className={cn(
                            "text-xs font-mono mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                            isToday && "bg-primary text-primary-foreground"
                          )}>
                            {day}
                          </div>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div key={event.id} className="text-[9px] p-1 bg-primary/10 border-l-2 border-primary rounded-r truncate">
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-[9px] text-muted-foreground px-1">+{dayEvents.length - 2} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Week View - DATES as ROWS (frozen), HOURS as COLUMNS (scrollable) */
          <Card className="flex-1 border-border/40 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Hours header - scrolls horizontally */}
              <div className="flex border-b border-border/50">
                {/* Frozen date column header */}
                <div className="w-24 flex-shrink-0 p-2 border-r border-border/30 bg-muted/30 sticky left-0 z-20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</span>
                </div>
                {/* Scrollable hours header */}
                <div className="flex-1 overflow-x-auto" ref={scrollContainerRef}>
                  <div className="flex min-w-max">
                    {WORK_HOURS.map((hour) => (
                      <div key={hour} className="w-[80px] flex-shrink-0 p-2 text-center border-r border-border/30">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date rows with time slots */}
              <div className="flex-1 overflow-y-auto">
                {weekDays.map((day, dayIndex) => {
                  const isToday = day.toDateString() === new Date().toDateString()
                  return (
                    <div key={dayIndex} className="flex border-b border-border/30">
                      {/* Frozen date cell */}
                      <div className={cn(
                        "w-24 flex-shrink-0 p-3 border-r border-border/30 sticky left-0 z-10 bg-card",
                        isToday && "bg-primary/5"
                      )}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {DAYS_SHORT[dayIndex]}
                        </div>
                        <div className={cn("text-lg font-medium", isToday && "text-primary")}>
                          {day.getDate()}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {day.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>

                      {/* Scrollable time slots */}
                      <div
                        className="flex-1 overflow-x-auto"
                        onScroll={(e) => {
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollLeft = (e.target as HTMLDivElement).scrollLeft
                          }
                        }}
                      >
                        <div className="flex min-w-max">
                          {WORK_HOURS.map((hour) => {
                            const hourEvents = getEventsForHour(day, hour)
                            return (
                              <div
                                key={`${dayIndex}-${hour}`}
                                className={cn(
                                  "w-[80px] h-[60px] flex-shrink-0 border-r border-border/30 hover:bg-primary/[0.03] cursor-pointer relative group",
                                  isToday && "bg-primary/[0.02]"
                                )}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => handleDrop(day, hour)}
                              >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                  <Plus className="size-3 text-primary/30" />
                                </div>
                                {hourEvents.map((event) => (
                                  <div key={event.id} className="absolute inset-1 p-1 bg-primary/15 border-l-2 border-primary text-[9px] rounded-r truncate z-10">
                                    {event.title}
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar - Unscheduled Tasks */}
      <div className="w-64 border-l border-border/50 bg-muted/5 p-4 overflow-y-auto hidden lg:block">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Unscheduled</h3>
            <p className="text-[10px] text-muted-foreground">Drag to schedule</p>
          </div>

          <div className="space-y-2">
            {unscheduledTasks.length === 0 ? (
              <p className="text-[10px] text-muted-foreground/50 text-center py-6">All tasks scheduled!</p>
            ) : (
              unscheduledTasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                  className="p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="size-3 text-muted-foreground/30 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium line-clamp-2 group-hover:text-primary">{task.title}</div>
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
        </div>
      </div>
    </div>
  )
}
