"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, GripVertical, Plus, Trash2, Check, X, Pencil } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { getSyncStatus, onSyncStatusChange, type SyncStatus } from "@/lib/sync"

export default function SettingsPage() {
  const { state, updateSettings, addDomain, updateDomain, deleteDomain } = useApp()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ isOnline: false, pendingChanges: 0, isSyncing: false })
  const [newDomainName, setNewDomainName] = useState("")
  const [newDomainColor, setNewDomainColor] = useState("#667eea")
  const [editingDomainId, setEditingDomainId] = useState<string | null>(null)
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [userName, setUserName] = useState(state.settings.user?.name || "User")
  const [userEmail, setUserEmail] = useState(state.settings.user?.email || "")
  const [draggedDomainId, setDraggedDomainId] = useState<string | null>(null)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)

  useEffect(() => {
    try {
      setSyncStatus(getSyncStatus())
      const unsubscribe = onSyncStatusChange(setSyncStatus)
      return unsubscribe
    } catch (e) {
      // Sync module not initialized yet
    }
  }, [])

  useEffect(() => {
    setUserName(state.settings.user?.name || "User")
    setUserEmail(state.settings.user?.email || "")
  }, [state.settings.user])

  // Get domains in order
  const orderedDomains = [...state.domains].sort((a, b) => {
    const orderA = state.settings.domainOrder?.indexOf(a.id) ?? 999
    const orderB = state.settings.domainOrder?.indexOf(b.id) ?? 999
    return orderA - orderB
  })

  // Get kanban columns
  const kanbanColumns = state.settings.kanbanColumns || [
    { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
    { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
    { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
    { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
  ]

  const handleExportData = () => {
    const data = {
      ...state,
      exportedAt: new Date().toISOString(),
      version: "2.0",
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omnidesk-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'auto') => {
    await updateSettings({ theme })
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleSaveUserProfile = async () => {
    await updateSettings({
      user: {
        ...state.settings.user,
        name: userName.trim() || 'User',
        email: userEmail.trim(),
      }
    })
  }

  const handleAddDomain = async () => {
    if (!newDomainName.trim()) return
    await addDomain({
      name: newDomainName.trim(),
      color: newDomainColor,
      description: '',
    })
    // Update domain order
    const newOrder = [...(state.settings.domainOrder || []), Date.now().toString()]
    await updateSettings({ domainOrder: newOrder })
    setNewDomainName("")
    setNewDomainColor("#667eea")
  }

  const handleDeleteDomain = async (id: string) => {
    if (confirm('Delete this domain? Tasks in this domain will remain but lose their domain assignment.')) {
      await deleteDomain(id)
      // Update domain order
      const newOrder = (state.settings.domainOrder || []).filter(domainId => domainId !== id)
      await updateSettings({ domainOrder: newOrder })
    }
  }

  const handleDomainDrop = async (targetId: string) => {
    if (!draggedDomainId || draggedDomainId === targetId) return

    const currentOrder = state.settings.domainOrder || orderedDomains.map(d => d.id)
    const draggedIndex = currentOrder.indexOf(draggedDomainId)
    const targetIndex = currentOrder.indexOf(targetId)

    const newOrder = [...currentOrder]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedDomainId)

    await updateSettings({ domainOrder: newOrder })
    setDraggedDomainId(null)
  }

  const handleColumnDrop = async (targetId: string) => {
    if (!draggedColumnId || draggedColumnId === targetId) return

    const currentColumns = [...kanbanColumns]
    const draggedIndex = currentColumns.findIndex(c => c.id === draggedColumnId)
    const targetIndex = currentColumns.findIndex(c => c.id === targetId)

    const [draggedCol] = currentColumns.splice(draggedIndex, 1)
    currentColumns.splice(targetIndex, 0, draggedCol)

    // Update order field
    const newColumns = currentColumns.map((col, idx) => ({ ...col, order: idx }))
    await updateSettings({ kanbanColumns: newColumns })
    setDraggedColumnId(null)
  }

  const handleUpdateColumn = async (id: string, updates: { label?: string; color?: string }) => {
    const newColumns = kanbanColumns.map(col =>
      col.id === id ? { ...col, ...updates } : col
    )
    await updateSettings({ kanbanColumns: newColumns })
    setEditingColumnId(null)
  }

  return (
    <div className="h-full w-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Sync Status */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Sync Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`size-3 rounded-full ${syncStatus.isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium">{syncStatus.isOnline ? 'Connected' : 'Offline Mode'}</p>
                  <p className="text-xs text-muted-foreground">
                    {syncStatus.pendingChanges > 0
                      ? `${syncStatus.pendingChanges} pending`
                      : 'All synced'}
                  </p>
                </div>
              </div>
              {syncStatus.isSyncing && <Badge variant="secondary" className="text-xs">Syncing...</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* User Profile */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your personal information for a personalized experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={handleSaveUserProfile}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  onBlur={handleSaveUserProfile}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domains */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Domains</CardTitle>
            <CardDescription>Organize tasks by life areas. Drag to reorder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {orderedDomains.map(domain => (
              <div
                key={domain.id}
                draggable
                onDragStart={() => setDraggedDomainId(domain.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDomainDrop(domain.id)}
                className={`flex items-center gap-3 p-2 rounded-lg border border-border/50 group cursor-grab active:cursor-grabbing transition-all ${draggedDomainId === domain.id ? 'opacity-50' : ''
                  }`}
              >
                <GripVertical className="size-4 text-muted-foreground/30" />
                {editingDomainId === domain.id ? (
                  <>
                    <Input
                      type="color"
                      value={domain.color}
                      onChange={(e) => updateDomain(domain.id, { color: e.target.value })}
                      className="w-10 h-8 p-0"
                    />
                    <Input
                      value={domain.name}
                      onChange={(e) => updateDomain(domain.id, { name: e.target.value })}
                      className="flex-1 h-8 text-sm"
                    />
                    <Input
                      value={domain.description || ''}
                      onChange={(e) => updateDomain(domain.id, { description: e.target.value })}
                      placeholder="Description"
                      className="flex-1 h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingDomainId(null)}>
                      <Check className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="size-5 rounded-full" style={{ backgroundColor: domain.color }} />
                    <span className="flex-1 text-sm font-medium">{domain.name}</span>
                    <span className="text-xs text-muted-foreground">{domain.description}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingDomainId(domain.id)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                      onClick={() => handleDeleteDomain(domain.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}

            {/* Add new domain */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/30">
              <Input
                type="color"
                value={newDomainColor}
                onChange={(e) => setNewDomainColor(e.target.value)}
                className="w-10 h-8 p-0"
              />
              <Input
                placeholder="New domain name..."
                value={newDomainName}
                onChange={(e) => setNewDomainName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                className="flex-1 h-8 text-sm"
              />
              <Button size="sm" onClick={handleAddDomain} disabled={!newDomainName.trim()} className="h-8">
                <Plus className="size-3 mr-1" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Columns */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kanban Columns</CardTitle>
            <CardDescription>Customize workflow stages. Drag to reorder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...kanbanColumns].sort((a, b) => a.order - b.order).map(column => (
              <div
                key={column.id}
                draggable
                onDragStart={() => setDraggedColumnId(column.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleColumnDrop(column.id)}
                className={`flex items-center gap-3 p-2 rounded-lg border border-border/50 group cursor-grab active:cursor-grabbing transition-all ${draggedColumnId === column.id ? 'opacity-50' : ''
                  }`}
              >
                <GripVertical className="size-4 text-muted-foreground/30" />
                {editingColumnId === column.id ? (
                  <>
                    <Input
                      type="color"
                      value={column.color}
                      onChange={(e) => handleUpdateColumn(column.id, { color: e.target.value })}
                      className="w-10 h-8 p-0"
                    />
                    <Input
                      defaultValue={column.label}
                      onBlur={(e) => handleUpdateColumn(column.id, { label: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateColumn(column.id, { label: (e.target as HTMLInputElement).value })
                        }
                      }}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingColumnId(null)}>
                      <Check className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="size-4 rounded-full" style={{ backgroundColor: column.color }} />
                    <span className="flex-1 text-sm font-medium">{column.label}</span>
                    <Badge variant="outline" className="text-[10px]">{column.id}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => setEditingColumnId(column.id)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground">Visual style</p>
              </div>
              <Select value={state.settings.theme} onValueChange={(v) => handleThemeChange(v as any)}>
                <SelectTrigger className="w-[120px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop Notifications</Label>
                <p className="text-xs text-muted-foreground">Task reminders</p>
              </div>
              <Switch
                checked={state.settings.notifications?.desktop ?? true}
                onCheckedChange={(checked) => updateSettings({
                  notifications: { ...state.settings.notifications, desktop: checked }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-14 flex flex-col gap-1" onClick={handleExportData}>
                <Download className="size-4" />
                <span className="text-[10px] uppercase tracking-wider font-bold">Export</span>
              </Button>
              <Button variant="outline" className="h-14 flex flex-col gap-1" disabled>
                <Upload className="size-4" />
                <span className="text-[10px] uppercase tracking-wider font-bold">Import</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Clear All Data</Label>
                <p className="text-xs text-muted-foreground">Permanently delete everything</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  if (confirm('Delete ALL data? This cannot be undone.')) {
                    localStorage.clear()
                    window.location.reload()
                  }
                }}
              >
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
