"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CheckSquare, RotateCcw, X, Trash2 } from "lucide-react"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow } from "date-fns"

export default function TrashPage() {
  const { trash, restoreFromTrash, permanentlyDelete, emptyTrash } = useApp()

  const handleRestore = async (id: string) => {
    await restoreFromTrash(id)
  }

  const handlePermanentDelete = async (id: string) => {
    if (confirm('Permanently delete this item? This cannot be undone.')) {
      await permanentlyDelete(id)
    }
  }

  const handleEmptyTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all items in trash?')) {
      await emptyTrash()
    }
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium mb-1">Trash</h1>
            <p className="text-sm text-muted-foreground">
              Items here are set aside. Restore or remove them when ready.
            </p>
          </div>
          {trash.length > 0 && (
            <Button variant="outline" onClick={handleEmptyTrash} className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              Empty Trash
            </Button>
          )}
        </div>

        {trash.length === 0 ? (
          <Empty className="py-16 border">
            <EmptyMedia variant="icon">
              <Trash2 className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nothing in trash</EmptyTitle>
              <EmptyDescription>Deleted items will appear here. Everything is reversible.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {trash.map((item) => (
              <Card key={item.id} className="border-border/50 hover:border-accent/30 transition-colors group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {item.type === "idea" ? (
                      <div className="size-10 bg-muted flex items-center justify-center rounded-lg">
                        <Lightbulb className="size-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="size-10 bg-muted flex items-center justify-center rounded-lg">
                        <CheckSquare className="size-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {'title' in item.item ? item.item.title : 'Untitled'}
                      </h3>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleRestore(item.id)}
                    >
                      <RotateCcw className="size-3" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-muted-foreground hover:text-destructive"
                      onClick={() => handlePermanentDelete(item.id)}
                    >
                      <X className="size-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
