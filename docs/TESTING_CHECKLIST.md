# Testing Checklist for MongoDB Sync Implementation

## ✅ Pre-Flight Checks

- [ ] MongoDB container running (`docker ps`)
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 3000
- [ ] `.env.local` file created with `NEXT_PUBLIC_STORAGE_BACKEND=sync`

## 🧪 Test Scenarios

### 1. Initial Load (MongoDB → localStorage)

**Steps:**
1. Ensure backend is running with data
2. Clear browser localStorage (`localStorage.clear()` in console)
3. Refresh the app
4. Check status indicator shows "Online" (green)

**Expected Results:**
- ✅ Data loads from MongoDB
- ✅ localStorage populated with MongoDB data
- ✅ Status indicator shows "Online"
- ✅ Console logs show: "✅ MongoDB connected - fetching data from remote..."
- ✅ Console logs show: "✅ Successfully loaded data from MongoDB"

---

### 2. Online CRUD Operations

**Steps:**
1. Verify status shows "Online"
2. Create a new task
3. Update the task
4. Delete the task (moves to trash)
5. Restore from trash
6. Permanently delete

**Expected Results:**
- ✅ All operations complete instantly (no delay)
- ✅ Changes persist after page refresh
- ✅ Data visible in MongoDB (check via backend API or MongoDB client)
- ✅ Status remains "Online" throughout

---

### 3. Offline Mode

**Steps:**
1. Ensure status shows "Online"
2. Stop the backend server (Ctrl+C)
3. Wait 5-10 seconds
4. Check status indicator

**Expected Results:**
- ✅ Status changes to "Offline" (red)
- ✅ Console shows: "⚠️ MongoDB unavailable, using localStorage only (offline mode)"
- ✅ App remains functional

---

### 4. Offline CRUD Operations

**Steps (with backend stopped):**
1. Verify status shows "Offline"
2. Create a new task: "Offline Task 1"
3. Create another task: "Offline Task 2"
4. Update task 1 title to "Updated Offline Task"
5. Delete task 2

**Expected Results:**
- ✅ All operations complete instantly
- ✅ Data saved to localStorage
- ✅ Status shows pending count increasing (e.g., "3 pending")
- ✅ Sync queue visible in localStorage: `localStorage.getItem('omniDesk_syncQueue')`

---

### 5. Reconnection & Sync

**Steps:**
1. Ensure you have pending changes from Step 4
2. Note the pending count
3. Restart the backend server
4. Watch the status indicator

**Expected Results:**
- ✅ Status changes to "Syncing..." (blue with spinner)
- ✅ Console shows: "✅ MongoDB reconnected"
- ✅ After a few seconds, status changes to "Online" (green)
- ✅ Pending count drops to 0
- ✅ All offline changes are in MongoDB (verify via refresh)
- ✅ Sync queue cleared: `localStorage.getItem('omniDesk_syncQueue')` returns `[]`

---

### 6. Real-time Updates (Multi-Tab)

**Steps:**
1. Open app in Tab 1
2. Open app in Tab 2
3. In Tab 1, create a new task
4. Watch Tab 2

**Expected Results:**
- ✅ New task appears in Tab 2 automatically (within 1-2 seconds)
- ✅ Both tabs show "Online" status
- ✅ Real-time sync working

---

### 7. Data Persistence

**Steps:**
1. Ensure status is "Online"
2. Create several tasks, ideas, and events
3. Close the browser completely
4. Stop the backend
5. Reopen the browser and app

**Expected Results:**
- ✅ Status shows "Offline"
- ✅ All data still visible (from localStorage cache)
- ✅ App fully functional

---

### 8. MongoDB Data Priority

**Steps:**
1. With backend stopped, create task "Local Task 1"
2. Clear localStorage: `localStorage.clear()`
3. Restart backend
4. Refresh app

**Expected Results:**
- ✅ Status shows "Online"
- ✅ Data loads from MongoDB (not localStorage)
- ✅ "Local Task 1" is gone (wasn't synced)
- ✅ Only MongoDB data is shown

---

### 9. Background Sync

**Steps:**
1. Ensure status is "Online"
2. Create a task
3. Don't interact with the app for 30+ seconds
4. Open MongoDB or backend logs

**Expected Results:**
- ✅ Task syncs to MongoDB
- ✅ Backend receives sync request within 30 seconds
- ✅ No user intervention needed

---

### 10. Status Indicator Tooltip

**Steps:**
1. Hover over the status indicator in different states:
   - Online (green)
   - Offline (red)
   - Syncing (blue)
   - Pending (yellow)

**Expected Results:**
- ✅ Tooltip shows detailed status message
- ✅ Messages are clear and informative
- ✅ Tooltip updates when status changes

---

## 🔍 Manual Verification

### Check localStorage State
```javascript
// View current state
JSON.parse(localStorage.getItem('omniDesk_state'))

// View sync queue
JSON.parse(localStorage.getItem('omniDesk_syncQueue'))

// View trash
JSON.parse(localStorage.getItem('omniDesk_trash'))
```

### Check Sync Status Programmatically
```javascript
// In browser console
const { getSyncStatus } = await import('/lib/sync.ts');
console.log(getSyncStatus());
```

### Monitor Network Requests
1. Open DevTools → Network tab
2. Filter by `localhost:3001`
3. Perform CRUD operations
4. Verify API calls are made

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Status stuck on "Offline" | Backend not running | Start backend: `cd backend && npm run dev` |
| Changes not syncing | Backend unreachable | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Data not loading | MongoDB empty | Run `npm run seed` in backend |
| Pending count growing | Backend errors | Check backend logs for errors |
| Old data showing | localStorage stale | Clear localStorage and refresh |
| Status indicator not updating | Subscription failed | Refresh page |

---

## ✅ Success Criteria

All tests pass when:
- [x] App loads data from MongoDB when online
- [x] All CRUD operations work in online mode
- [x] App switches to offline mode when MongoDB unavailable
- [x] All CRUD operations work in offline mode
- [x] Changes queue when offline
- [x] Queued changes sync when connection restored
- [x] Status indicator reflects current state accurately
- [x] Real-time updates work across tabs
- [x] No data loss during offline → online transition
- [x] localStorage serves as reliable backup

---

## 📊 Performance Benchmarks

**Target Performance:**
- Initial load: < 2 seconds
- CRUD operations: < 100ms (instant)
- Offline → Online transition: < 5 seconds
- Background sync: Every 30 seconds
- Real-time update latency: < 2 seconds

**Measure in DevTools:**
1. Performance tab
2. Record while performing operations
3. Verify no blocking operations
4. Check network waterfall for efficiency

---

## 🎉 Test Complete!

If all tests pass, your MongoDB sync implementation is working correctly! 

**Next Steps:**
- Deploy to production
- Monitor sync performance
- Gather user feedback
- Consider adding conflict resolution UI

---

**Documentation References:**
- [Quick Start Guide](./QUICK_START_SYNC.md)
- [MongoDB Sync Setup](./MONGODB_SYNC_SETUP.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
