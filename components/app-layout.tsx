"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
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
  Plus,
  PanelLeft,
  SearchIcon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApp } from "@/context/AppContext"

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Lightbulb, label: "Ideas", href: "/ideas" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: CalendarIcon, label: "Calendar", href: "/calendar" },
  { icon: Trash2, label: "Trash", href: "/trash" },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const pathname = usePathname()
  const { state } = useApp()

  // Get user info from settings
  const userName = state.settings.user?.name || 'User'
  const userEmail = state.settings.user?.email || ''
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault()
        setTerminalOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Determine page title based on current route
  const getPageContext = () => {
    if (pathname === "/dashboard") return { title: `Welcome, ${userName}`, action: null }
    if (pathname === "/ideas") return { title: "Ideas", action: "New Idea" }
    if (pathname?.startsWith("/ideas/")) return { title: "Idea", action: null }
    if (pathname === "/tasks") return { title: "Tasks", action: "New Task" }
    if (pathname?.startsWith("/tasks/")) return { title: "Task", action: null }
    if (pathname === "/calendar") return { title: "Calendar", action: null }
    if (pathname === "/trash") return { title: "Trash", action: null }
    if (pathname === "/settings") return { title: "Settings", action: null }
    return { title: "Workspace", action: null }
  }

  const { title, action } = getPageContext()

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
                <div className="relative hidden sm:block">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-9 h-8 w-[200px] text-sm bg-muted/50 border-border/50" />
                </div>

                {action && (
                  <Button size="sm" className="gap-1.5 h-8">
                    <Plus className="size-3.5" />
                    <span className="hidden sm:inline">{action}</span>
                  </Button>
                )}

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
    </SidebarProvider>
  )
}
