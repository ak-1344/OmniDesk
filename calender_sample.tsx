"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  X, 
  Ban, 
  Check, 
  Calendar as CalendarIcon,
  Trash2,
  Copy,
  AlertTriangle,
  User,
  Star,
  Sun,
  Heart,
  Sparkles
} from "lucide-react"

// Types
interface TimeSlot {
  id: string
  date: string // YYYY-MM-DD
  time: string // HH:00
  status: "available" | "booked" | "blocked"
  appointment?: Appointment
  blockReason?: string
}

interface Appointment {
  id: string
  title: string
  seeker: string
  service: string
  duration: number
  date: string
  time: string
}

// Helper functions
const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}

const getWeekDates = (baseDate: Date) => {
  const dates: Date[] = []
  const startOfWeek = new Date(baseDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
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
  
  // Add empty slots for days before the first day of the month
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  for (let i = 0; i < startDay; i++) {
    dates.push(null)
  }
  
  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    dates.push(new Date(year, month, i))
  }
  
  return dates
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  "Tarot Reading": <Star className="w-3 h-3" />,
  "Astrology": <Sun className="w-3 h-3" />,
  "Energy Healing": <Heart className="w-3 h-3" />,
  "Spiritual Guidance": <Sparkles className="w-3 h-3" />,
}

const SERVICE_COLORS: Record<string, string> = {
  "Tarot Reading": "bg-purple-100 border-purple-500 text-purple-700",
  "Astrology": "bg-amber-100 border-amber-500 text-amber-700",
  "Energy Healing": "bg-pink-100 border-pink-500 text-pink-700",
  "Spiritual Guidance": "bg-blue-100 border-blue-500 text-blue-700",
}

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "month">("week")
  const [showSlotDialog, setShowSlotDialog] = useState(false)
  const [showBulkDialog, setShowBulkDialog] = useState(false)
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{date: string, time: string} | null>(null)
  const [blockReason, setBlockReason] = useState("")
  
  // Bulk creation state
  const [bulkStartDate, setBulkStartDate] = useState("")
  const [bulkEndDate, setBulkEndDate] = useState("")
  const [bulkStartTime, setBulkStartTime] = useState("00:00")
  const [bulkEndTime, setBulkEndTime] = useState("23:00")
  const [bulkSelectedDays, setBulkSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri
  const [slotDuration, setSlotDuration] = useState("60")
  
  // Sample data - in production, this would come from your backend
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    // Sample available slots
    { id: "1", date: formatDate(new Date()), time: "09:00", status: "available" },
    { id: "2", date: formatDate(new Date()), time: "10:00", status: "booked", 
      appointment: { id: "a1", title: "Tarot Reading", seeker: "Aditya Sharma", service: "Tarot Reading", duration: 60, date: formatDate(new Date()), time: "10:00" }
    },
    { id: "3", date: formatDate(new Date()), time: "11:00", status: "available" },
    { id: "4", date: formatDate(new Date()), time: "14:00", status: "booked",
      appointment: { id: "a2", title: "Astrology Consultation", seeker: "Priya Patel", service: "Astrology", duration: 90, date: formatDate(new Date()), time: "14:00" }
    },
    { id: "5", date: formatDate(new Date()), time: "16:00", status: "blocked", blockReason: "Personal time" },
  ])

  const [appointments] = useState<Appointment[]>([
    { id: "a1", title: "Tarot Reading", seeker: "Aditya Sharma", service: "Tarot Reading", duration: 60, date: formatDate(new Date()), time: "10:00" },
    { id: "a2", title: "Astrology Consultation", seeker: "Priya Patel", service: "Astrology", duration: 90, date: formatDate(new Date()), time: "14:00" },
    { id: "a3", title: "Energy Healing", seeker: "Rahul Kumar", service: "Energy Healing", duration: 60, date: formatDate(new Date(new Date().setDate(new Date().getDate() + 2))), time: "11:00" },
    { id: "a4", title: "Spiritual Guidance", seeker: "Sneha Gupta", service: "Spiritual Guidance", duration: 60, date: formatDate(new Date(new Date().setDate(new Date().getDate() + 4))), time: "15:00" },
    { id: "a5", title: "Tarot Reading", seeker: "Amit Singh", service: "Tarot Reading", duration: 60, date: formatDate(new Date(new Date().setDate(new Date().getDate() + 7))), time: "10:00" },
    { id: "a6", title: "Astrology", seeker: "Neha Verma", service: "Astrology", duration: 90, date: formatDate(new Date(new Date().setDate(new Date().getDate() + 10))), time: "14:00" },
  ])

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const fullWeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeSlotOptions = Array.from({ length: 24 }, (_, hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])
  const monthDates = useMemo(() => getMonthDates(currentDate.getFullYear(), currentDate.getMonth()), [currentDate])

  // Get appointments for the current month (for the sidebar list)
  const monthAppointments = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getFullYear() === year && aptDate.getMonth() === month
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [appointments, currentDate])

  // Navigation
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  // Get slot status for a specific date and time
  const getSlotInfo = (date: string, time: string) => {
    return timeSlots.find(slot => slot.date === date && slot.time === time)
  }

  // Create a single time slot
  const createSlot = (date: string, time: string) => {
    const existingSlot = getSlotInfo(date, time)
    if (existingSlot) return

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      date,
      time,
      status: "available"
    }
    setTimeSlots(prev => [...prev, newSlot])
  }

  // Block a time slot
  const blockSlot = (date: string, time: string, reason: string) => {
    setTimeSlots(prev => {
      const existingIndex = prev.findIndex(slot => slot.date === date && slot.time === time)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], status: "blocked", blockReason: reason }
        return updated
      } else {
        return [...prev, { id: `slot-${Date.now()}`, date, time, status: "blocked", blockReason: reason }]
      }
    })
  }

  // Delete a time slot
  const deleteSlot = (date: string, time: string) => {
    setTimeSlots(prev => prev.filter(slot => !(slot.date === date && slot.time === time)))
  }

  // Unblock a time slot
  const unblockSlot = (date: string, time: string) => {
    setTimeSlots(prev => {
      const updated = prev.map(slot => {
        if (slot.date === date && slot.time === time && slot.status === "blocked") {
          return { ...slot, status: "available" as const, blockReason: undefined }
        }
        return slot
      })
      return updated
    })
  }

  // Bulk create slots
  const handleBulkCreate = () => {
    if (!bulkStartDate || !bulkEndDate) return

    const start = new Date(bulkStartDate)
    const end = new Date(bulkEndDate)
    const newSlots: TimeSlot[] = []

    const startHour = parseInt(bulkStartTime.split(':')[0])
    const endHourInclusive = parseInt(bulkEndTime.split(':')[0])
    const duration = parseInt(slotDuration)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay() // Convert Sunday from 0 to 7
      
      if (bulkSelectedDays.includes(dayOfWeek)) {
        for (let hour = startHour; hour <= endHourInclusive; hour += duration / 60) {
          const dateStr = formatDate(d)
          const timeStr = `${Math.floor(hour).toString().padStart(2, '0')}:00`
          
          const existingSlot = getSlotInfo(dateStr, timeStr)
          if (!existingSlot) {
            newSlots.push({
              id: `slot-${Date.now()}-${dateStr}-${timeStr}`,
              date: dateStr,
              time: timeStr,
              status: "available"
            })
          }
        }
      }
    }

    setTimeSlots(prev => [...prev, ...newSlots])
    setShowBulkDialog(false)
    setBulkStartDate("")
    setBulkEndDate("")
  }

  // Handle slot click
  const handleSlotClick = (date: string, time: string) => {
    setSelectedSlot({ date, time })
    setShowSlotDialog(true)
  }

  // Handle block action
  const handleBlockSlot = () => {
    if (selectedSlot) {
      blockSlot(selectedSlot.date, selectedSlot.time, blockReason)
      setShowBlockDialog(false)
      setShowSlotDialog(false)
      setBlockReason("")
      setSelectedSlot(null)
    }
  }

  // Format week range
  const weekRange = useMemo(() => {
    const start = weekDates[0]
    const end = weekDates[6]
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`
  }, [weekDates])

  // Format month
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your availability and session time slots</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkDialog(true)}
            className="rounded-xl bg-white"
          >
            <Copy className="w-4 h-4 mr-2" />
            Bulk Create Slots
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
            className={`rounded-xl ${view === "week" ? "bg-neon-violet text-white" : "bg-white"}`}
          >
            Week View
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            className={`rounded-xl ${view === "month" ? "bg-neon-violet text-white" : "bg-white"}`}
          >
            Month View
          </Button>
        </div>
      </div>

      {view === "week" ? (
        /* ==================== WEEK VIEW ==================== */
        <div className="bg-white rounded-3xl shadow-soft border border-white overflow-hidden">
          {/* Week Navigation */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-bold">{weekRange}</h3>
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => navigateWeek(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>

          {/* Week Calendar Grid - Dates as ROWS, Time Slots as COLUMNS */}
          <div className="overflow-x-auto">
            <div className="min-w-[2000px]">
              {/* Header - Time slots as columns */}
              <div className="grid border-b border-border" style={{ gridTemplateColumns: `150px repeat(${timeSlotOptions.length}, 1fr)` }}>
                <div className="p-3 text-xs font-bold uppercase text-muted-foreground bg-muted/30">Date</div>
                {timeSlotOptions.map((time) => (
                  <div key={time} className="p-3 text-center border-l border-border text-xs font-bold uppercase text-muted-foreground bg-muted/30">
                    {time}
                  </div>
                ))}
              </div>

              {/* Rows - Each row is a date */}
              {weekDates.map((date, dateIndex) => {
                const dateStr = formatDate(date)
                const isToday = formatDate(new Date()) === dateStr
                
                return (
                  <div 
                    key={dateIndex} 
                    className={`grid border-b border-border ${isToday ? 'bg-neon-violet/5' : ''}`}
                    style={{ gridTemplateColumns: `150px repeat(${timeSlotOptions.length}, 1fr)` }}
                  >
                    {/* Date cell */}
                    <div className={`p-3 flex flex-col justify-center ${isToday ? 'bg-neon-violet/10' : 'bg-muted/20'}`}>
                      <p className="text-xs font-bold uppercase text-muted-foreground">{fullWeekDays[dateIndex]}</p>
                      <p className={`text-lg font-bold ${isToday ? 'text-neon-violet' : ''}`}>
                        {date.getDate()}
                        {isToday && <span className="text-xs ml-2 font-normal">(Today)</span>}
                      </p>
                    </div>

                    {/* Time slot cells */}
                    {timeSlotOptions.map((time) => {
                      const slotInfo = getSlotInfo(dateStr, time)
                      const hasAppointment = slotInfo?.status === "booked" && slotInfo.appointment
                      const isBlocked = slotInfo?.status === "blocked"
                      const isAvailable = slotInfo?.status === "available"
                      const isEmpty = !slotInfo

                      return (
                        <div
                          key={time}
                          onClick={() => handleSlotClick(dateStr, time)}
                          className={`p-1 border-l border-border cursor-pointer transition-all min-h-[70px] relative group
                            ${isEmpty ? 'hover:bg-green-50' : ''}
                            ${isAvailable ? 'bg-green-50 hover:bg-green-100' : ''}
                            ${isBlocked ? 'bg-red-50' : ''}
                            ${hasAppointment ? '' : ''}
                          `}
                        >
                          {isEmpty && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-5 h-5 text-green-500" />
                            </div>
                          )}
                          
                          {isAvailable && !hasAppointment && (
                            <div className="h-full flex items-center justify-center">
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-[10px]">
                                <Check className="w-3 h-3 mr-1" />
                                Available
                              </Badge>
                            </div>
                          )}

                          {isBlocked && (
                            <div className="h-full flex flex-col items-center justify-center">
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-[10px]">
                                <Ban className="w-3 h-3 mr-1" />
                                Blocked
                              </Badge>
                              {slotInfo?.blockReason && (
                                <p className="text-[9px] text-red-600 mt-1 text-center px-1">{slotInfo.blockReason}</p>
                              )}
                            </div>
                          )}

                          {hasAppointment && slotInfo.appointment && (
                            <div className={`h-full rounded-lg p-2 border-l-4 ${SERVICE_COLORS[slotInfo.appointment.service] || 'bg-neon-violet/10 border-neon-violet'}`}>
                              <div className="flex items-center gap-1 mb-1">
                                {SERVICE_ICONS[slotInfo.appointment.service]}
                                <p className="text-[10px] font-bold line-clamp-1">{slotInfo.appointment.service}</p>
                              </div>
                              <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                <User className="w-2.5 h-2.5" />
                                {slotInfo.appointment.seeker}
                              </p>
                              <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {slotInfo.appointment.duration} min
                              </p>
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

          {/* Legend */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-6">
            <span className="text-xs font-medium text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span className="text-xs text-muted-foreground">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300" />
              <span className="text-xs text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-200" />
              <span className="text-xs text-muted-foreground">No Slot (click to create)</span>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== MONTH VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-white overflow-hidden">
            {/* Month Navigation */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="font-bold text-lg">{monthYear}</h3>
                <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => navigateMonth(1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-xs font-bold uppercase text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 gap-1">
                {monthDates.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="aspect-square" />
                  }

                  const dateStr = formatDate(date)
                  const isToday = formatDate(new Date()) === dateStr
                  const daySlots = timeSlots.filter(s => s.date === dateStr)
                  const availableCount = daySlots.filter(s => s.status === "available").length
                  const bookedCount = daySlots.filter(s => s.status === "booked").length
                  const blockedCount = daySlots.filter(s => s.status === "blocked").length

                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square p-2 rounded-xl border transition-all cursor-pointer hover:border-neon-violet/50 ${
                        isToday ? 'bg-neon-violet/10 border-neon-violet' : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <p className={`text-sm font-bold ${isToday ? 'text-neon-violet' : ''}`}>
                        {date.getDate()}
                      </p>
                      {daySlots.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {availableCount > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-[9px] text-muted-foreground">{availableCount}</span>
                            </div>
                          )}
                          {bookedCount > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="text-[9px] text-muted-foreground">{bookedCount}</span>
                            </div>
                          )}
                          {blockedCount > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
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

            {/* Legend */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center gap-6">
              <span className="text-xs font-medium text-muted-foreground">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Available slots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-muted-foreground">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Blocked</span>
              </div>
            </div>
          </div>

          {/* Appointments List for the Month */}
          <div className="bg-white rounded-3xl shadow-soft border border-white overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-neon-violet" />
                Upcoming in {currentDate.toLocaleDateString('en-US', { month: 'long' })}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">{monthAppointments.length} sessions scheduled</p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {monthAppointments.length === 0 ? (
                <div className="p-8 text-center">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No appointments this month</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {monthAppointments.map((apt) => {
                    const aptDate = new Date(apt.date)
                    return (
                      <div key={apt.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="text-center flex-shrink-0">
                            <p className="text-xs font-bold uppercase text-muted-foreground">
                              {aptDate.toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <p className="text-2xl font-bold text-neon-violet">{aptDate.getDate()}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${SERVICE_COLORS[apt.service] || 'bg-neon-violet/10 text-neon-violet'}`}>
                              {SERVICE_ICONS[apt.service]}
                              {apt.service}
                            </div>
                            <p className="text-sm font-medium mt-1 truncate">{apt.seeker}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {apt.time} · {apt.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Available Slots", value: timeSlots.filter(s => s.status === "available").length.toString(), color: "text-green-600" },
          { label: "Booked Sessions", value: timeSlots.filter(s => s.status === "booked").length.toString(), color: "text-purple-600" },
          { label: "Blocked Slots", value: timeSlots.filter(s => s.status === "blocked").length.toString(), color: "text-red-600" },
          { label: "Total This Month", value: monthAppointments.length.toString(), color: "text-neon-violet" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-soft border border-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Slot Action Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Time Slot</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {new Date(selectedSlot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot.time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSlot && (() => {
            const slotInfo = getSlotInfo(selectedSlot.date, selectedSlot.time)
            const isEmpty = !slotInfo
            const isAvailable = slotInfo?.status === "available"
            const isBlocked = slotInfo?.status === "blocked"
            const isBooked = slotInfo?.status === "booked"

            return (
              <div className="space-y-4 py-4">
                {isBooked && slotInfo?.appointment && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <p className="font-medium text-purple-900">{slotInfo.appointment.service}</p>
                    <p className="text-sm text-purple-700">with {slotInfo.appointment.seeker}</p>
                    <p className="text-xs text-purple-600 mt-1">{slotInfo.appointment.duration} minutes</p>
                  </div>
                )}

                {isBlocked && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="font-medium text-red-900 flex items-center gap-2">
                      <Ban className="w-4 h-4" />
                      This slot is blocked
                    </p>
                    {slotInfo?.blockReason && (
                      <p className="text-sm text-red-700 mt-1">Reason: {slotInfo.blockReason}</p>
                    )}
                  </div>
                )}

                {isEmpty && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="text-sm text-gray-600">No slot exists for this time. You can create one.</p>
                  </div>
                )}

                {isAvailable && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <p className="font-medium text-green-900 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      This slot is available for booking
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {isEmpty && (
                    <Button 
                      onClick={() => {
                        createSlot(selectedSlot.date, selectedSlot.time)
                        setShowSlotDialog(false)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Available Slot
                    </Button>
                  )}

                  {(isEmpty || isAvailable) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowSlotDialog(false)
                        setShowBlockDialog(true)
                      }}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Block This Slot
                    </Button>
                  )}

                  {isBlocked && (
                    <Button 
                      onClick={() => {
                        unblockSlot(selectedSlot.date, selectedSlot.time)
                        setShowSlotDialog(false)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Unblock Slot
                    </Button>
                  )}

                  {(isAvailable || isBlocked) && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        deleteSlot(selectedSlot.date, selectedSlot.time)
                        setShowSlotDialog(false)
                      }}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Slot
                    </Button>
                  )}
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Block Slot Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Block Time Slot
            </DialogTitle>
            <DialogDescription>
              This will prevent any bookings for this time slot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="blockReason">Reason (optional)</Label>
              <Textarea
                id="blockReason"
                placeholder="e.g., Personal appointment, Travel, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockSlot} className="bg-red-600 hover:bg-red-700 text-white">
              <Ban className="w-4 h-4 mr-2" />
              Block Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Create Time Slots</DialogTitle>
            <DialogDescription>
              Create multiple available time slots at once for a date range.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select value={bulkStartTime} onValueChange={setBulkStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlotOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select value={bulkEndTime} onValueChange={setBulkEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlotOptions.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Slot Duration */}
            <div className="space-y-2">
              <Label>Slot Duration</Label>
              <Select value={slotDuration} onValueChange={setSlotDuration}>
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

            {/* Days of Week */}
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
                ].map(day => (
                  <label
                    key={day.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      bulkSelectedDays.includes(day.value)
                        ? 'bg-neon-violet/10 border-neon-violet text-neon-violet'
                        : 'bg-white border-border hover:bg-muted/30'
                    }`}
                  >
                    <Checkbox
                      checked={bulkSelectedDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setBulkSelectedDays(prev => [...prev, day.value])
                        } else {
                          setBulkSelectedDays(prev => prev.filter(d => d !== day.value))
                        }
                      }}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="flex gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkSelectedDays([1, 2, 3, 4, 5])}
                >
                  Weekdays Only
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkCreate} 
              className="bg-neon-violet hover:bg-neon-violet/90 text-white"
              disabled={!bulkStartDate || !bulkEndDate || bulkSelectedDays.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slots
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
