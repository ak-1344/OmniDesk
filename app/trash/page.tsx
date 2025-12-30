"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, CheckSquare, RotateCcw, X, Trash2, Clock, AlertTriangle } from "lucide-react"
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useApp } from "@/context/AppContext"
import { formatDistanceToNow, differenceInDays, addDays } from "date-fns"

export default function TrashPage() {
  const { trash, restoreFromTrash, permanentlyDelete, emptyTrash, state } = useApp()

  const retentionDays = state.settings.trashRetentionDays || 30

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

  // Calculate days until deletion for each item
  const getExpirationInfo = (deletedAt: string) => {
    const deleteDate = new Date(deletedAt)
    const expirationDate = addDays(deleteDate, retentionDays)
    const daysLeft = differenceInDays(expirationDate, new Date())

    if (daysLeft <= 0) {
      return { daysLeft: 0, isUrgent: true, label: "Expiring soon" }
    } else if (daysLeft <= 7) {
      return { daysLeft, isUrgent: true, label: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` }
    } else {
      return { daysLeft, isUrgent: false, label: `${daysLeft} days left` }
    }
  }

  // Group trash by type
  const taskItems = trash.filter(item => item.type === 'task')
  const ideaItems = trash.filter(item => item.type === 'idea')
  const otherItems = trash.filter(item => item.type !== 'task' && item.type !== 'idea')

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium mb-1">Trash</h1>
            <p className="text-sm text-muted-foreground">
              Items are automatically deleted after {retentionDays} days. Restore or remove them anytime.
            </p>
          </div>
          {trash.length > 0 && (
            <Button variant="outline" onClick={handleEmptyTrash} className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              Empty Trash
            </Button>
          )}
        </div>

        {/* Summary stats */}
        {trash.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{trash.length} item{trash.length !== 1 ? 's' : ''}</span>
            {taskItems.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <CheckSquare className="size-3" />
                {taskItems.length} task{taskItems.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {ideaItems.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Lightbulb className="size-3" />
                {ideaItems.length} idea{ideaItems.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {trash.length === 0 ? (
          <Empty className="py-16 border">
            <EmptyMedia variant="icon">
              <Trash2 className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>Nothing in trash</EmptyTitle>
              <EmptyDescription>Deleted items will appear here. Everything is reversible for {retentionDays} days.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {trash.map((item) => {
              const expiration = getExpirationInfo(item.deletedAt)
              return (
                <Card key={item.id} className="border-border/50 hover:border-accent/30 transition-colors group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {item.type === "idea" ? (
                        <div className="size-12 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 flex items-center justify-center rounded-xl border border-yellow-500/20">
                          <Lightbulb className="size-5 text-yellow-600" />
                        </div>
                      ) : (
                        <div className="size-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center rounded-xl border border-blue-500/20">
                          <CheckSquare className="size-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {'title' in item.item ? item.item.title : 'Untitled'}
                        </h3>
                        <Badge variant="outline" className="text-[10px] font-normal capitalize">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Deleted {formatDistanceToNow(new Date(item.deletedAt), { addSuffix: true })}
                        </span>
                        <span className={`flex items-center gap-1 ${expiration.isUrgent ? 'text-orange-500 font-medium' : ''}`}>
                          {expiration.isUrgent && <AlertTriangle className="size-3" />}
                          {expiration.label}
                        </span>
                      </div>
                      {'description' in item.item && item.item.description && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-1">
                          {item.item.description.substring(0, 100)}
                        </p>
                      )}
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
                        Delete Forever
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
