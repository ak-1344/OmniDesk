"use client";

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getSyncStatus, onSyncStatusChange, type SyncStatus } from '@/lib/sync';

export function OnlineStatusIndicator() {
  const [status, setStatus] = useState<SyncStatus>({ 
    isOnline: false, 
    pendingChanges: 0, 
    isSyncing: false 
  });

  useEffect(() => {
    // Get initial status
    const initialStatus = getSyncStatus();
    setStatus(initialStatus);

    // Subscribe to status changes
    const unsubscribe = onSyncStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getStatusColor = () => {
    if (!status.isOnline) return 'bg-red-500/10 text-red-600 border-red-500/20';
    if (status.isSyncing) return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    if (status.pendingChanges > 0) return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    return 'bg-green-500/10 text-green-600 border-green-500/20';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return <CloudOff className="h-3 w-3" />;
    if (status.isSyncing) return <RefreshCw className="h-3 w-3 animate-spin" />;
    return <Cloud className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (status.isSyncing) return 'Syncing...';
    if (status.pendingChanges > 0) return `${status.pendingChanges} pending`;
    return 'Online';
  };

  const getTooltipText = () => {
    if (!status.isOnline) {
      return 'MongoDB disconnected - Using local storage only. Changes will sync when connection is restored.';
    }
    if (status.isSyncing) {
      return 'Syncing changes to MongoDB...';
    }
    if (status.pendingChanges > 0) {
      return `Connected to MongoDB. ${status.pendingChanges} change${status.pendingChanges > 1 ? 's' : ''} waiting to sync.`;
    }
    return 'Connected to MongoDB - All changes synced';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${getStatusColor()} cursor-help transition-colors gap-1.5 text-xs font-medium`}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-sm">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
