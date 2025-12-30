# OmniDesk Quick Start Guide

This guide will help you get OmniDesk running on your local machine with MongoDB integration.

## Prerequisites

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **Docker** for running MongoDB ([Download](https://www.docker.com/get-started))
- **Git** for cloning the repository

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/ak-1344/OmniDesk.git
cd OmniDesk
```

### 2. Start MongoDB

Using Docker (recommended):

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name omnidesk-mongodb mongo:latest

# Verify it's running
docker ps | grep omnidesk-mongodb
```

**Alternative:** If you have MongoDB installed locally, start it with:
```bash
mongod --dbpath /path/to/data
```

### 3. Set Up the Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The default .env should work, but you can customize:
# MONGODB_URI=mongodb://localhost:27017/
# MONGODB_DB_NAME=omnidesk
# PORT=3001
# FRONTEND_URL=http://localhost:5173

# Run the seed script to populate default data
npm run seed

# Start the backend server
npm run dev
```

You should see:
```
✓ Connected to MongoDB database: omnidesk
✓ Database indexes created
✓ Server running on port 3001
```

### 4. Set Up the Frontend

Open a new terminal window:

```bash
# Navigate to root directory (if in backend, go back)
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# The default .env should work:
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
# NEXT_PUBLIC_STORAGE_BACKEND=mongodb

# Start the frontend development server
npm run dev
```

You should see:
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5. Open OmniDesk

Open your browser and navigate to:
```
http://localhost:5173
```

You should see:
- The OmniDesk dashboard
- 4 default domains in the filter dropdown (College, Startup, Health, Personal)
- "Connected to MongoDB" indicator in the bottom-right corner

## Default Data

The seed script creates:

### Domains
- **College** (Blue) - Academic work and studies
- **Startup** (Green) - Entrepreneurship and business ventures
- **Health** (Red) - Physical and mental wellbeing
- **Personal** (Purple) - Personal projects and hobbies

### Task States
- **Gotta Start** (Yellow) - Things I need to begin
- **In Progress** (Blue) - Currently working on
- **Nearly Done** (Green) - Almost finished
- **Paused** (Orange) - On hold for now
- **Completed** (Green) - Finished and done

### Sample Data
- One welcome idea with instructions

## Verifying the Setup

### Check Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-12-25T12:00:00.000Z"
}
```

### Check MongoDB Connection

```bash
curl http://localhost:3001/api/domains?user_id=default-user
```

Should return an array of 4 domains.

### Check Frontend Connection

In the browser console (F12), you should see:
```
Using MongoDB API storage backend
```

## Troubleshooting

### MongoDB Connection Error

**Problem:** `Failed to connect to MongoDB`

**Solutions:**
1. Ensure Docker is running: `docker ps`
2. Restart MongoDB container:
   ```bash
   docker restart omnidesk-mongodb
   ```
3. Check MongoDB logs:
   ```bash
   docker logs omnidesk-mongodb
   ```

### Backend Won't Start

**Problem:** TypeScript compilation errors

**Solutions:**
1. Make sure you're using Node.js 18+: `node --version`
2. Clear node_modules and reinstall:
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

### Frontend Shows "Offline - Using LocalStorage"

**Problem:** Frontend can't connect to backend

**Solutions:**
1. Check backend is running on port 3001
2. Verify `.env` has correct `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
3. Check CORS settings in `backend/src/server.ts`
4. Restart both frontend and backend

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use :::3001`

**Solutions:**
1. Find and kill the process using the port:
   ```bash
   # On macOS/Linux:
   lsof -ti:3001 | xargs kill
   
   # On Windows:
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```
2. Or change the port in `backend/.env`: `PORT=3002`

## Next Steps

Once everything is running:

1. **Explore the Dashboard** - See all your tasks at a glance
2. **Create an Idea** - Go to Ideas page and click "+ New Idea"
3. **Add a Task** - Use the "+ New Task" button
4. **Test the Calendar** - Navigate to Calendar to see events
5. **Try the Terminal** - Bulk input interface (coming soon)

## Development Tips

### Restarting Services

```bash
# Restart backend only
cd backend
npm run dev

# Restart frontend only
cd ..  # (root directory)
npm run dev

# Restart MongoDB
docker restart omnidesk-mongodb
```

### Viewing MongoDB Data

Use MongoDB Compass or command line:

```bash
# Connect to MongoDB shell
docker exec -it omnidesk-mongodb mongosh

# Once in mongosh:
use omnidesk
db.domains.find().pretty()
db.ideas.find().pretty()
db.tasks.find().pretty()
```

### Resetting Data

To start fresh:

```bash
# Method 1: Re-run seed script (idempotent - won't duplicate)
cd backend
npm run seed

# Method 2: Drop database and re-seed
docker exec -it omnidesk-mongodb mongosh
use omnidesk
db.dropDatabase()
exit
npm run seed
```

## Environment Variables Reference

### Backend (.env)

```bash
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=omnidesk

# Server configuration
PORT=3001
NODE_ENV=development

# CORS (frontend URL)
FRONTEND_URL=http://localhost:5173

# Future: Authentication
# JWT_SECRET=your-secret-key
# JWT_EXPIRES_IN=7d
```

### Frontend (.env)

```bash
# Backend API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Storage backend ('mongodb' or 'localstorage')
NEXT_PUBLIC_STORAGE_BACKEND=mongodb

# Offline mode (optional)
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_SYNC_INTERVAL_MS=30000
```

## Production Deployment

For production deployment instructions, see:
- [Deployment Guide](./deployment.md) (coming soon)
- Backend: Railway, Render, or Heroku
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas (cloud)

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/ak-1344/OmniDesk/issues)
- **Documentation:** See `/docs` folder
- **Implementation Status:** `docs/IMPLEMENTATION-PROGRESS.md`

## What's Working Now

✅ MongoDB backend with seed data
✅ Frontend connected to MongoDB
✅ Domain management
✅ Ideas CRUD
✅ Tasks CRUD
✅ Calendar events
✅ Settings management
✅ Trash system
✅ Connection status indicator

## What's Coming Next

🔨 Infinite canvas for ideas (TLDraw)
🔨 Idea-to-task conversion with lineage
⏳ Custom workflow states
⏳ Subtask Kanban boards
⏳ Full calendar integration
⏳ Terminal bulk input
⏳ GitHub-inspired UI polish

---

**Happy building with OmniDesk! 🚀**

If you run into any issues, check the troubleshooting section or create an issue on GitHub.
