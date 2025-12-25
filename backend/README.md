# OmniDesk Backend API

Backend API server for OmniDesk with MongoDB integration.

## Features

- RESTful API with Express.js
- MongoDB database with proper indexing
- CORS support for frontend integration
- Request validation
- Error handling
- Soft deletes for tasks and ideas
- Comprehensive CRUD operations for all entities

## Prerequisites

- Node.js 18+ 
- MongoDB 6.0+ (local or Atlas)
- npm or yarn

## Installation

```bash
cd backend
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=omnidesk
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Domains
- `GET /api/domains?user_id=:userId` - Get all domains
- `POST /api/domains` - Create domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain

### Tasks
- `GET /api/tasks?user_id=:userId` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (soft delete)

### Subtasks
- `POST /api/subtasks/:taskId` - Add subtask to task
- `PUT /api/subtasks/:taskId/:subtaskId` - Update subtask
- `DELETE /api/subtasks/:taskId/:subtaskId` - Delete subtask

### Ideas
- `GET /api/ideas?user_id=:userId` - Get all ideas
- `POST /api/ideas` - Create idea
- `PUT /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Delete idea (soft delete)

### Idea Folders
- `GET /api/idea-folders?user_id=:userId` - Get all folders
- `POST /api/idea-folders` - Create folder
- `PUT /api/idea-folders/:id` - Update folder
- `DELETE /api/idea-folders/:id` - Delete folder

### Calendar Events
- `GET /api/calendar-events?user_id=:userId` - Get all events
- `POST /api/calendar-events` - Create event
- `PUT /api/calendar-events/:id` - Update event
- `DELETE /api/calendar-events/:id` - Delete event

### Settings
- `GET /api/settings?user_id=:userId` - Get user settings
- `PUT /api/settings` - Update settings

### Trash
- `GET /api/trash?user_id=:userId` - Get trash items
- `POST /api/trash/:id/restore` - Restore item
- `DELETE /api/trash/:id` - Permanently delete item
- `DELETE /api/trash?user_id=:userId` - Empty trash

## Database Schema

### Collections

1. **domains** - Task organization categories
2. **tasks** - Main tasks with embedded subtasks
3. **ideas** - Notes with embedded content
4. **idea_folders** - Idea organization
5. **calendar_events** - Calendar events
6. **user_settings** - User preferences

### Indexes

Indexes are automatically created on startup for optimal query performance:
- User data isolation (user_id)
- Domain relationships (domain_id)
- Task states and deadlines
- Idea tags and folders
- Calendar event dates

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # MongoDB connection & indexes
│   ├── routes/
│   │   ├── domains.ts         # Domain endpoints
│   │   ├── tasks.ts           # Task endpoints
│   │   ├── subtasks.ts        # Subtask endpoints
│   │   ├── ideas.ts           # Idea endpoints
│   │   ├── ideaFolders.ts     # Idea folder endpoints
│   │   ├── calendarEvents.ts  # Calendar event endpoints
│   │   ├── settings.ts        # Settings endpoints
│   │   └── trash.ts           # Trash endpoints
│   └── server.ts              # Express app setup
├── package.json
├── tsconfig.json
└── .env.example
```

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Import in `src/server.ts`
3. Add route to Express app
4. Update this README

## Testing

Currently using manual testing. To test endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Get domains
curl http://localhost:3001/api/domains?user_id=default-user

# Create domain
curl -X POST http://localhost:3001/api/domains \
  -H "Content-Type: application/json" \
  -d '{"name":"Work","color":"#667eea","user_id":"default-user"}'
```

## Deployment

### Option 1: Traditional Hosting (Heroku, Railway, etc.)

1. Set environment variables
2. Deploy with `npm start`
3. Ensure MongoDB Atlas connection string is configured

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
npm run build
docker build -t omnidesk-backend .
docker run -p 3001:3001 --env-file .env omnidesk-backend
```

## Security Notes

- CORS is configured for specific frontend URL
- Input validation on all endpoints
- MongoDB injection protection via parameterized queries
- Helmet.js for security headers
- **TODO**: Add JWT authentication
- **TODO**: Add rate limiting
- **TODO**: Add request logging

## Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Request logging with Winston
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] WebSocket support for real-time updates
- [ ] File upload support for attachments
- [ ] Backup and restore endpoints

## License

MIT
