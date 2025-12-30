"use client"

import type * as React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Lightbulb,
  CheckSquare,
  CalendarIcon,
  TerminalIcon,
  Trash2,
  Settings,
  PanelLeft,
  SearchIcon,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThoughtTerminal } from "@/components/thought-terminal"
import { GlobalTrashTarget } from "@/components/global-trash-target"
import { Breadcrumbs } from "@/components/breadcrumbs"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/AppContext"
import { cn } from "@/lib/utils"

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Lightbulb, label: "Ideas", href: "/ideas" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: CalendarIcon, label: "Calendar", href: "/calendar" },
  { icon: Trash2, label: "Trash", href: "/trash" },
]

interface SearchResult {
  id: string
  title: string
  type: 'task' | 'idea' | 'event'
  href: string
  description?: string
  domain?: { name: string; color: string }
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useApp()

  // Get user info from settings
  const userName = state.settings.user?.name || 'User'
  const userEmail = state.settings.user?.email || ''
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault()
        setTerminalOpen((prev) => !prev)
      }
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Search results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()

    const results: SearchResult[] = []

    // Search tasks
    state.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query)) {
        const domain = state.domains.find(d => d.id === task.domainId)
        results.push({
          id: task.id,
          title: task.title,
          type: 'task',
          href: `/tasks/${task.id}`,
          description: task.description,
          domain: domain ? { name: domain.name, color: domain.color } : undefined,
        })
      }
    })

    // Search ideas
    state.ideas.forEach(idea => {
      if (idea.title.toLowerCase().includes(query)) {
        results.push({
          id: idea.id,
          title: idea.title,
          type: 'idea',
          href: `/ideas/${idea.id}`,
        })
      }
    })

    // Search events
    state.events.forEach(event => {
      if (event.title.toLowerCase().includes(query)) {
        results.push({
          id: event.id,
          title: event.title,
          type: 'event',
          href: `/calendar`,
        })
      }
    })

    return results.slice(0, 10) // Limit to 10 results
  }, [searchQuery, state.tasks, state.ideas, state.events, state.domains])

  const handleResultClick = useCallback((href: string) => {
    setSearchOpen(false)
    setSearchQuery("")
    router.push(href)
  }, [router])

  // Determine page title based on current route
  const getPageContext = () => {
    if (pathname === "/dashboard") return { title: `Welcome, ${userName}`, action: null }
    if (pathname === "/ideas") return { title: "Ideas", action: null }
    if (pathname?.startsWith("/ideas/")) return { title: "Idea", action: null }
    if (pathname === "/tasks") return { title: "Tasks", action: null }
    if (pathname?.startsWith("/tasks/")) return { title: "Task", action: null }
    if (pathname === "/calendar") return { title: "Calendar", action: null }
    if (pathname === "/trash") return { title: "Trash", action: null }
    if (pathname === "/settings") return { title: "Settings", action: null }
    return { title: "Workspace", action: null }
  }

  const { title } = getPageContext()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden selection:bg-primary/20 selection:text-primary">
        <Sidebar collapsible="icon" className="border-r border-border bg-sidebar/50 backdrop-blur-md">
          <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                <Image src="/logo.svg" alt="OmniDesk" width={32} height={32} />
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                <span className="font-bold tracking-tight">OMNIDESK</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Workspace</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Terminal" onClick={() => setTerminalOpen(true)}>
                      <TerminalIcon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">Terminal</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/settings">
                    <Settings className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background px-6 sticky top-0 z-10">
            <SidebarTrigger>
              <PanelLeft className="size-4" />
            </SidebarTrigger>
            <div className="h-4 w-px bg-border/50" />

            <div className="flex-1 flex items-center justify-between">
              <h1 className="text-xl font-medium tracking-tight">{title}</h1>

              <div className="flex items-center gap-3">
                {/* Search button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="relative hidden sm:flex items-center gap-2 h-8 w-[200px] text-sm bg-muted/50 border border-border/50 rounded-md px-3 text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <SearchIcon className="size-3.5" />
                  <span className="flex-1 text-left">Search...</span>
                  <kbd className="text-[10px] bg-background/50 px-1.5 py-0.5 rounded border border-border/50">⌘K</kbd>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full size-8">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{userName}</p>
                        {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Main content */}
          <main className="flex-1 overflow-hidden relative">
            {children}
            <ThoughtTerminal
              isOpen={terminalOpen}
              onClose={() => setTerminalOpen(false)}
              onCommand={(cmd) => console.log("[OmniDesk] Terminal command:", cmd)}
            />
            <GlobalTrashTarget />
          </main>
        </SidebarInset>
      </div>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, ideas, events..."
              className="flex-1 border-none bg-transparent focus-visible:ring-0 p-0 h-auto text-base"
              autoFocus
            />
            {searchQuery && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSearchQuery("")}>
                <X className="size-3" />
              </Button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {searchQuery.trim() ? (
              searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        result.type === 'task' && "bg-blue-500/10",
                        result.type === 'idea' && "bg-yellow-500/10",
                        result.type === 'event' && "bg-green-500/10",
                      )}>
                        {result.type === 'task' && <CheckSquare className="size-4 text-blue-500" />}
                        {result.type === 'idea' && <Lightbulb className="size-4 text-yellow-500" />}
                        {result.type === 'event' && <CalendarIcon className="size-4 text-green-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[9px] h-4 px-1 capitalize">{result.type}</Badge>
                          {result.domain && (
                            <div className="flex items-center gap-1">
                              <div className="size-2 rounded-full" style={{ backgroundColor: result.domain.color }} />
                              <span className="text-[10px] text-muted-foreground">{result.domain.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                </div>
              )
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Start typing to search...</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-border/50 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Press <kbd className="px-1 py-0.5 bg-background rounded border">↵</kbd> to select</span>
            <span>Press <kbd className="px-1 py-0.5 bg-background rounded border">ESC</kbd> to close</span>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
