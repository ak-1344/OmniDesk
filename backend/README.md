# OmniDesk Backend

Express.js + TypeScript + MongoDB backend API for OmniDesk.

## Overview

RESTful API server providing data persistence and business logic for the OmniDesk frontend. Built with Express.js, TypeScript, and MongoDB.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Seed the database with default data
npm run seed

# Start development server
npm run dev
```

Server will start on `http://localhost:3001`

## Features

- ✅ RESTful API with Express.js + TypeScript
- ✅ MongoDB with native driver
- ✅ Automatic database indexing for performance
- ✅ CORS support for frontend integration
- ✅ Input validation with express-validator
- ✅ Comprehensive error handling
- ✅ Soft deletes (trash system)
- ✅ Database seeding for development
- ✅ Security headers (Helmet)
- ✅ Request logging (Morgan)

## Prerequisites

- Node.js 18+
- MongoDB 6.0+ (local or Atlas)
- npm

## Configuration

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=omnidesk

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
CORS_ALLOW_ALL=true # Use only in development to allow * origins

# JWT Configuration (future use)
# JWT_SECRET=your-secret-key-here
# JWT_EXPIRE=7d
```

## Available Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm start         # Run compiled code (production)
npm run seed      # Seed database with default data
npm run lint      # Run ESLint (when configured)
npm test          # Run tests (placeholder)
```

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Entry point, Express app setup
│   ├── config/
│   │   └── database.ts        # MongoDB connection and indexes
│   ├── routes/                # API route handlers
│   │   ├── auth.ts           # Authentication (future)
│   │   ├── domains.ts        # Domain CRUD
│   │   ├── tasks.ts          # Task CRUD
│   │   ├── subtasks.ts       # Subtask operations
│   │   ├── ideas.ts          # Idea CRUD
│   │   ├── ideaFolders.ts    # Idea folder management
│   │   ├── calendarEvents.ts # Calendar event CRUD
│   │   ├── settings.ts       # User settings
│   │   └── trash.ts          # Trash operations
│   ├── middleware/            # Custom middleware (future)
│   └── utils/
│       └── seedData.ts        # Database seeding script
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Realtime
- `GET /api/realtime?user_id=<id>` - Server-Sent Events stream of MongoDB changes for the user

### Domains
- `GET /api/domains?user_id=<id>` - Get all domains
- `POST /api/domains` - Create domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain

### Tasks
- `GET /api/tasks?user_id=<id>` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Soft delete task

### Subtasks
- `POST /api/subtasks` - Add subtask to task
- `PUT /api/subtasks/:taskId/:subtaskId` - Update subtask
- `DELETE /api/subtasks/:taskId/:subtaskId` - Delete subtask

### Ideas
- `GET /api/ideas?user_id=<id>` - Get all ideas
- `GET /api/ideas/:id` - Get single idea
- `POST /api/ideas` - Create idea
- `PUT /api/ideas/:id` - Update idea
- `DELETE /api/ideas/:id` - Soft delete idea

### Idea Folders
- `GET /api/idea-folders?user_id=<id>` - Get all folders
- `POST /api/idea-folders` - Create folder
- `PUT /api/idea-folders/:id` - Update folder
- `DELETE /api/idea-folders/:id` - Delete folder

### Calendar Events
- `GET /api/calendar-events?user_id=<id>` - Get all events
- `POST /api/calendar-events` - Create event
- `PUT /api/calendar-events/:id` - Update event
- `DELETE /api/calendar-events/:id` - Delete event

### Settings
- `GET /api/settings?user_id=<id>` - Get user settings
- `PUT /api/settings` - Update settings

### Trash
- `GET /api/trash?user_id=<id>` - Get trash items
- `POST /api/trash/restore/:type/:id` - Restore item
- `DELETE /api/trash/:type/:id` - Permanently delete item
- `DELETE /api/trash/empty?user_id=<id>` - Empty trash

**Complete API documentation: [/docs/API_REFERENCE.md](../docs/API_REFERENCE.md)**

## Database

### MongoDB Collections

- `domains` - User life areas (College, Startup, etc.)
- `tasks` - Tasks with embedded subtasks
- `ideas` - Ideas with embedded notes
- `idea_folders` - Idea organization folders
- `calendar_events` - Calendar entries
- `user_settings` - User preferences
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
### Indexes

Performance indexes are automatically created on startup:

- `domains`: `{ user_id: 1, name: 1 }`
- `tasks`: `{ user_id: 1, domain_id: 1 }`, `{ user_id: 1, state: 1 }`, `{ deadline: 1 }`
- `ideas`: `{ user_id: 1, folder_id: 1 }`, `{ tags: 1 }`
- `calendar_events`: `{ user_id: 1, date: 1 }`
- `user_settings`: `{ user_id: 1 }` (unique)

### Data Seeding

Populate database with default data:

```bash
npm run seed
```

This creates:
- 4 default domains (College, Startup, Health, Personal)
- Sample tasks in various states
- Sample ideas
- Default user settings

**Warning**: Seeding will clear existing data in the database.

## Development

### Adding a New Route

1. Create route file in `src/routes/`:

```typescript
// src/routes/myRoute.ts
import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const data = await db.collection('my_collection').find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch data' } });
  }
});

export default router;
```

2. Register route in `server.ts`:

```typescript
import myRouteRouter from './routes/myRoute';
app.use('/api/my-route', myRouteRouter);
```

### Request Validation

Use `express-validator` for input validation:

```typescript
import { body, validationResult } from 'express-validator';

router.post('/',
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('email').isEmail().withMessage('Valid email required')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... process request
  }
);
```

## Testing

### Current State

No automated tests implemented yet.

### Manual Testing

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

### Recommended Testing Stack

```bash
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/
MONGODB_DB_NAME=omnidesk
PORT=3001
FRONTEND_URL=https://your-domain.com
JWT_SECRET=<secure-random-string>
```

### Deployment Platforms

Recommended platforms:
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **DigitalOcean App Platform**: Managed containers
- **AWS Elastic Beanstalk**: Scalable infrastructure

### MongoDB Hosting

Use **MongoDB Atlas** for production database:
1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist IP addresses
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in production environment
3. Ensure MongoDB Atlas connection string is configured

### Option 2: Docker

Create `Dockerfile`:

## Troubleshooting

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps

# Test connection
mongosh mongodb://localhost:27017/omnidesk

# Check logs
docker logs omnidesk-mongodb
```

### Port Already in Use

```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Clean and rebuild
rm -rf dist
npm run build
```

## Security

### Current Implementation

- **Helmet**: Security headers
- **CORS**: Configured for frontend origin only
- **Input Validation**: express-validator on all inputs
- **MongoDB Injection**: ObjectId validation prevents injection

### Future Enhancements

- JWT authentication
- Rate limiting
- Request sanitization
- HTTPS enforcement
- API key authentication

## Docker Deployment

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

## Contributing

See [/docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md) for development guidelines.

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [express-validator](https://express-validator.github.io/docs/)
- [Main Documentation](../docs/README.md)

## License

MIT License - see [LICENSE](../LICENSE) file for details.
