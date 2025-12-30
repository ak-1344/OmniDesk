"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  TerminalIcon,
  X,
  ChevronRight,
  CornerDownLeft,
  GripHorizontal,
  Brain,
  ListFilter,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TerminalProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: string) => void
}

export function ThoughtTerminal({ isOpen, onClose, onCommand }: TerminalProps) {
  const [activeTab, setActiveTab] = useState<"command" | "dump">("command")
  const [input, setInput] = useState("")
  const [dumpText, setDumpText] = useState("")
  const [history, setHistory] = useState<{ type: "cmd" | "out"; text: string }[]>([
    { type: "out", text: "OmniDesk Thought Terminal v2.1.0" },
    { type: "out", text: 'Type "help" for a list of available commands.' },
  ])
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          /* Toggle logic handled by parent state */
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && position.x === 0 && position.y === 0) {
      const centerX = (window.innerWidth - 640) / 2
      const centerY = Math.max(100, (window.innerHeight - 500) / 2)
      setPosition({ x: centerX, y: centerY })
    }
  }, [isOpen, position])

  useEffect(() => {
    if (isOpen && activeTab === "command") {
      inputRef.current?.focus()
    }
  }, [isOpen, activeTab])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("input") || target.closest("textarea")) return

    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const cmd = input.trim().toLowerCase()
    setHistory((prev) => [...prev, { type: "cmd", text: input }])

    if (cmd === "help") {
      setHistory((prev) => [
        ...prev,
        { type: "out", text: "Available commands: idea [title], task [title], search [query], clear, help" },
      ])
    } else if (cmd === "clear") {
      setHistory([])
    } else {
      onCommand(input)
      setHistory((prev) => [...prev, { type: "out", text: `Executing: ${input}...` }])
    }

    setInput("")
  }

  const parseDump = () => {
    const lines = dumpText.split("\n").filter((l) => l.trim().length > 0)
    return lines.map((line) => {
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return { type: "task", title: line.replace(/^[-*]\s+/, "") }
      }
      if (line.includes(":") || line.length < 40) {
        return { type: "idea", title: line }
      }
      return { type: "note", title: line }
    })
  }

  const dumpCandidates = parseDump()

  if (!isOpen) return null

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed w-full max-w-3xl bg-[#0a1128]/95 backdrop-blur-xl text-[#e0e7ff] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] z-[100] font-mono border border-white/10 rounded-xl overflow-hidden flex flex-col",
        isDragging && "cursor-grabbing select-none",
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 cursor-grab active:cursor-grabbing",
          isDragging && "cursor-grabbing",
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-3">
          <GripHorizontal className="size-4 text-white/20" />
          <div className="flex items-center gap-2">
            <TerminalIcon className="size-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/70">Thought Terminal</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "command" | "dump")} className="mr-2">
            <TabsList className="bg-white/5 border border-white/10 h-7 p-0.5">
              <TabsTrigger value="command" className="text-[9px] h-6 px-3 data-[state=active]:bg-white/10">
                CLI
              </TabsTrigger>
              <TabsTrigger value="dump" className="text-[9px] h-6 px-3 data-[state=active]:bg-white/10">
                DUMP
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-7 text-white/40 hover:text-white hover:bg-white/5"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>

      {activeTab === "command" ? (
        <div className="flex flex-col h-[400px]">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 text-[11px] leading-relaxed space-y-2 selection:bg-primary/30"
          >
            {history.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  item.type === "out" ? "text-white/50" : "text-primary-foreground font-medium",
                )}
              >
                {item.type === "cmd" && <span className="text-primary/50">{">"}</span>}
                <span className={cn(item.type === "cmd" && "text-primary")}>{item.text}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <span className="text-primary/50">{">"}</span>
              <div className="animate-pulse bg-primary w-2 h-4 self-center" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 mt-auto flex items-center gap-3">
            <ChevronRight className="size-4 text-primary" />
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-[11px] placeholder:text-white/10 text-primary-foreground"
              placeholder="Awaiting command..."
            />
            <div className="flex items-center gap-2 opacity-20">
              <Badge
                variant="outline"
                className="text-[8px] px-1.5 h-4 rounded-sm border-white/20 text-white font-mono"
              >
                ENTER
              </Badge>
              <CornerDownLeft className="size-3 text-white" />
            </div>
          </form>
        </div>
      ) : (
        <div className="flex h-[400px] divide-x divide-white/5">
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Brain className="size-4" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Cognitive Unload</span>
              </div>
              <span className="text-[9px] text-white/30 uppercase tracking-widest">Dump Mode</span>
            </div>
            <Textarea
              value={dumpText}
              onChange={(e) => setDumpText(e.target.value)}
              className="flex-1 bg-white/5 border-white/10 text-xs leading-relaxed resize-none focus-visible:ring-primary/20 p-4"
              placeholder="Paste raw thoughts, notes, or lists here. We'll help you parse them into ideas and tasks."
            />
          </div>

          <div className="w-72 bg-white/5 flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/50">
                <ListFilter className="size-3.5" />
                <span className="text-[9px] uppercase tracking-widest font-bold">Candidates</span>
              </div>
              <Badge variant="outline" className="text-[8px] border-white/20">
                {dumpCandidates.length}
              </Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {dumpCandidates.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 opacity-20">
                  <Brain className="size-8" />
                  <p className="text-[10px] leading-relaxed">Thoughts will appear as you type...</p>
                </div>
              ) : (
                dumpCandidates.map((c, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-2 p-2 rounded bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer"
                  >
                    <div
                      className={cn(
                        "size-1.5 rounded-full mt-1.5",
                        c.type === "task" ? "bg-accent" : c.type === "idea" ? "bg-primary" : "bg-white/20",
                      )}
                    />
                    <span className="text-[10px] leading-tight text-white/70 group-hover:text-white line-clamp-2">
                      {c.title}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5">
              <Button
                size="sm"
                className="w-full text-[10px] uppercase tracking-widest gap-2"
                disabled={dumpCandidates.length === 0}
              >
                <CheckCircle2 className="size-3.5" />
                Create Selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
