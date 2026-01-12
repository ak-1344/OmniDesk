# MongoDB Sync Setup - AP Pattern Implementation

## Overview

OmniDesk now implements a **MongoDB-first with localStorage backup** strategy following the **AP pattern** from the CAP theorem (Availability + Partition tolerance). This ensures:

- ✅ **Availability**: App remains functional even when MongoDB is offline
- ✅ **Partition Tolerance**: System continues to work despite network failures
- ✅ **Eventual Consistency**: Changes sync to MongoDB when connection is restored

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Application                        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Storage Factory │
              │   (sync mode)    │
              └────────┬─────────┘
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌───────────────┐            ┌────────────────┐
│   MongoDB     │  ◄────┐    │  localStorage  │
│  (Primary)    │       │    │   (Backup)     │
└───────────────┘       │    └────────────────┘
        │               │             │
        │     Sync      │             │
        │   Manager     │             │
        └───────────────┘─────────────┘
```

### How It Works

#### 1. **Initialization (When App Starts)**
   - localStorage is initialized first (always available)
   - Attempts to connect to MongoDB
   - If MongoDB is online:
     - Fetches all data from MongoDB
     - Hydrates localStorage with MongoDB data
     - Starts real-time sync subscriptions
     - Syncs any pending local changes to MongoDB
   - If MongoDB is offline:
     - Uses cached data from localStorage
     - Queues all mutations for later sync

#### 2. **Reading Data**
   - All read operations use **localStorage** (fast, always available)
   - MongoDB data is synced to localStorage in the background
   - Real-time updates from MongoDB update localStorage automatically

#### 3. **Writing Data (CRUD Operations)**
   - All mutations happen on localStorage **first** (instant response)
   - Mutations are queued for MongoDB sync
   - When online: Queue syncs to MongoDB immediately
   - When offline: Queue persists in localStorage, syncs when connection restored

#### 4. **Sync Behavior**
   - Background sync runs every 30 seconds (configurable)
   - Automatic retry on connection failure
   - Real-time subscriptions keep data fresh when online
   - Online/offline status displayed in UI

## Configuration

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Backend API URL (MongoDB)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Storage backend - use 'sync' for MongoDB-first with localStorage backup
NEXT_PUBLIC_STORAGE_BACKEND=sync

# Enable offline mode
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true

# Sync interval (milliseconds)
NEXT_PUBLIC_SYNC_INTERVAL_MS=30000
```

### Storage Backend Options

| Mode | Description | Use Case |
|------|-------------|----------|
| `sync` | **MongoDB primary + localStorage backup** (Default) | Production - Best availability |
| `mongodb` | MongoDB only (no localStorage) | Testing MongoDB integration |
| `localstorage` | localStorage only (no MongoDB) | Offline-only development |

## Features

### 1. Online/Offline Status Indicator

The UI now displays connection status in the header:

- 🟢 **Online**: Connected to MongoDB, all changes synced
- 🔵 **Syncing**: Currently syncing changes to MongoDB
- 🟡 **Pending**: N changes waiting to sync
- 🔴 **Offline**: MongoDB disconnected, using local storage only

### 2. Automatic Conflict Resolution

- **Last Write Wins**: MongoDB data takes precedence during initial fetch
- **Local First**: User changes are applied immediately to localStorage
- **Background Sync**: Local changes sync to MongoDB asynchronously
- **Real-time Updates**: MongoDB changes are pulled and merged into localStorage

### 3. Resilient to Network Failures

- App continues working during network outages
- All changes are queued locally
- Automatic reconnection attempts every 30 seconds
- Changes sync when connection is restored

## CRUD Operations

All CRUD operations work seamlessly in both online and offline modes:

### Create
```typescript
// Add a new task
const newTask = await addTask({
  title: "New Task",
  description: "Task description",
  domainId: "domain-id",
  state: "gotta-start"
});

// ✅ Task added to localStorage immediately
// ✅ Queued for MongoDB sync
// ✅ Syncs to MongoDB when online
```

### Read
```typescript
// Get all tasks
const tasks = await getTasks();

// ✅ Always reads from localStorage (fast)
// ✅ MongoDB updates sync to localStorage in background
```

### Update
```typescript
// Update a task
await updateTask("task-id", {
  state: "in-progress",
  title: "Updated Title"
});

// ✅ localStorage updated immediately
// ✅ Change queued for MongoDB
// ✅ Syncs when online
```

### Delete
```typescript
// Delete a task
await deleteTask("task-id");

// ✅ Moved to trash in localStorage
// ✅ Delete queued for MongoDB
// ✅ Syncs when online
```

## Monitoring Sync Status

### In Components

```typescript
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { syncStatus } = useApp();
  
  console.log(syncStatus.isOnline);        // true/false
  console.log(syncStatus.pendingChanges);   // number
  console.log(syncStatus.isSyncing);        // true/false
  
  return (
    <div>
      {syncStatus.isOnline ? 'Online' : 'Offline'}
      {syncStatus.pendingChanges > 0 && (
        <span>{syncStatus.pendingChanges} pending changes</span>
      )}
    </div>
  );
}
```

### Programmatically

```typescript
import { getSyncStatus, onSyncStatusChange } from '@/lib/sync';

// Get current status
const status = getSyncStatus();

// Subscribe to status changes
const unsubscribe = onSyncStatusChange((newStatus) => {
  console.log('Sync status changed:', newStatus);
});

// Cleanup
unsubscribe();
```

## Backend Setup

### Prerequisites

1. MongoDB instance running
2. Backend API server running on port 3001
3. Backend configured with MongoDB connection

### Starting the Backend

```bash
cd backend
npm install
npm run dev
```

The backend should expose these endpoints:
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- Similar endpoints for domains, ideas, events, settings, trash
- `GET /api/realtime` - Server-sent events for real-time updates

## Testing

### Test Offline Mode

1. Start the app with MongoDB backend running
2. Verify online status indicator shows "Online"
3. Create/update some data
4. Stop the MongoDB backend
5. Status should change to "Offline"
6. Continue creating/updating data
7. Verify changes are queued (pending count increases)
8. Restart MongoDB backend
9. Watch status change to "Syncing" then "Online"
10. Verify pending changes sync to MongoDB

### Test Initial Load

1. Add data via MongoDB backend directly
2. Clear localStorage in browser
3. Refresh app
4. Verify data loads from MongoDB
5. Verify localStorage is populated with MongoDB data

### Test Real-time Sync

1. Open app in two browser tabs
2. Make changes in tab 1
3. Verify changes appear in tab 2 (via real-time subscription)
4. Both tabs should stay in sync

## Troubleshooting

### App shows "Offline" but MongoDB is running

- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is accessible at the configured URL
- Check browser console for connection errors

### Changes not syncing to MongoDB

- Check sync status - are there pending changes?
- Verify backend API is responding
- Check browser console for sync errors
- Increase `NEXT_PUBLIC_SYNC_INTERVAL_MS` if needed

### Data conflicts between localStorage and MongoDB

- Clear localStorage: `localStorage.clear()`
- Refresh app to reload from MongoDB
- The latest data from MongoDB will be used

### Sync queue growing too large

- Check backend connectivity
- Verify API endpoints are working
- Clear sync queue manually if needed: `localStorage.removeItem('omniDesk_syncQueue')`

## Performance Considerations

### Read Performance
- ✅ **Instant**: All reads from localStorage (no network delay)
- ✅ **Scalable**: Works with large datasets

### Write Performance
- ✅ **Instant**: Writes to localStorage first (no blocking)
- ✅ **Async Sync**: MongoDB sync happens in background

### Storage Usage
- localStorage: ~5-10MB typical usage
- MongoDB: Unlimited
- Sync queue: Minimal (cleared after successful sync)

## Security Notes

- All MongoDB communication over HTTPS in production
- User authentication required for backend API
- localStorage data is browser-specific (not shared)
- Sync queue encrypted in transit

## Migration Guide

### From localStorage-only to Sync Mode

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_STORAGE_BACKEND=sync
   ```
2. Restart the app
3. Existing localStorage data will sync to MongoDB automatically
4. No data loss during migration

### From MongoDB-only to Sync Mode

1. Update `.env.local`:
   ```env
   NEXT_PUBLIC_STORAGE_BACKEND=sync
   ```
2. Restart the app
3. MongoDB data will populate localStorage on first load
4. Seamless migration

## Benefits Summary

✅ **Always Available**: App works offline, changes sync when online
✅ **Fast Performance**: All operations use localStorage (instant response)
✅ **Data Persistence**: MongoDB ensures data survives browser cache clears
✅ **Real-time Updates**: Changes from other devices sync automatically
✅ **Conflict-Free**: Automatic conflict resolution via last-write-wins
✅ **User-Friendly**: Online/offline status clearly displayed
✅ **Developer-Friendly**: Simple API, works exactly like before
✅ **Scalable**: Handles large datasets efficiently

## Advanced Configuration

### Custom Sync Strategy

You can modify the sync behavior in [lib/sync.ts](../lib/sync.ts):

- Adjust retry intervals
- Change conflict resolution strategy
- Add custom sync filters
- Implement selective sync

### Debugging Sync

Enable verbose logging:

```typescript
// In lib/sync.ts
console.log('🔄 Syncing:', item);
console.log('✅ Synced:', successfulSyncs.length);
console.log('❌ Failed:', failures.length);
```

## Future Enhancements

- [ ] Selective sync (sync only specific entities)
- [ ] Compression for sync queue
- [ ] Delta sync (only send changes, not full objects)
- [ ] Conflict resolution UI
- [ ] Sync analytics dashboard
- [ ] Progressive Web App (PWA) support
- [ ] Background sync via Service Workers

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment configuration
3. Test backend connectivity
4. Review sync queue in localStorage
5. Open GitHub issue with details
