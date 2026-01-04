# OmniDesk Architecture

This document describes the technical architecture of OmniDesk, including system design, data models, and architectural patterns.

## System Overview

OmniDesk follows a **three-tier architecture**:

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│   React 19 + TypeScript + Tailwind     │
│         Port: 3000/5173                 │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               │ (fetch)
┌──────────────▼──────────────────────────┐
│      Backend API (Express.js)           │
│       TypeScript + Node.js              │
│            Port: 3001                   │
└──────────────┬──────────────────────────┘
               │ MongoDB Driver
               │
┌──────────────▼──────────────────────────┐
│       Database (MongoDB)                │
│         Port: 27017                     │
│       Collections: domains, tasks,      │
│    ideas, calendar_events, settings     │
└─────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui components
- **State Management**: React Context API
- **Data Fetching**: Native fetch API
- **Routing**: Next.js App Router (file-based)

### Directory Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout
├── page.tsx           # Landing page
├── globals.css        # Global styles
├── dashboard/         # Dashboard route
├── ideas/             # Ideas routes
│   ├── page.tsx      # Ideas list/board
│   └── [id]/         # Individual idea
├── tasks/             # Tasks routes
│   ├── page.tsx      # Tasks list
│   └── [id]/         # Individual task
├── calendar/          # Calendar route
├── trash/             # Trash management
├── settings/          # User settings
└── user-guide/        # User documentation

components/            # React components
├── ui/               # Reusable UI (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── app-layout.tsx    # Main app shell
├── spatial-surface.tsx  # Ideas canvas
├── task-detail.tsx   # Task detail view
├── idea-card.tsx     # Idea card component
└── thought-terminal.tsx # Quick input terminal

context/              # Global state
├── AppContext.tsx   # Main application state
└── ToastContext.tsx # Notifications

lib/                  # Utilities
├── storage.factory.ts    # Storage abstraction
├── storage.interface.ts  # Storage contract
├── storage.mongodb.ts    # MongoDB adapter
├── storage.localstorage.ts # LocalStorage adapter
├── types.ts         # TypeScript types
└── utils.ts         # Helper functions
```

### State Management

OmniDesk uses **React Context API** for global state management.

#### AppContext Structure

```typescript
interface AppState {
  domains: Domain[]
  tasks: Task[]
  ideas: Idea[]
  ideaFolders: IdeaFolder[]
  events: CalendarEvent[]
  settings: AppSettings
  customTaskStates?: TaskState[]
  customSubtaskStates?: SubtaskState[]
}
```

#### Context Operations

The AppContext provides methods for CRUD operations:

- **Domains**: `addDomain`, `updateDomain`, `deleteDomain`
- **Tasks**: `addTask`, `updateTask`, `deleteTask`, `restoreTask`
- **Subtasks**: `addSubtask`, `updateSubtask`, `deleteSubtask`
- **Ideas**: `addIdea`, `updateIdea`, `deleteIdea`, `restoreIdea`
- **Events**: `addEvent`, `updateEvent`, `deleteEvent`
- **Settings**: `updateSettings`

### Storage Adapter Pattern

OmniDesk uses the **Adapter Pattern** to abstract storage:

```typescript
interface IDataStorage {
  initialize(): Promise<void>
  
  // Domain operations
  getDomains(): Promise<Domain[]>
  addDomain(domain: Omit<Domain, 'id'>): Promise<Domain>
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain>
  deleteDomain(id: string): Promise<void>
  
  // Task operations
  getTasks(): Promise<Task[]>
  addTask(task: Omit<Task, 'id'>): Promise<Task>
  // ... more operations
}
```

**Implementations**:
1. **MongoDBAdapter** - Calls backend API
2. **LocalStorageAdapter** - Uses browser localStorage

### Component Architecture

Components follow these patterns:

1. **Server Components** (default in App Router)
   - Used for static layouts and pages
   - No client-side interactivity

2. **Client Components** (`"use client"`)
   - Interactive components
   - Use hooks and state
   - Examples: dashboard, task-manager, spatial-surface

3. **UI Components** (shadcn/ui pattern)
   - Reusable, unstyled components
   - Built on Radix UI primitives
   - Styled with Tailwind CSS

## Backend Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with native driver
- **Validation**: express-validator
- **Security**: Helmet, CORS

### Directory Structure

```
backend/
├── src/
│   ├── server.ts          # Entry point
│   ├── config/
│   │   └── database.ts    # MongoDB connection
│   ├── routes/            # API route handlers
│   │   ├── auth.ts
│   │   ├── domains.ts
│   │   ├── tasks.ts
│   │   ├── subtasks.ts
│   │   ├── ideas.ts
│   │   ├── ideaFolders.ts
│   │   ├── calendarEvents.ts
│   │   ├── settings.ts
│   │   └── trash.ts
│   ├── middleware/        # Custom middleware
│   └── utils/
│       └── seedData.ts    # Database seeding
├── package.json
└── tsconfig.json
```

### API Architecture

The backend follows **RESTful principles**:

```
/api
├── /auth              # Authentication (future)
├── /domains           # Domain management
├── /tasks             # Task CRUD
├── /subtasks          # Subtask operations
├── /ideas             # Idea management
├── /idea-folders      # Idea folder organization
├── /calendar-events   # Calendar events
├── /settings          # User settings
└── /trash             # Trash operations
```

### Request Flow

```
Client Request
    ↓
Express Middleware Stack
├── helmet()           # Security headers
├── cors()             # CORS handling
├── morgan()           # Request logging
└── express.json()     # Body parsing
    ↓
Route Handler
├── Validation (express-validator)
├── Database Operations
└── Response Formatting
    ↓
Client Response
```

### Error Handling

```typescript
// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})
```

## Database Architecture

### MongoDB Collections

OmniDesk uses the following collections:

```
omnidesk (database)
├── domains           # User's life areas
├── tasks             # Tasks with embedded subtasks
├── ideas             # Ideas with embedded notes
├── idea_folders      # Idea organization
├── calendar_events   # Calendar entries
└── user_settings     # User preferences
```

### Data Models

#### Domain Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  name: String,
  color: String,
  description: String,
  created_at: Date,
  updated_at: Date
}
```

#### Task Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  domain_id: String,
  title: String,
  description: String,
  state: String,  // 'gotta-start', 'in-progress', 'nearly-done', 'paused', 'completed'
  deadline: Date | null,
  notes: String | null,
  proof: [String] | null,
  idea_id: String | null,  // Lineage tracking
  subtasks: [{
    _id: String,
    title: String,
    description: String,
    state: String,  // 'todo', 'in-progress', 'completed'
    deadline: Date | null,
    scheduled_time: {
      date: Date,
      start_time: String,
      duration: Number
    } | null,
    proof: String | null,
    completed_at: Date | null
  }],
  deleted_at: Date | null,  // Soft delete
  created_at: Date,
  updated_at: Date
}
```

#### Idea Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  folder_id: String | null,
  title: String,
  color: String | null,
  tags: [String],
  position: { x: Number, y: Number } | null,
  canvas_enabled: Boolean,
  canvas_data: Object | null,  // TLDraw snapshot
  converted_to_tasks: [String],  // Task IDs
  notes: [{
    _id: String,
    type: String,  // 'text', 'image', 'whiteboard'
    content: String,
    created_at: Date,
    order: Number
  }],
  deleted_at: Date | null,
  created_at: Date,
  updated_at: Date
}
```

#### Calendar Event Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  title: String,
  description: String | null,
  date: Date,
  start_time: String | null,
  end_time: String | null,
  duration: Number | null,
  type: String,  // 'task-deadline', 'subtask-scheduled', 'personal-event', etc.
  related_task_id: String | null,
  related_subtask_id: String | null,
  created_at: Date,
  updated_at: Date
}
```

#### User Settings Collection

```javascript
{
  _id: ObjectId,
  user_id: String,  // Unique index
  theme: String,
  default_view: String,
  date_format: String,
  week_starts_on: String,
  notifications: {
    email: Boolean,
    desktop: Boolean,
    task_reminders: Boolean
  },
  trash_retention_days: Number,
  user: {
    name: String,
    email: String,
    avatar: String
  },
  kanban_columns: [{
    id: String,
    label: String,
    color: String,
    order: Number
  }],
  subtask_kanban_columns: [Object],
  domain_order: [String],
  created_at: Date,
  updated_at: Date
}
```

### Database Indexes

Performance indexes are created automatically on startup:

```javascript
// Domains
db.domains.createIndex({ user_id: 1, name: 1 })

// Tasks
db.tasks.createIndex({ user_id: 1, domain_id: 1 })
db.tasks.createIndex({ user_id: 1, state: 1 })
db.tasks.createIndex({ user_id: 1, deleted_at: 1 })
db.tasks.createIndex({ deadline: 1 })
db.tasks.createIndex({ 'subtasks._id': 1 })

// Ideas
db.ideas.createIndex({ user_id: 1, folder_id: 1 })
db.ideas.createIndex({ user_id: 1, deleted_at: 1 })
db.ideas.createIndex({ tags: 1 })

// Calendar events
db.calendar_events.createIndex({ user_id: 1, date: 1 })

// Settings
db.user_settings.createIndex({ user_id: 1 }, { unique: true })
```

## Key Design Patterns

### 1. Repository Pattern (Storage Adapters)

Abstracts data persistence, allowing switching between MongoDB and LocalStorage.

### 2. Soft Delete Pattern

Items are marked with `deleted_at` instead of hard deletion, enabling trash/restore functionality.

### 3. Embedded Documents

Subtasks are embedded in tasks, notes in ideas - optimized for common query patterns.

### 4. Lineage Tracking

Tasks maintain `idea_id` reference, ideas maintain `converted_to_tasks` array for bidirectional tracking.

### 5. Domain-Driven Organization

All user data (tasks, ideas) is associated with domains for flexible filtering and organization.

## Data Flow Example

### Creating a Task from an Idea

```
1. User clicks "Convert to Task" on Idea
   ↓
2. Frontend: task-detail.tsx
   - Calls AppContext.addTask({ ideaId: idea.id })
   ↓
3. AppContext
   - Calls storage.addTask()
   ↓
4. MongoDBAdapter
   - POST /api/tasks with ideaId
   ↓
5. Backend: routes/tasks.ts
   - Validates request
   - Inserts task with idea_id field
   - Returns created task
   ↓
6. Backend: routes/ideas.ts (separate request)
   - Updates idea.converted_to_tasks array
   ↓
7. Frontend: AppContext
   - Updates local state
   - Triggers re-render
   ↓
8. UI updates to show new task
```

## Security Considerations

### Current Implementation

- **CORS**: Configured to allow only frontend origin
- **Helmet**: Security headers applied
- **Input Validation**: express-validator on all inputs
- **MongoDB Injection**: Using ObjectId validation

### Future Enhancements

- JWT-based authentication
- User session management
- Role-based access control
- Rate limiting
- Input sanitization
- HTTPS enforcement

## Performance Optimizations

### Frontend

- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: React.lazy for heavy components (TLDraw)
- **Memoization**: useMemo/useCallback for expensive computations

### Backend

- **Database Indexes**: Query optimization
- **Connection Pooling**: MongoDB driver handles automatically
- **Caching**: (Future) Redis for frequently accessed data

### Database

- **Embedded Documents**: Reduce joins
- **Projection**: Fetch only needed fields
- **Batch Operations**: Bulk inserts/updates where applicable

## Scalability Considerations

### Current Scale

- Single-user design (user_id='default-user')
- Suitable for 1-1000 tasks/ideas per user
- Local or small-scale deployment

### Future Scale

- Multi-user authentication
- Horizontal scaling with load balancer
- Database sharding by user_id
- CDN for static assets
- Microservices for heavy operations (e.g., canvas rendering)

## Technology Decisions

### Why Next.js?

- Modern React framework with built-in SSR/SSG
- App Router for better routing and layouts
- Excellent developer experience
- Strong TypeScript support

### Why MongoDB?

- Flexible schema for evolving features
- Native JSON support matches JavaScript/TypeScript
- Embedded documents for related data
- Easy to set up and scale

### Why Express?

- Minimal, unopinionated framework
- Large ecosystem of middleware
- TypeScript compatibility
- RESTful API patterns

### Why Context API over Redux?

- Simpler for application scale
- No additional dependencies
- Good enough for current complexity
- Can migrate to Redux/Zustand if needed

## Deployment Architecture

### Development

```
Developer Machine
├── Frontend (localhost:3000)
├── Backend (localhost:3001)
└── MongoDB (Docker: localhost:27017)
```

### Production (Recommended)

```
┌─────────────────────────┐
│   CDN / Static Assets   │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Next.js (Vercel/AWS)   │
│   Frontend + API Routes │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│  Express API (AWS/DO)   │
│    Backend Server       │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│ MongoDB Atlas (Cloud)   │
│   Managed Database      │
└─────────────────────────┘
```

## Monitoring and Logging

### Current Logging

- **Backend**: Morgan HTTP request logging
- **Errors**: Console.error with stack traces
- **Database**: Connection status logs

### Future Enhancements

- Structured logging (Winston/Pino)
- Application monitoring (Sentry)
- Performance monitoring (New Relic)
- Database query analytics
- User analytics (PostHog/Mixpanel)
