"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useMemo } from "react"

interface BreadcrumbItem {
    label: string
    href: string
    current?: boolean
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const { state } = useApp()

    const items = useMemo((): BreadcrumbItem[] => {
        if (!pathname) return []
        const segments = pathname.split('/').filter(Boolean)
        const breadcrumbs: BreadcrumbItem[] = []

        // Home is always first
        if (segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard')) {
            return [] // Don't show breadcrumbs on dashboard
        }

        breadcrumbs.push({ label: 'Home', href: '/dashboard' })

        let currentPath = ''
        segments.forEach((segment, index) => {
            currentPath += `/${segment}`
            const isLast = index === segments.length - 1

            // Map segments to readable labels
            let label = segment.charAt(0).toUpperCase() + segment.slice(1)

            // Check if this is an ID (for ideas/tasks)
            if (index > 0) {
                const parentSegment = segments[index - 1]

                if (parentSegment === 'ideas') {
                    const idea = state.ideas.find(i => i.id === segment)
                    if (idea) {
                        label = idea.title || 'Untitled Idea'
                    }
                } else if (parentSegment === 'tasks') {
                    const task = state.tasks.find(t => t.id === segment)
                    if (task) {
                        label = task.title || 'Untitled Task'
                    }
                }
            }

            breadcrumbs.push({
                label,
                href: currentPath,
                current: isLast,
            })
        })

        return breadcrumbs
    }, [pathname, state.ideas, state.tasks])

    if (items.length === 0) {
        return null
    }

    return (
        <nav className="flex items-center text-xs text-muted-foreground px-6 py-2 border-b border-border/30 bg-muted/10">
            <ol className="flex items-center gap-1">
                {items.map((item, index) => (
                    <li key={item.href} className="flex items-center gap-1">
                        {index > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                        {item.current ? (
                            <span className="font-medium text-foreground">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors"
                            >
                                {index === 0 ? (
                                    <span className="flex items-center gap-1">
                                        <Home className="size-3" />
                                        <span>{item.label}</span>
                                    </span>
                                ) : (
                                    item.label
                                )}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
