# OmniDesk MongoDB Backend Setup Guide

This guide walks you through setting up the MongoDB backend API server for OmniDesk.

## Architecture Overview

```
┌───────────────────┐         HTTP/REST           ┌────────────────────────┐
│                   │ ◄────────────────────────►  │                        │
│  Frontend (React) │                             │   Backend (Express)    │
│  Next.js + TypeScript│                             │  Node.js + TypeScript  │
│                   │                             │                        │
└───────────────────┘                             └────────────────────────┘
                                                        │
                                                        │ MongoDB Driver
                                                        ▼
                                                   ┌──────────────────┐
                                                   │                  │
                                                   │    MongoDB       │
                                                   │    Database      │
                                                   │                  │
                                                   └──────────────────┘
```

## Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**
- **MongoDB** 6.0 or higher (local or Atlas)

## Step 1: MongoDB Setup

### Option A: Local MongoDB

1. **Install MongoDB** (if not already installed):
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: `sudo apt-get install -y mongodb`
   - **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)

2. **Start MongoDB**:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   
   # Windows
   # MongoDB runs as a service after installation
   ```

3. **Verify MongoDB is running**:
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create Account**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free tier

2. **Create Cluster**:
   - Choose "Shared" (Free tier)
   - Select region closest to you
   - Click "Create"

3. **Create Database User**:
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Grant "Read and write to any database"

4. **Whitelist IP Address**:
   - Go to "Network Access"
   - Click "Add IP Address"
   - Allow access from anywhere (0.0.0.0/0) for development
   - **Note**: Restrict this in production

5. **Get Connection String**:
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

## Step 2: Backend Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (`.env`):
   
   For **Local MongoDB**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/
   MONGODB_DB_NAME=omnidesk
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```
   
   For **MongoDB Atlas**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=omnidesk
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

## Step 3: Start Backend Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

You should see:
```
✓ Connected to MongoDB database: omnidesk
✓ Database indexes created
✓ Server running on port 3001
✓ Frontend URL: http://localhost:5173
✓ Environment: development
```

### Production Mode:
```bash
npm run build
npm start
```

## Step 4: Frontend Configuration

1. **Navigate to frontend root**:
   ```bash
   cd ..  # From backend directory
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables** (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_STORAGE_BACKEND=mongodb
   ```

4. **Start frontend**:
   ```bash
   npm run dev
   ```

## Step 5: Verify Integration

1. **Check backend health**:
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Test API endpoint**:
   ```bash
   curl http://localhost:3001/api/domains?user_id=default-user
   # Should return: [] (empty array initially)
   ```

3. **Open frontend**:
   - Navigate to `http://localhost:5173`
   - The app should load with MongoDB backend
   - Check browser console for: "Using MongoDB API storage backend"

## Database Structure

The backend automatically creates these collections:

| Collection | Purpose |
|-----------|---------|
| `domains` | Task organization categories |
| `tasks` | Main tasks with embedded subtasks |
| `ideas` | Notes/ideas with embedded content |
| `idea_folders` | Folders for organizing ideas |
| `calendar_events` | Calendar events and deadlines |
| `user_settings` | User preferences |

### Indexes Created Automatically

The backend creates optimized indexes on startup:
- `domains`: `user_id + name`
- `tasks`: `user_id + domain_id`, `user_id + state`, `deleted_at`, `deadline`
- `ideas`: `user_id + folder_id`, `deleted_at`, `tags`
- `calendar_events`: `user_id + date`
- `user_settings`: `user_id` (unique)

## Troubleshooting

### Backend won't start

**Error**: "Failed to connect to MongoDB"

**Solutions**:
1. Check MongoDB is running: `mongosh`
2. Verify `MONGODB_URI` in `.env`
3. For Atlas, check IP whitelist and credentials

**Error**: "Port 3001 already in use"

**Solutions**:
1. Change `PORT` in `.env` to different port (e.g., `3002`)
2. Kill process using port: `lsof -ti:3001 | xargs kill -9`

### Frontend can't connect to backend

**Error**: CORS error in browser console

**Solutions**:
1. Check `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Ensure backend is running (`npm run dev` in backend directory)
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

**Error**: "Failed to fetch"

**Solutions**:
1. Check backend is running: `curl http://localhost:3001/health`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check browser Network tab for actual error

### Data not persisting

**Problem**: Data disappears after refresh

**Solutions**:
1. Verify `NEXT_PUBLIC_STORAGE_BACKEND=mongodb` in `.env.local`
2. Check browser console for storage backend message
3. Verify MongoDB connection in backend logs

## Development Workflow

### Making Changes to Backend

1. Edit files in `backend/src/`
2. Server auto-reloads (if using `npm run dev`)
3. Test changes immediately

### Adding New API Endpoints

1. Create route file in `backend/src/routes/`
2. Import in `backend/src/server.ts`
3. Add to Express app
4. Update `backend/README.md`

### Database Schema Changes

MongoDB is schema-less, but for consistency:

1. Document schema in code comments
2. Update indexes if needed in `backend/src/config/database.ts`
3. Consider data migration for existing data

## Production Deployment

### Backend Deployment

#### Heroku
```bash
cd backend
heroku create omnidesk-backend
heroku addons:create mongolab:sandbox
git push heroku main
```

#### Railway.app
1. Connect GitHub repository
2. Select backend directory
3. Add MongoDB plugin
4. Deploy automatically

#### Render.com
1. New Web Service
2. Connect repository
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variables

### Environment Variables for Production

```env
MONGODB_URI=<your-atlas-connection-string>
MONGODB_DB_NAME=omnidesk_prod
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Configuration for Production

Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_STORAGE_BACKEND=mongodb
```

## Security Considerations

### Current Implementation (Development)

✅ CORS configured  
✅ Helmet.js security headers  
✅ Input validation  
✅ MongoDB injection protection  

❌ **NOT YET IMPLEMENTED**:
- Authentication/Authorization
- Rate limiting
- Request logging
- HTTPS enforcement

### Recommended for Production

1. **Add Authentication**:
   - Implement JWT tokens
   - Add user registration/login
   - Protect all endpoints

2. **Add Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```

3. **Use HTTPS**:
   - Let's Encrypt certificates
   - Force HTTPS redirect

4. **Restrict CORS**:
   - Set specific frontend URL
   - No wildcard origins

5. **Monitor and Log**:
   - Use Winston for logging
   - Set up error tracking (Sentry)

## Next Steps

- [ ] Add user authentication (JWT)
- [ ] Implement real-time updates (WebSocket)
- [ ] Add file upload for attachments
- [ ] Create automated tests
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline
- [ ] Add database backups

## Getting Help

- **Backend Issues**: Check `backend/README.md`
- **API Documentation**: See endpoint list in backend README
- **Database Schema**: See `docs/data-configuration.md`
- **Frontend Integration**: See main `README.md`

## Useful Commands

```bash
# Backend
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production server
npm run lint         # Check code style

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# MongoDB
mongosh              # Connect to local MongoDB
mongosh "mongodb+srv://..." # Connect to Atlas

# View database
use omnidesk
show collections
db.tasks.find()
db.domains.find()
```

## Summary

You now have:
- ✅ MongoDB database (local or Atlas)
- ✅ Express backend API server
- ✅ Frontend configured to use MongoDB
- ✅ Complete CRUD operations
- ✅ Development environment ready

The application now supports dual storage:
- **LocalStorage**: Default, works offline, no setup
- **MongoDB**: Cloud sync, multi-device, requires backend

Switch between them by changing `NEXT_PUBLIC_STORAGE_BACKEND` in `.env.local`!
