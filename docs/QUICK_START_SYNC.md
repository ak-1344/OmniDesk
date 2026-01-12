# Quick Start: MongoDB Sync Mode

## 🚀 Get Started in 3 Steps

### Step 1: Configure Environment

Create `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STORAGE_BACKEND=sync
```

### Step 2: Start MongoDB Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:3001

### Step 3: Start Frontend

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:3000

## ✅ Verify Setup

1. Open http://localhost:3000
2. Check top-right corner for status indicator:
   - 🟢 **Online** = Connected to MongoDB ✅
   - 🔴 **Offline** = Using localStorage only

## 📝 Usage

### All operations work the same:

```typescript
// Create
await addTask({ title: "New Task", ... });

// Read
const tasks = await getTasks();

// Update
await updateTask(id, { title: "Updated" });

// Delete
await deleteTask(id);
```

### Key Behaviors:

- **Online**: 
  - ✅ Reads from localStorage (fast)
  - ✅ Writes to localStorage + MongoDB
  - ✅ Real-time sync active

- **Offline**: 
  - ✅ Reads from localStorage (fast)
  - ✅ Writes to localStorage
  - ✅ Changes queued for sync
  - ✅ Auto-sync when back online

## 🧪 Test Offline Mode

1. Start with backend running (should show "Online")
2. Create some tasks/ideas
3. Stop the backend: `Ctrl+C` in backend terminal
4. Status changes to "Offline" 
5. Create more tasks (they still work!)
6. Restart backend: `npm run dev`
7. Status changes to "Syncing..." then "Online"
8. All offline changes sync automatically ✨

## 🎯 Quick Tips

- **Always Available**: App works even when MongoDB is down
- **Fast**: All operations use localStorage (instant)
- **Persistent**: Data saved to MongoDB when online
- **Status**: Check top-right indicator for connection status
- **Sync**: Happens automatically every 30 seconds

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Shows "Offline" | Check backend is running on port 3001 |
| Changes not syncing | Check browser console for errors |
| Old data showing | Clear localStorage and refresh |
| Sync queue growing | Verify backend API is accessible |

## 📚 More Information

See [MONGODB_SYNC_SETUP.md](./MONGODB_SYNC_SETUP.md) for detailed documentation.

## 🎉 You're Ready!

Your app now has:
- ✅ MongoDB as primary database
- ✅ localStorage as backup/cache
- ✅ Offline-first capability
- ✅ Automatic sync
- ✅ Real-time updates
- ✅ AP pattern (Availability + Partition tolerance)

Happy building! 🚀
