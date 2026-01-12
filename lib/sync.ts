// Sync module for localStorage ↔ MongoDB consistency
// Handles offline-first storage with background sync when connection available

import type { IDataStorage } from './storage.interface';
import { LocalStorageAdapter } from './storage.localstorage';
import { MongoDBAdapter } from './storage.mongodb';
import type { Task, Idea, CalendarEvent } from '@/types';

interface SyncQueueItem {
    id: string;
    operation: 'create' | 'update' | 'delete';
    entity: 'task' | 'idea' | 'domain' | 'event' | 'settings' | 'trash';
    data: any;
    timestamp: number;
}

class SyncManager {
    private localStorage: LocalStorageAdapter;
    private mongoAdapter: MongoDBAdapter | null = null;
    private syncQueue: SyncQueueItem[] = [];
    private isOnline: boolean = false;
    private syncInProgress: boolean = false;
    private listeners: ((status: SyncStatus) => void)[] = [];
    private taskSubscribers: Array<(tasks: Task[]) => void> = [];
    private ideaSubscribers: Array<(ideas: Idea[]) => void> = [];
    private eventSubscribers: Array<(events: CalendarEvent[]) => void> = [];
    private realtimeUnsubscribers: Array<() => void> = [];

    constructor() {
        this.localStorage = new LocalStorageAdapter();
        this.loadSyncQueue();
    }

    async initialize(): Promise<IDataStorage> {
        // Always initialize localStorage first (it's always available for backup)
        await this.localStorage.initialize();

        // Try to connect to MongoDB and fetch data
        try {
            this.mongoAdapter = new MongoDBAdapter();
            await this.mongoAdapter.initialize();
            this.isOnline = true;
            console.log('✅ MongoDB connected - fetching data from remote...');

            // AP Pattern: Fetch from MongoDB first (Availability + Partition tolerance)
            await this.fetchFromMongoDB();

            // Start background sync
            this.startBackgroundSync();

            // Start realtime subscriptions to pull remote changes
            this.startRealtimeSubscriptions();

            // Sync any pending local changes to MongoDB
            await this.syncPendingChanges();
        } catch (error) {
            console.log('⚠️ MongoDB unavailable, using localStorage only (offline mode)');
            this.isOnline = false;
        }

        // Return a proxy that uses localStorage but queues changes for MongoDB
        return this.createSyncProxy();
    }

    private createSyncProxy(): IDataStorage {
        const self = this;

        return new Proxy(this.localStorage, {
            get(target, prop: string) {
                const value = (target as any)[prop];

                if (prop === 'subscribeToTasks') {
                    return self.subscribeToTasks.bind(self);
                }

                if (prop === 'subscribeToIdeas') {
                    return self.subscribeToIdeas.bind(self);
                }

                if (prop === 'subscribeToEvents') {
                    return self.subscribeToEvents.bind(self);
                }

                if (typeof value !== 'function') {
                    return value;
                }

                // Wrap mutating operations to queue for sync
                const mutatingOps = [
                    'addTask', 'updateTask', 'deleteTask',
                    'addIdea', 'updateIdea', 'deleteIdea',
                    'addDomain', 'updateDomain', 'deleteDomain',
                    'addCalendarEvent', 'updateCalendarEvent', 'deleteCalendarEvent',
                    'addSubtask', 'updateSubtask', 'deleteSubtask',
                    'updateSettings',
                    'restoreFromTrash', 'permanentlyDelete', 'emptyTrash'
                ];

                if (mutatingOps.includes(prop)) {
                    return async (...args: any[]) => {
                        // Execute on localStorage first
                        const result = await value.apply(target, args);

                        // Queue for MongoDB sync
                        self.queueForSync(prop, args, result);

                        return result;
                    };
                }

                return value.bind(target);
            }
        });
    }

    private queueForSync(operation: string, args: any[], result: any) {
        const item: SyncQueueItem = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            operation: this.getOperationType(operation),
            entity: this.getEntityType(operation),
            data: { operation, args, result },
            timestamp: Date.now(),
        };

        this.syncQueue.push(item);
        this.saveSyncQueue();
        this.notifyListeners();

        // Try to sync immediately if online
        if (this.isOnline && !this.syncInProgress) {
            this.syncPendingChanges();
        }
    }

    private getOperationType(op: string): 'create' | 'update' | 'delete' {
        if (op.startsWith('add') || op.startsWith('restore')) return 'create';
        if (op.startsWith('delete') || op.startsWith('permanently') || op.startsWith('empty')) return 'delete';
        return 'update';
    }

    private getEntityType(op: string): SyncQueueItem['entity'] {
        if (op.includes('Task') || op.includes('Subtask')) return 'task';
        if (op.includes('Idea')) return 'idea';
        if (op.includes('Domain')) return 'domain';
        if (op.includes('Event') || op.includes('Calendar')) return 'event';
        if (op.includes('Settings')) return 'settings';
        return 'trash';
    }

    async syncPendingChanges(): Promise<void> {
        if (!this.isOnline || !this.mongoAdapter || this.syncInProgress) return;
        if (this.syncQueue.length === 0) return;

        this.syncInProgress = true;
        this.notifyListeners();

        const successfulSyncs: string[] = [];

        for (const item of this.syncQueue) {
            try {
                const { operation, args } = item.data;
                const mongoMethod = (this.mongoAdapter as any)[operation];

                if (typeof mongoMethod === 'function') {
                    await mongoMethod.apply(this.mongoAdapter, args);
                    successfulSyncs.push(item.id);
                }
            } catch (error) {
                console.error('Sync failed for item:', item.id, error);
                // Mark as offline if connection failed
                if ((error as any).message?.includes('fetch')) {
                    this.isOnline = false;
                    break;
                }
            }
        }

        // Remove successfully synced items
        this.syncQueue = this.syncQueue.filter(item => !successfulSyncs.includes(item.id));
        this.saveSyncQueue();

        this.syncInProgress = false;
        this.notifyListeners();
    }

    private async fetchFromMongoDB(): Promise<void> {
        if (!this.mongoAdapter || !this.isOnline) return;

        try {
            console.log('📥 Fetching data from MongoDB...');
            
            // Fetch all data from MongoDB
            const [domains, tasks, ideas, ideaFolders, events, settings, trash] = await Promise.all([
                this.mongoAdapter.getDomains().catch(() => []),
                this.mongoAdapter.getTasks().catch(() => []),
                this.mongoAdapter.getIdeas().catch(() => []),
                this.mongoAdapter.getIdeaFolders().catch(() => []),
                this.mongoAdapter.getCalendarEvents().catch(() => []),
                this.mongoAdapter.getSettings().catch(() => this.localStorage.getSettings()),
                this.mongoAdapter.getTrash().catch(() => []),
            ]);

            // Hydrate localStorage with MongoDB data
            this.localStorage.hydrateFromRemote(
                { domains, tasks, ideas, ideaFolders, events, settings },
                trash
            );

            console.log('✅ Successfully loaded data from MongoDB');
        } catch (error) {
            console.error('❌ Failed to fetch from MongoDB:', error);
            console.log('📦 Using cached localStorage data');
            this.isOnline = false;
        }
    }

    private startBackgroundSync() {
        // Check connection and sync every 30 seconds
        setInterval(async () => {
            if (!this.isOnline) {
                // Try to reconnect
                try {
                    this.mongoAdapter = new MongoDBAdapter();
                    await this.mongoAdapter.initialize();
                    this.isOnline = true;
                    console.log('✅ MongoDB reconnected');
                    this.startRealtimeSubscriptions();
                    await this.syncPendingChanges();
                } catch {
                    // Still offline
                }
            } else {
                await this.syncPendingChanges();
            }
            this.notifyListeners();
        }, 30000);
    }

    private loadSyncQueue() {
        try {
            const saved = localStorage.getItem('omniDesk_syncQueue');
            if (saved) {
                this.syncQueue = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load sync queue:', e);
            this.syncQueue = [];
        }
    }

    private saveSyncQueue() {
        try {
            localStorage.setItem('omniDesk_syncQueue', JSON.stringify(this.syncQueue));
        } catch (e) {
            console.error('Failed to save sync queue:', e);
        }
    }

    getStatus(): SyncStatus {
        return {
            isOnline: this.isOnline,
            pendingChanges: this.syncQueue.length,
            isSyncing: this.syncInProgress,
        };
    }

    onStatusChange(callback: (status: SyncStatus) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    // Real-time subscription helpers (powered by MongoDB change streams when online)
    private startRealtimeSubscriptions() {
        if (!this.mongoAdapter) return;
        if (this.realtimeUnsubscribers.length) return;

        const taskUnsub = this.mongoAdapter.subscribeToTasks?.((tasks) => {
            this.localStorage.hydrateFromRemote({ tasks });
            this.taskSubscribers.forEach(cb => cb(tasks));
        });

        if (taskUnsub) {
            this.realtimeUnsubscribers.push(taskUnsub);
        }

        const ideaUnsub = this.mongoAdapter.subscribeToIdeas?.((ideas) => {
            this.localStorage.hydrateFromRemote({ ideas });
            this.ideaSubscribers.forEach(cb => cb(ideas));
        });

        if (ideaUnsub) {
            this.realtimeUnsubscribers.push(ideaUnsub);
        }

        const eventUnsub = this.mongoAdapter.subscribeToEvents?.((events) => {
            this.localStorage.hydrateFromRemote({ events });
            this.eventSubscribers.forEach(cb => cb(events));
        });

        if (eventUnsub) {
            this.realtimeUnsubscribers.push(eventUnsub);
        }
    }

    private subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
        this.taskSubscribers.push(callback);
        this.startRealtimeSubscriptions();
        return () => {
            this.taskSubscribers = this.taskSubscribers.filter(cb => cb !== callback);
        };
    }

    private subscribeToIdeas(callback: (ideas: Idea[]) => void): () => void {
        this.ideaSubscribers.push(callback);
        this.startRealtimeSubscriptions();
        return () => {
            this.ideaSubscribers = this.ideaSubscribers.filter(cb => cb !== callback);
        };
    }

    private subscribeToEvents(callback: (events: CalendarEvent[]) => void): () => void {
        this.eventSubscribers.push(callback);
        this.startRealtimeSubscriptions();
        return () => {
            this.eventSubscribers = this.eventSubscribers.filter(cb => cb !== callback);
        };
    }

    private notifyListeners() {
        const status = this.getStatus();
        this.listeners.forEach(l => l(status));
    }
}

export interface SyncStatus {
    isOnline: boolean;
    pendingChanges: number;
    isSyncing: boolean;
}

// Singleton instance
let syncManager: SyncManager | null = null;

export async function getSyncStorage(): Promise<IDataStorage> {
    if (!syncManager) {
        syncManager = new SyncManager();
    }
    return syncManager.initialize();
}

export function getSyncStatus(): SyncStatus {
    if (!syncManager) {
        return { isOnline: false, pendingChanges: 0, isSyncing: false };
    }
    return syncManager.getStatus();
}

export function onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
    if (!syncManager) {
        return () => { };
    }
    return syncManager.onStatusChange(callback);
}
