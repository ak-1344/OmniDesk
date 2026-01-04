# OmniDesk Development Guide

This guide covers development workflows, coding standards, and best practices for contributing to OmniDesk.

## Development Setup

See [SETUP.md](./SETUP.md) for initial installation instructions.

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start MongoDB
docker start omnidesk-mongodb

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
npm run dev
```

### Code Organization

Follow these conventions:

```
Frontend:
- Pages → /app/**/*page.tsx
- Components → /components/*.tsx
- UI Components → /components/ui/*.tsx
- Utilities → /lib/*.ts
- Types → /types/index.ts
- Context → /context/*.tsx

Backend:
- Routes → /backend/src/routes/*.ts
- Config → /backend/src/config/*.ts
- Utils → /backend/src/utils/*.ts
```

## Coding Standards

### TypeScript

**Use strict typing**:
```typescript
// ✅ Good
const task: Task = { ... }
function updateTask(id: string, updates: Partial<Task>): Promise<Task>

// ❌ Avoid
const task: any = { ... }
function updateTask(id, updates)
```

**Define interfaces for data structures**:
```typescript
interface Task {
  id: string
  title: string
  state: TaskState
  // ... all properties explicitly typed
}
```

### React Components

**Use functional components with hooks**:
```typescript
// ✅ Good
export function TaskCard({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = useState(false)
  // ...
}

// ❌ Avoid class components
```

**Client vs Server Components**:
```typescript
// Default: Server Component (for static content)
export default function Page() {
  return <div>Static content</div>
}

// Use "use client" for interactivity
"use client"
export function InteractiveComponent() {
  const [state, setState] = useState()
  // ... interactive logic
}
```

**Component file structure**:
```typescript
"use client" // if needed

import statements
// Group: external, internal, types

interface Props {
  // Component props
}

export function ComponentName({ prop1, prop2 }: Props) {
  // 1. Hooks
  // 2. Derived state
  // 3. Event handlers
  // 4. Effects
  // 5. Return JSX
}
```

### Naming Conventions

```typescript
// Files
task-detail.tsx     // kebab-case for files
TaskManager.tsx     // PascalCase for React components (optional)

// Variables
const taskList = [] // camelCase
const TASK_STATES = [] // UPPER_CASE for constants

// Functions
function handleSubmit() {} // camelCase, verb-based
function getUserTasks() {} // descriptive names

// Components
function TaskCard() {} // PascalCase

// Types/Interfaces
interface Task {} // PascalCase
type TaskState = string // PascalCase
```

### File Organization

**Keep files focused**:
- Each file should have a single primary export
- Group related functionality
- Extract reusable logic to separate files

**Component organization**:
```
components/
├── ui/              # Reusable UI primitives
│   ├── button.tsx
│   └── card.tsx
├── task-card.tsx    # Feature-specific components
├── task-list.tsx
└── task-detail.tsx
```

## State Management

### AppContext Pattern

```typescript
// 1. Define operations in AppContext
const AppContext = createContext<{
  state: AppState
  addTask: (task: Omit<Task, 'id'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
}>()

// 2. Use in components
const { state, addTask } = useApp()

// 3. Call operations
await addTask({
  title: "New task",
  domainId: "...",
  state: "gotta-start"
})
```

### Local State

Use `useState` for component-local state:
```typescript
const [isOpen, setIsOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState("")
```

### Derived State

Use `useMemo` for expensive computations:
```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(task => task.domainId === selectedDomain)
}, [tasks, selectedDomain])
```

## API Integration

### Frontend → Backend

```typescript
// Use storage adapter (recommended)
const storage = getStorage() // Returns MongoDBAdapter
await storage.addTask(task)

// Or direct fetch (for custom operations)
const response = await fetch(`${API_URL}/tasks`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(task)
})
```

### Error Handling

```typescript
// Frontend
try {
  await addTask(newTask)
  toast.success("Task created")
} catch (error) {
  toast.error(error.message || "Failed to create task")
}

// Backend
router.post('/tasks', async (req, res) => {
  try {
    // ... operation
    res.status(201).json(result)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({
      error: { message: 'Failed to create task' }
    })
  }
})
```

## Database Operations

### MongoDB Queries

```typescript
// Find with filter
const tasks = await db.collection('tasks').find({
  user_id: userId,
  deleted_at: { $exists: false }
}).toArray()

// Insert
const result = await db.collection('tasks').insertOne({
  user_id: userId,
  title: "New task",
  created_at: new Date()
})

// Update
await db.collection('tasks').updateOne(
  { _id: new ObjectId(id) },
  { $set: { title: "Updated", updated_at: new Date() } }
)

// Soft delete
await db.collection('tasks').updateOne(
  { _id: new ObjectId(id) },
  { $set: { deleted_at: new Date() } }
)

// Hard delete
await db.collection('tasks').deleteOne({
  _id: new ObjectId(id)
})
```

### Embedded Documents

```typescript
// Add subtask (embedded in task)
await db.collection('tasks').updateOne(
  { _id: new ObjectId(taskId) },
  {
    $push: {
      subtasks: {
        _id: new ObjectId().toString(),
        title: "New subtask",
        state: "todo"
      }
    },
    $set: { updated_at: new Date() }
  }
)

// Update subtask
await db.collection('tasks').updateOne(
  { _id: new ObjectId(taskId), 'subtasks._id': subtaskId },
  {
    $set: {
      'subtasks.$.state': 'completed',
      'subtasks.$.completed_at': new Date()
    }
  }
)
```

## Styling

### Tailwind CSS

**Use utility classes**:
```tsx
<div className="flex items-center gap-4 p-6 bg-card rounded-lg border">
  <Button className="bg-primary hover:bg-primary/90">Click</Button>
</div>
```

**Conditional classes with cn()**:
```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  "base classes",
  isActive && "active classes",
  variant === 'primary' && "primary classes"
)}>
```

**Custom colors (tailwind.config)**:
```javascript
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',
      accent: 'hsl(var(--accent))'
    }
  }
}
```

### shadcn/ui Components

**Install new components**:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

**Customize in components/ui/**:
```typescript
// components/ui/button.tsx
const buttonVariants = cva(
  "base styles",
  {
    variants: {
      variant: {
        default: "...",
        destructive: "...",
        outline: "..."
      }
    }
  }
)
```

## Testing

### Current State
**No formal tests implemented yet**

### Future Testing Strategy

```typescript
// Unit tests (Jest + React Testing Library)
describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText(mockTask.title)).toBeInTheDocument()
  })
})

// API tests (Supertest)
describe('POST /api/tasks', () => {
  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Test', domainId: '...' })
    expect(res.status).toBe(201)
  })
})
```

## Performance Optimization

### Frontend

**Code splitting**:
```typescript
// Lazy load heavy components
const TldrawEditor = lazy(() => import('@tldraw/tldraw'))

<Suspense fallback={<Spinner />}>
  <TldrawEditor />
</Suspense>
```

**Memoization**:
```typescript
// Expensive computations
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => /* ... */)
}, [tasks])

// Callback functions
const handleClick = useCallback(() => {
  /* ... */
}, [dependencies])
```

**Image optimization**:
```tsx
import Image from 'next/image'

<Image
  src="/image.png"
  alt="Description"
  width={300}
  height={200}
  loading="lazy"
/>
```

### Backend

**Database indexes**: Already configured in `config/database.ts`

**Projection** (fetch only needed fields):
```typescript
const tasks = await db.collection('tasks')
  .find({ user_id: userId })
  .project({ title: 1, state: 1 }) // Only fetch title and state
  .toArray()
```

## Debugging

### Frontend

**React DevTools**: Install browser extension

**Console logging**:
```typescript
console.log('State:', state)
console.table(tasks) // Table format for arrays
```

**Breakpoints**: Use browser DevTools or VS Code debugger

### Backend

**Morgan logging**: Already configured (logs all HTTP requests)

**Debug mode**:
```typescript
console.log('Request body:', req.body)
console.log('Database query:', { user_id: userId })
```

**MongoDB queries**:
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/omnidesk

# Query tasks
db.tasks.find({ user_id: 'default-user' }).pretty()
```

## Git Workflow

### Branching Strategy

```bash
main              # Production-ready code
├── develop       # Development branch
│   ├── feature/task-filtering
│   ├── feature/calendar-view
│   └── bugfix/task-deletion
```

### Commit Messages

Follow conventional commits:

```
feat: add task filtering by domain
fix: correct task deletion behavior
docs: update API documentation
style: format code with prettier
refactor: extract task card component
perf: optimize task list rendering
test: add task creation tests
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes with clear commits
3. Test locally
4. Push and create PR
5. Request review
6. Merge after approval

## Build and Deployment

### Frontend Build

```bash
npm run build     # Builds to .next/
npm start         # Runs production server
```

### Backend Build

```bash
cd backend
npm run build     # Compiles to dist/
npm start         # Runs compiled code
```

### Environment Variables

**Production checklist**:
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB URI (MongoDB Atlas)
- [ ] Set secure `JWT_SECRET` (when implemented)
- [ ] Update CORS `FRONTEND_URL`
- [ ] Use HTTPS URLs

### Deployment Platforms

**Frontend** (Choose one):
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Railway

**Backend** (Choose one):
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Heroku

**Database**:
- MongoDB Atlas (recommended)

## Troubleshooting

### Common Issues

**Problem**: Changes not reflecting
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Problem**: TypeScript errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**Problem**: Database connection fails
```bash
# Check MongoDB is running
docker ps

# Restart container
docker restart omnidesk-mongodb
```

**Problem**: Port already in use
```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

## Code Review Checklist

- [ ] TypeScript types are explicit
- [ ] No `any` types without justification
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design works
- [ ] Accessibility considered
- [ ] Database queries optimized
- [ ] No console.logs in production code
- [ ] Comments for complex logic
- [ ] Tests added (when testing is implemented)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## Getting Help

- Review existing code in the repository
- Check documentation in `/docs`
- Search GitHub issues
- Ask in team channels
- Contact maintainers
