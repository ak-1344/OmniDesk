# API Reference

## AppContext API

The `AppContext` provides all state management and CRUD operations for OmniDesk.

### Importing

```typescript
import { useApp } from '../context/AppContext';

const {
  state,
  addDomain,
  updateDomain,
  // ... other functions
} = useApp();
```

## State Structure

### `state: AppState`

The complete application state.

```typescript
interface AppState {
  domains: Domain[];
  tasks: Task[];
  ideas: Idea[];
  events: CalendarEvent[];
  settings: AppSettings;
}
```

## Domain Operations

### `addDomain(domain: Omit<Domain, 'id'>): void`

Creates a new domain.

**Parameters**:
- `domain.name` (string): Domain name
- `domain.color` (string): Hex color code
- `domain.description` (string, optional): Domain description

**Example**:
```typescript
addDomain({
  name: 'Fitness',
  color: '#48bb78',
  description: 'Health and exercise goals'
});
```

### `updateDomain(id: string, updates: Partial<Domain>): void`

Updates an existing domain.

**Parameters**:
- `id` (string): Domain ID
- `updates` (Partial<Domain>): Fields to update

**Example**:
```typescript
updateDomain('domain-123', {
  name: 'Health & Fitness',
  color: '#38a169'
});
```

### `deleteDomain(id: string): void`

Deletes a domain. Warning: This also affects tasks in this domain.

**Parameters**:
- `id` (string): Domain ID

**Example**:
```typescript
deleteDomain('domain-123');
```

## Task Operations

### `addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): void`

Creates a new task.

**Parameters**:
- `task.title` (string): Task title
- `task.description` (string): Task description
- `task.domainId` (string): Associated domain ID
- `task.state` (TaskState): Initial state
- `task.deadline` (string, optional): ISO date string
- `task.notes` (string, optional): Additional notes
- `task.proof` (string[], optional): URLs or file paths

**Example**:
```typescript
addTask({
  title: 'Complete project documentation',
  description: 'Write comprehensive docs for the project',
  domainId: 'domain-work',
  state: 'gotta-start',
  deadline: '2025-12-31T23:59:59.000Z'
});
```

### `updateTask(id: string, updates: Partial<Task>): void`

Updates an existing task. Automatically updates `updatedAt` timestamp.

**Parameters**:
- `id` (string): Task ID
- `updates` (Partial<Task>): Fields to update

**Example**:
```typescript
updateTask('task-123', {
  state: 'in-progress',
  notes: 'Started working on this today'
});
```

### `deleteTask(id: string): void`

Soft deletes a task (moves to trash).

**Parameters**:
- `id` (string): Task ID

**Example**:
```typescript
deleteTask('task-123');
```

### `getTask(id: string): Task | undefined`

Retrieves a single task by ID.

**Parameters**:
- `id` (string): Task ID

**Returns**: Task object or undefined

**Example**:
```typescript
const task = getTask('task-123');
if (task) {
  console.log(task.title);
}
```

## Subtask Operations

### `addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): void`

Adds a subtask to an existing task with enhanced properties including description and deadline.

**Parameters**:
- `taskId` (string): Parent task ID
- `subtask.title` (string): Subtask title
- `subtask.description` (string, optional): Detailed subtask description
- `subtask.state` (SubtaskState): Initial state ('todo' | 'in-progress' | 'completed')
- `subtask.deadline` (string, optional): ISO date string for subtask deadline
- `subtask.scheduledTime` (object, optional): Scheduled time block
- `subtask.proof` (string, optional): URL or file path

**Example**:
```typescript
addSubtask('task-123', {
  title: 'Research best practices',
  description: 'Look into industry standards and common patterns',
  state: 'todo',
  deadline: '2025-12-25T17:00:00.000Z',
  scheduledTime: {
    date: '2025-12-24',
    startTime: '14:00',
    duration: 120 // minutes
  }
});
```

### `updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): void`

Updates a subtask.

**Parameters**:
- `taskId` (string): Parent task ID
- `subtaskId` (string): Subtask ID
- `updates` (Partial<Subtask>): Fields to update

**Example**:
```typescript
updateSubtask('task-123', 'subtask-456', {
  state: 'completed',
  completedAt: new Date().toISOString()
});
```

### `deleteSubtask(taskId: string, subtaskId: string): void`

Deletes a subtask.

**Parameters**:
- `taskId` (string): Parent task ID
- `subtaskId` (string): Subtask ID

**Example**:
```typescript
deleteSubtask('task-123', 'subtask-456');
```

## Idea Operations

### `addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): void`

Creates a new idea.

**Parameters**:
- `idea.title` (string, optional): Idea title
- `idea.text` (string): Idea content
- `idea.tags` (string[], optional): Tags for categorization

**Example**:
```typescript
addIdea({
  title: 'App Feature',
  text: 'Add dark mode toggle to settings',
  tags: ['feature', 'ui']
});
```

### `updateIdea(id: string, updates: Partial<Idea>): void`

Updates an existing idea.

**Parameters**:
- `id` (string): Idea ID
- `updates` (Partial<Idea>): Fields to update

**Example**:
```typescript
updateIdea('idea-123', {
  tags: ['feature', 'ui', 'priority']
});
```

### `deleteIdea(id: string): void`

Soft deletes an idea (moves to trash).

**Parameters**:
- `id` (string): Idea ID

**Example**:
```typescript
deleteIdea('idea-123');
```

### `convertIdeaToTask(ideaId: string, domainId: string, state: TaskState): void`

Converts an idea to a task.

**Parameters**:
- `ideaId` (string): Idea ID to convert
- `domainId` (string): Domain to assign the task to
- `state` (TaskState): Initial task state

**Example**:
```typescript
convertIdeaToTask('idea-123', 'domain-work', 'gotta-start');
```

## Calendar Event Operations

### `addEvent(event: Omit<CalendarEvent, 'id'>): void`

Creates a calendar event.

**Parameters**:
- `event.title` (string): Event title
- `event.description` (string, optional): Event description
- `event.date` (string): ISO date string
- `event.startTime` (string, optional): Time string (HH:mm)
- `event.endTime` (string, optional): Time string (HH:mm)
- `event.type` ('task-deadline' | 'subtask-scheduled' | 'personal-event')
- `event.relatedTaskId` (string, optional): Associated task ID
- `event.relatedSubtaskId` (string, optional): Associated subtask ID

**Example**:
```typescript
addEvent({
  title: 'Team Meeting',
  date: '2025-12-24',
  startTime: '10:00',
  endTime: '11:00',
  type: 'personal-event'
});
```

### `updateEvent(id: string, updates: Partial<CalendarEvent>): void`

Updates an event.

**Parameters**:
- `id` (string): Event ID
- `updates` (Partial<CalendarEvent>): Fields to update

**Example**:
```typescript
updateEvent('event-123', {
  startTime: '10:30',
  endTime: '11:30'
});
```

### `deleteEvent(id: string): void`

Deletes an event.

**Parameters**:
- `id` (string): Event ID

**Example**:
```typescript
deleteEvent('event-123');
```

## Settings Operations

### `updateSettings(updates: Partial<AppSettings>): void`

Updates application settings.

**Parameters**:
- `updates.theme` ('light' | 'dark' | 'auto', optional)
- `updates.defaultView` ('dashboard' | 'tasks' | 'calendar', optional)
- `updates.dateFormat` ('MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD', optional)
- `updates.weekStartsOn` ('sunday' | 'monday', optional)
- `updates.notifications` (object, optional)
- `updates.trashRetentionDays` (number, optional)

**Example**:
```typescript
updateSettings({
  theme: 'dark',
  notifications: {
    email: true,
    desktop: false,
    taskReminders: true
  },
  trashRetentionDays: 30
});
```

## Trash Operations

### `trash: TrashItem[]`

Array of deleted items.

```typescript
interface TrashItem {
  id: string;
  type: 'task' | 'idea' | 'subtask';
  item: Task | Idea | Subtask;
  deletedAt: string;
  deletedBy: string;
}
```

### `restoreFromTrash(id: string): void`

Restores a deleted item from trash.

**Parameters**:
- `id` (string): Trash item ID

**Example**:
```typescript
restoreFromTrash('trash-123');
```

### `permanentlyDelete(id: string): void`

Permanently deletes an item from trash.

**Parameters**:
- `id` (string): Trash item ID

**Example**:
```typescript
permanentlyDelete('trash-123');
```

### `emptyTrash(): void`

Permanently deletes all items in trash.

**Example**:
```typescript
emptyTrash();
```

## Type Definitions

### TaskState
```typescript
type TaskState = 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed';
```

### SubtaskState
```typescript
type SubtaskState = 'todo' | 'in-progress' | 'completed';
```

### Domain
```typescript
interface Domain {
  id: string;
  name: string;
  color: string;
  description?: string;
}
```

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  domainId: string;
  state: TaskState;
  deadline?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  proof?: string[];
}
```

### Subtask
```typescript
interface Subtask {
  id: string;
  title: string;
  description?: string;
  state: SubtaskState;
  deadline?: string;
  scheduledTime?: {
    date: string;
    startTime: string;
    duration: number;
  };
  proof?: string;
  completedAt?: string;
}
```

### Idea
```typescript
interface Idea {
  id: string;
  title?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}
```

### CalendarEvent
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'task-deadline' | 'subtask-scheduled' | 'personal-event';
  relatedTaskId?: string;
  relatedSubtaskId?: string;
}
```
