# State Management Guide

## Overview

OmniDesk uses React Context API for centralized state management with localStorage persistence. This approach provides simplicity without external dependencies while maintaining type safety with TypeScript.

## Architecture

### Context Provider Pattern

```
AppProvider (context/AppContext.tsx)
    ├── State Management
    ├── CRUD Operations
    ├── localStorage Sync
    └── useApp Hook Export
```

## State Structure

### Complete State Shape

```typescript
interface AppState {
  domains: Domain[];
  tasks: Task[];
  ideas: Idea[];
  events: CalendarEvent[];
  settings: AppSettings;
}
```

### State Initialization

```typescript
const initialState: AppState = {
  domains: defaultDomains,
  tasks: [],
  ideas: [],
  events: [],
  settings: defaultSettings,
};
```

State is loaded from localStorage on mount, falling back to initial state if not found.

## Persistence Layer

### Automatic Sync

State automatically syncs to localStorage whenever it changes:

```typescript
useEffect(() => {
  localStorage.setItem('omniDesk_state', JSON.stringify(state));
}, [state]);
```

### Storage Keys

- `omniDesk_state`: Main application state
- `omniDesk_trash`: Deleted items

### Data Recovery

```typescript
const [state, setState] = useState<AppState>(() => {
  const saved = localStorage.getItem('omniDesk_state');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved state:', e);
      return initialState;
    }
  }
  return initialState;
});
```

## State Updates

### Immutable Update Pattern

All state updates create new objects to ensure React detects changes:

```typescript
const addTask = (task) => {
  setState(prev => ({
    ...prev,
    tasks: [...prev.tasks, newTask]
  }));
};

const updateTask = (id, updates) => {
  setState(prev => ({
    ...prev,
    tasks: prev.tasks.map(t => 
      t.id === id ? { ...t, ...updates } : t
    )
  }));
};
```

### Complex Nested Updates

For subtasks within tasks:

```typescript
const updateSubtask = (taskId, subtaskId, updates) => {
  setState(prev => ({
    ...prev,
    tasks: prev.tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            subtasks: task.subtasks.map(sub =>
              sub.id === subtaskId ? { ...sub, ...updates } : sub
            ),
            updatedAt: new Date().toISOString()
          }
        : task
    )
  }));
};
```

## Accessing State

### Using the Hook

```typescript
import { useApp } from '../context/AppContext';

function MyComponent() {
  const { state, addTask, updateTask, deleteTask } = useApp();
  
  // Access state
  const tasks = state.tasks;
  const domains = state.domains;
  
  // Use operations
  const handleCreate = () => {
    addTask({...});
  };
  
  return <div>{/* component JSX */}</div>;
}
```

### Type Safety

The hook is fully typed, providing autocomplete and type checking:

```typescript
const { state, addTask } = useApp();
//      ^                  ^
//      |                  |
//   AppState          (task: Omit<Task, 'id'>) => void
```

## Derived State

### Computed Values

Calculate derived data in components:

```typescript
function Dashboard() {
  const { state } = useApp();
  
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.state === 'completed').length;
  const inProgressTasks = state.tasks.filter(t => t.state === 'in-progress').length;
  
  // Use memoization for expensive computations
  const tasksByDomain = useMemo(() => {
    return state.domains.map(domain => ({
      domain,
      tasks: state.tasks.filter(t => t.domainId === domain.id)
    }));
  }, [state.tasks, state.domains]);
  
  return <div>{/* render */}</div>;
}
```

### Custom Hooks for Derived State

```typescript
// hooks/useDomainStats.ts
function useDomainStats() {
  const { state } = useApp();
  
  return useMemo(() => {
    return state.domains.map(domain => {
      const tasks = state.tasks.filter(t => t.domainId === domain.id);
      return {
        domain,
        totalTasks: tasks.length,
        completed: tasks.filter(t => t.state === 'completed').length,
        pending: tasks.filter(t => t.state !== 'completed').length
      };
    });
  }, [state.domains, state.tasks]);
}
```

## Performance Optimization

### Selective Re-renders

Components only re-render when they use changed state:

```typescript
// Only re-renders when tasks change
function TaskList() {
  const { state } = useApp();
  const tasks = state.tasks; // References same array until tasks update
  
  return <div>{tasks.map(...)}</div>;
}
```

### Memoization

Use React.memo for expensive components:

```typescript
const TaskCard = React.memo(({ task }) => {
  return <div>{task.title}</div>;
}, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.updatedAt === nextProps.task.updatedAt;
});
```

### Batched Updates

React automatically batches state updates in event handlers:

```typescript
const handleBulkUpdate = () => {
  addTask(task1);      // \
  addTask(task2);      //  > Single re-render
  updateSettings({});  // /
};
```

## State Migration

### Versioning

Add version to state for future migrations:

```typescript
interface AppState {
  version: number;
  domains: Domain[];
  tasks: Task[];
  // ...
}

const CURRENT_VERSION = 1;

function migrateState(savedState: any): AppState {
  if (!savedState.version || savedState.version < CURRENT_VERSION) {
    return applyMigrations(savedState);
  }
  return savedState;
}
```

### Handling Schema Changes

```typescript
function applyMigrations(state: any): AppState {
  let migrated = { ...state };
  
  // Migration from version 0 to 1: Add subtasks array
  if (!migrated.version) {
    migrated.tasks = migrated.tasks.map(task => ({
      ...task,
      subtasks: task.subtasks || []
    }));
    migrated.version = 1;
  }
  
  return migrated;
}
```

## Testing State

### Unit Testing Context Functions

```typescript
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';

test('addTask adds a task to state', () => {
  const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
  const { result } = renderHook(() => useApp(), { wrapper });
  
  act(() => {
    result.current.addTask({
      title: 'Test Task',
      description: 'Test',
      domainId: 'domain-1',
      state: 'gotta-start'
    });
  });
  
  expect(result.current.state.tasks).toHaveLength(1);
  expect(result.current.state.tasks[0].title).toBe('Test Task');
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from './context/AppContext';
import App from './App';

test('creates task from dashboard', () => {
  render(
    <AppProvider>
      <App />
    </AppProvider>
  );
  
  fireEvent.click(screen.getByText('Create Task'));
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'New Task' }
  });
  fireEvent.click(screen.getByText('Save'));
  
  expect(screen.getByText('New Task')).toBeInTheDocument();
});
```

## Best Practices

### 1. Single Source of Truth
Keep all shared state in context, avoid duplicating in local state:

```typescript
// ❌ Bad: Duplicating context state
function MyComponent() {
  const { state } = useApp();
  const [tasks, setTasks] = useState(state.tasks); // Don't do this
  
  return <div>{tasks.map(...)}</div>;
}

// ✅ Good: Use context directly
function MyComponent() {
  const { state } = useApp();
  
  return <div>{state.tasks.map(...)}</div>;
}
```

### 2. Optimistic Updates
Update UI immediately, revert on error:

```typescript
const handleUpdate = async (taskId, updates) => {
  const previousState = state;
  
  // Optimistically update
  updateTask(taskId, updates);
  
  try {
    await syncToServer(taskId, updates);
  } catch (error) {
    // Revert on error
    setState(previousState);
    showError('Update failed');
  }
};
```

### 3. Atomic Operations
Keep operations atomic and predictable:

```typescript
// ✅ Good: Single operation
const deleteTaskAndSubtasks = (taskId) => {
  setState(prev => ({
    ...prev,
    tasks: prev.tasks.filter(t => t.id !== taskId),
    events: prev.events.filter(e => e.relatedTaskId !== taskId)
  }));
};

// ❌ Bad: Multiple separate updates
const deleteTaskAndSubtasks = (taskId) => {
  deleteTask(taskId);
  deleteRelatedEvents(taskId); // Separate update
};
```

### 4. Clear Operation Names
Use descriptive function names:

```typescript
// ✅ Good
addTask, updateTask, deleteTask, convertIdeaToTask

// ❌ Bad
add, update, remove, convert
```

### 5. Input Validation
Validate before updating state:

```typescript
const addTask = (task) => {
  if (!task.title || !task.domainId) {
    throw new Error('Title and domain are required');
  }
  
  // Proceed with add
  setState(prev => ({...}));
};
```
