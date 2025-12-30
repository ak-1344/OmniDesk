"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Lightbulb, LayoutList, LayoutGridIcon, Plus, Filter, Search } from "lucide-react"
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
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow } from "date-fns"

export default function IdeasPage() {
  const { state, addIdea, deleteIdea } = useApp()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [newIdeaOpen, setNewIdeaOpen] = useState(false)
  const [newIdeaTitle, setNewIdeaTitle] = useState("")
  const [newIdeaContent, setNewIdeaContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")

  // Get unique tags from all ideas
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    state.ideas.forEach(idea => {
      idea.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [state.ideas])

  const handleCreateIdea = async () => {
    if (!newIdeaTitle.trim()) return
    await addIdea({
      title: newIdeaTitle.trim(),
      notes: newIdeaContent.trim() ? [{
        id: Date.now().toString(),
        type: 'text',
        content: newIdeaContent.trim(),
        createdAt: new Date().toISOString(),
        order: 0,
      }] : [],
    })
    setNewIdeaTitle("")
    setNewIdeaContent("")
    setNewIdeaOpen(false)
  }

  const handleDeleteIdea = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await deleteIdea(id)
  }

  const ideas = useMemo(() => {
    let filtered = state.ideas

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(idea =>
        idea.title?.toLowerCase().includes(query) ||
        idea.notes.some(n => n.content.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter(idea => idea.tags?.includes(selectedTag))
    }

    return filtered.map(idea => {
      // Find if this idea has been converted to any tasks
      const linkedTasks = state.tasks.filter(t => t.ideaId === idea.id)
      const domain = linkedTasks.length > 0
        ? state.domains.find(d => d.id === linkedTasks[0].domainId)
        : null

      return {
        id: idea.id,
        title: idea.title || 'Untitled Idea',
        summary: idea.notes.find(n => n.type === 'text')?.content.substring(0, 150) || 'No description',
        lastUpdated: formatDistanceToNow(new Date(idea.updatedAt), { addSuffix: false }) + ' ago',
        canvasEnabled: idea.canvasEnabled || false,
        taskCount: idea.convertedToTasks?.length || 0,
        tags: idea.tags || [],
        domain,
      }
    })
  }, [state.ideas, state.tasks, state.domains, searchQuery, selectedTag])

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-serif">Ideas</h1>
            <p className="text-xs text-muted-foreground">
              {ideas.length} idea{ideas.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
              <Input
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 w-[150px] text-xs"
              />
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="text-xs h-7 px-2">
                  <LayoutGridIcon className="size-3 mr-1" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="text-xs h-7 px-2">
                  <LayoutList className="size-3 mr-1" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button onClick={() => setNewIdeaOpen(true)} size="sm" className="h-8 text-xs">
              <Plus className="size-3 mr-1" />
              New Idea
            </Button>
          </div>
        </div>

        {ideas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Lightbulb className="size-10 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-1">No ideas found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search' : 'Start capturing your thoughts'}
              </p>
              <Button onClick={() => setNewIdeaOpen(true)} size="sm">
                <Plus className="size-3 mr-1" />
                Create Idea
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <Card className="border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all group h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="size-4 text-muted-foreground" />
                        {idea.domain && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4"
                            style={{ borderColor: idea.domain.color, color: idea.domain.color }}
                          >
                            {idea.domain.name}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/ideas/${idea.id}`}>Open</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => handleDeleteIdea(idea.id, e)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-base font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{idea.summary}</p>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex items-center gap-3">
                        {idea.canvasEnabled && (
                          <Badge variant="secondary" className="text-[8px] h-4">Canvas</Badge>
                        )}
                        {idea.taskCount > 0 && (
                          <span>{idea.taskCount} task{idea.taskCount > 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <span>{idea.lastUpdated}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <Card className="border-border/50 hover:border-primary/30 transition-all group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Lightbulb className="size-5 text-muted-foreground/50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium group-hover:text-primary truncate">{idea.title}</h3>
                        {idea.domain && (
                          <Badge
                            variant="outline"
                            className="text-[9px] h-4"
                            style={{ borderColor: idea.domain.color, color: idea.domain.color }}
                          >
                            {idea.domain.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{idea.summary}</p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      {idea.taskCount > 0 && <span>{idea.taskCount} tasks</span>}
                      <span>{idea.lastUpdated}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                        <Button variant="ghost" size="icon" className="size-7 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/ideas/${idea.id}`}>Open</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => handleDeleteIdea(idea.id, e)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New Idea Dialog */}
      <Dialog open={newIdeaOpen} onOpenChange={setNewIdeaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Idea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="What's the idea?"
              value={newIdeaTitle}
              onChange={(e) => setNewIdeaTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="Add some notes (optional)..."
              value={newIdeaContent}
              onChange={(e) => setNewIdeaContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewIdeaOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateIdea} disabled={!newIdeaTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
