# OmniDesk Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation & Setup

### 1. Install Dependencies

**Frontend:**
```bash
cd /workspaces/OmniDesk
npm install
```

**Backend:**
```bash
cd /workspaces/OmniDesk/backend
npm install
```

### 2. Configure Environment Variables

**Backend (.env):**
Create `/workspaces/OmniDesk/backend/.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/omnidesk
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

**Frontend (.env):**
Create `/workspaces/OmniDesk/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/your/db
```

**Or use MongoDB Atlas (Cloud):**
Update `MONGODB_URI` in backend `.env` with your Atlas connection string.

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd /workspaces/OmniDesk/backend
npm run dev
```

Expected output:
```
✓ Server running on port 3001
✓ Frontend URL: http://localhost:5173
✓ Environment: development
✓ MongoDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/OmniDesk
npm run dev
```

Expected output:
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🎨 Features to Test

### 1. Ideas Board (Flagship Feature)
- Navigate to **Ideas** page
- Click **"+ New Idea"**
- Create sticky notes with different colors
- **Drag and drop** ideas to reorder them
- Click the **duplicate button (⧉)** to copy an idea
- Click **"Enable Canvas"** to activate infinite whiteboard
- Draw, sketch, and annotate in the canvas
- Save and revisit - canvas state persists!

### 2. Task-Idea Lineage
- Open an existing idea
- Click **"✓ Convert to Task"**
- Choose a domain and initial state
- Navigate to the created task - see **"💡 Born from Idea"** link
- Go back to the idea - see the task listed under **"Tasks Created from This Idea"**

### 3. Terminal Commands
- Navigate to **Terminal** page
- Try these commands:
  ```bash
  help                          # Show all commands
  add task Build homepage       # Create a task
  add idea Mobile app concept   # Create an idea
  list tasks                    # View all tasks
  complete 1                    # Complete first task
  delete task 2                 # Delete second task
  clear                         # Clear terminal
  ```
- Use **↑ and ↓ arrows** for command history

### 4. Task Kanban Board
- Navigate to **Tasks** page
- Click on any task to open it
- View the **Kanban board** with subtasks
- **Drag subtasks** between columns (To Do → In Progress → Completed)
- Add new subtasks with deadlines
- See real-time progress tracking

### 5. Calendar & Dashboard
- **Calendar**: View task deadlines and scheduled events
- **Dashboard**: Overview of tasks by state with visual cards

## 🔧 Development Tools

### Seed Sample Data (Optional)
```bash
cd /workspaces/OmniDesk/backend
npm run seed
```

This will populate your database with:
- Sample domains (Work, Personal, Learning)
- Example tasks and subtasks
- Test ideas with notes
- Calendar events

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status": "ok", "timestamp": "2025-12-25T..."}
```

### View MongoDB Data
```bash
# Connect to MongoDB shell
mongosh

# Switch to omnidesk database
use omnidesk

# View collections
show collections

# View ideas with canvas data
db.ideas.find().pretty()

# View users
db.users.find().pretty()
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Backend (port 3001)
lsof -ti:3001 | xargs kill -9

# Frontend (port 5173)
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in backend `.env`
- For Atlas: Whitelist your IP address

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS error messages

### Cannot Find Module Errors
```bash
# Re-install dependencies
cd /workspaces/OmniDesk/backend
rm -rf node_modules package-lock.json
npm install

cd /workspaces/OmniDesk
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Ideas
- `GET /api/ideas` - Get all ideas
- `POST /api/ideas` - Create idea
- `PUT /api/ideas/:id` - Update idea (including canvas data)
- `DELETE /api/ideas/:id` - Soft delete idea

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Soft delete task

### Other Resources
- `/api/domains` - Domain management
- `/api/subtasks` - Subtask operations
- `/api/calendar-events` - Calendar events
- `/api/settings` - User settings
- `/api/trash` - Trash management

## 🚀 Production Deployment

### Environment Preparation
1. Set strong `JWT_SECRET` (use: `openssl rand -base64 32`)
2. Use production MongoDB instance (MongoDB Atlas recommended)
3. Set `NODE_ENV=production`
4. Configure proper CORS origins
5. Enable HTTPS/SSL

### Build Commands
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd ..
npm run build
npm run preview
```

### Deployment Platforms
- **Backend**: Heroku, DigitalOcean, AWS EC2, Render
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: MongoDB Atlas (recommended)

## 📖 Next Steps

1. **Implement Frontend Authentication**
   - Create Login/Register pages
   - Add protected routes
   - Store JWT tokens in localStorage
   - Add logout functionality

2. **Apply Authentication to Routes**
   - Add `authMiddleware` to backend routes
   - Filter data by `userId`
   - Remove hardcoded `default-user`

3. **Customize Your Workflow**
   - Add custom task states
   - Create domain-specific views
   - Implement custom kanban columns

4. **Explore Advanced Features**
   - Export/import data
   - Advanced canvas tools
   - Collaboration features
   - Mobile responsive design

## 💡 Tips & Best Practices

- **Use Terminal** for rapid bulk creation of tasks/ideas
- **Enable Canvas** only when you need spatial thinking
- **Convert Ideas to Tasks** explicitly when ready to execute
- **Organize with Domains** to separate different life areas
- **Track Progress** using the kanban board inside tasks
- **Review Calendar** for deadline awareness

---

**Enjoy using OmniDesk - Where thinking comes first! 🎨💡✨**
