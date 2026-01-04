# Components Guide

## Core Components

### Sidebar

**Location**: `src/components/Sidebar.tsx`

The main navigation component with glassmorphism styling and lock/unlock functionality.

**Props**: None (uses React Router for navigation)

**Features**:
- Responsive navigation menu
- Lock/unlock sidebar for persistent visibility
- Auto-collapse when unlocked (hover to expand)
- Active route highlighting
- Gradient logo
- Smooth hover and transition animations
- LocalStorage persistence for lock state

**Usage**:
```tsx
<Sidebar />
```

### FloatingTrash

**Location**: `src/components/FloatingTrash.tsx`

A floating trash can component that accepts drag-and-drop for task deletion.

**Props**: None (uses AppContext for task operations)

**Features**:
- Fixed position in bottom-right corner
- Drag-and-drop target for tasks
- Visual feedback animations (pulse, wiggle, shake)
- "Drop to delete" hint on drag-over
- Instant task deletion with confirmation animation

**Usage**:
```tsx
<FloatingTrash />
```

### CreateTaskModal

**Location**: `src/components/CreateTaskModal.tsx`

Modal for creating new tasks.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  preselectedDomainId?: string;
  preselectedState?: TaskState;
}
```

**Features**:
- Domain selection
- State dropdown
- Deadline picker
- Description textarea
- Form validation

**Usage**:
```tsx
<CreateTaskModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  preselectedDomainId="domain-123"
  preselectedState="in-progress"
/>
```

### ConvertIdeaModal

**Location**: `src/components/ConvertIdeaModal.tsx`

Modal for converting ideas to tasks.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}
```

**Features**:
- Pre-filled from idea content
- Domain assignment
- State selection
- Deletes idea after conversion

**Usage**:
```tsx
<ConvertIdeaModal
  isOpen={showConvert}
  onClose={() => setShowConvert(false)}
  idea={selectedIdea}
/>
```

## Page Components

### Dashboard

**Location**: `src/pages/Dashboard.tsx`

Main overview page showing task statistics and quick access.

**Features**:
- Stats cards (total tasks, in progress, completed)
- Domain filter
- State filter
- Task groups by state
- Quick action buttons

**State**:
```typescript
const [selectedDomain, setSelectedDomain] = useState('all');
const [selectedState, setSelectedState] = useState<TaskState | 'all'>('all');
```

### Tasks

**Location**: `src/pages/Tasks.tsx`

Domain-based task view with grouping.

**Features**:
- Domain tabs
- Create task button
- Task cards with state indicators
- Click to navigate to detail

**Sections**:
- Gotta Start
- In Progress
- Nearly Done
- Completed

### TaskDetail

**Location**: `src/pages/TaskDetail.tsx`

Detailed view of a single task with enhanced subtask management.

**Features**:
- Edit task title, description, state
- Kanban-style subtask board with drag-and-drop
- Add/edit/delete subtasks with:
  - Title
  - Description
  - Deadline
  - State tracking
- Add notes
- Upload proof
- Delete task (moves to trash)
- Custom column management

**URL Parameters**:
```
/tasks/:id
```

### Ideas

**Location**: `src/pages/Ideas.tsx`

Notion-inspired minimalist idea capture and management interface.

**Features**:
- Clean, distraction-free input area
- Minimal UI with hover-only actions
- Quick idea capture with Ctrl+Enter
- Convert to task
- Delete (moves to trash)
- Timestamp tracking
- No forced structure or organization

**State**:
```typescript
const [newIdeaText, setNewIdeaText] = useState('');
const [convertingIdeaId, setConvertingIdeaId] = useState<string | null>(null);
const [editingId, setEditingId] = useState<string | null>(null);
```

### AllTasks

**Location**: `src/pages/AllTasks.tsx`

Unified view of all tasks across all domains.

**Features**:
- Complete task list
- State filtering
- Domain filtering
- Sort options
- Bulk operations (coming soon)

### Calendar

**Location**: `src/pages/Calendar.tsx`

Dynamic calendar view showing current month with event management.

**Features**:
- Displays current month (December 2025)
- Month/year navigation
- Today highlighting
- Task deadlines display
- Scheduled subtasks
- Personal events
- Event creation and editing
- First day of week calculation

**State**:
```typescript
const [currentDate, setCurrentDate] = useState(new Date());
```

**Location**: `src/pages/Calendar.tsx`

Calendar view of events and deadlines.

**Features**:
- Month/week/day views
- Task deadlines displayed
- Subtask scheduled times
- Personal events
- Click to navigate to task

**State**:
```typescript
const [currentDate, setCurrentDate] = useState(new Date());
const [view, setView] = useState<'month' | 'week' | 'day'>('month');
```

### Trash

**Location**: `src/pages/Trash.tsx`

Trash management with restore functionality.

**Features**:
- List deleted items (tasks, ideas)
- Restore button
- Permanent delete
- Empty trash
- Auto-cleanup after retention period

### Settings

**Location**: `src/pages/Settings.tsx`

Application configuration.

**Sections**:
- **Appearance**: Theme, color scheme
- **Domains**: Add/edit/delete domains
- **Notifications**: Email, desktop, reminders
- **Data**: Export/import, clear data
- **About**: Version, license

### Portfolio

**Location**: `src/pages/Portfolio.tsx`

Showcase completed projects and achievements.

**Features**:
- Completed task showcase
- Project grouping
- Achievement tracking
- Statistics

### Terminal

**Location**: `src/pages/Terminal.tsx`

Developer tools and debugging interface.

**Features**:
- State inspector
- localStorage viewer
- Debug commands
- Performance metrics

## Common Patterns

### Using the App Context

```typescript
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { state, addTask, updateTask } = useApp();
  
  const handleCreateTask = () => {
    addTask({
      title: 'New Task',
      description: 'Task description',
      domainId: 'domain-1',
      state: 'gotta-start'
    });
  };
  
  return <button onClick={handleCreateTask}>Create</button>;
}
```

### Modal Pattern

```typescript
const [isOpen, setIsOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsOpen(true)}>Open Modal</button>
    <MyModal 
      isOpen={isOpen} 
      onClose={() => setIsOpen(false)}
    />
  </>
);
```

### List Rendering

```typescript
{state.tasks.map(task => (
  <TaskCard 
    key={task.id}
    task={task}
    onClick={() => navigate(`/tasks/${task.id}`)}
  />
))}
```

### Conditional Rendering

```typescript
{state.tasks.length === 0 ? (
  <EmptyState message="No tasks yet" />
) : (
  <TaskList tasks={state.tasks} />
)}
```

## Styling Components

### Component-Scoped CSS

Each component has a corresponding `.css` file:

```css
/* Dashboard.css */
.dashboard {
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

### Using CSS Variables

```css
.card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
}
```

### Glassmorphism Effect

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## Accessibility

### Keyboard Navigation
- All interactive elements focusable
- Tab order follows visual order
- Enter/Space activates buttons

### ARIA Labels
```tsx
<button aria-label="Create new task">
  <PlusIcon />
</button>
```

### Semantic HTML
```tsx
<nav aria-label="Main navigation">
  <ul>
    <li><Link to="/">Dashboard</Link></li>
  </ul>
</nav>
```

## Best Practices

1. **Keep components focused**: One responsibility per component
2. **Co-locate styles**: Keep CSS with related component
3. **Type everything**: Use TypeScript interfaces
4. **Extract logic**: Move complex logic to custom hooks
5. **Avoid prop drilling**: Use context for deep props
6. **Handle errors**: Graceful error states and boundaries
7. **Optimize re-renders**: Use React.memo when appropriate
8. **Accessibility first**: ARIA labels and keyboard support
