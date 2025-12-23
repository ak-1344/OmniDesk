# Architecture Overview

## Project Structure

```
OmniDesk/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, icons, fonts
│   ├── components/     # Reusable UI components
│   │   ├── Sidebar.tsx
│   │   ├── CreateTaskModal.tsx
│   │   ├── ConvertIdeaModal.tsx
│   │   └── *.css
│   ├── context/        # React context providers
│   │   └── AppContext.tsx
│   ├── pages/          # Route-based page components
│   │   ├── Dashboard.tsx
│   │   ├── Tasks.tsx
│   │   ├── TaskDetail.tsx
│   │   ├── Ideas.tsx
│   │   ├── Calendar.tsx
│   │   ├── AllTasks.tsx
│   │   ├── Terminal.tsx
│   │   ├── Trash.tsx
│   │   ├── Settings.tsx
│   │   ├── Portfolio.tsx
│   │   └── *.css
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── App.css         # App-level styles
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── docs/               # Documentation
├── .github/workflows/  # CI/CD pipelines
└── configuration files
```

## Core Concepts

### State Management

OmniDesk uses React Context for global state management. The `AppContext` provides:

- **Centralized State**: All domains, tasks, ideas, events, and settings
- **CRUD Operations**: Functions for creating, reading, updating, and deleting entities
- **Persistence**: Automatic localStorage sync
- **Trash Management**: Soft delete with restore capability

### Data Flow

```
User Action → Component Event Handler → Context Function → State Update → localStorage Sync → Re-render
```

### Component Hierarchy

```
App (Router)
├── Sidebar (Navigation)
└── Main Content
    └── Routes
        ├── Dashboard
        ├── Tasks
        ├── TaskDetail
        ├── Ideas
        ├── Calendar
        ├── AllTasks
        ├── Terminal
        ├── Trash
        ├── Settings
        └── Portfolio
```

## Key Design Patterns

### 1. Provider Pattern
The `AppProvider` wraps the entire application, making state and operations available to all components via `useApp()` hook.

```typescript
<AppProvider>
  <Router>
    <App />
  </Router>
</AppProvider>
```

### 2. Custom Hooks
The `useApp()` hook provides type-safe access to app context:

```typescript
const { state, addTask, updateTask, deleteTask } = useApp();
```

### 3. Compound Components
Modals and forms use compound component patterns for flexibility.

### 4. Local-First Architecture
All data stored in browser localStorage with no backend dependency:
- **Fast**: No network latency
- **Private**: Data never leaves the device
- **Offline**: Works without internet
- **Simple**: No server infrastructure needed

## State Schema

### AppState
```typescript
{
  domains: Domain[],
  tasks: Task[],
  ideas: Idea[],
  events: CalendarEvent[],
  settings: AppSettings
}
```

### Task Entity
```typescript
{
  id: string,
  title: string,
  description: string,
  domainId: string,
  state: TaskState,
  deadline?: string,
  subtasks: Subtask[],
  createdAt: string,
  updatedAt: string,
  notes?: string,
  proof?: string[]
}
```

## Routing

Client-side routing with React Router v7:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Overview and stats |
| `/tasks` | Tasks | Task list by domain |
| `/tasks/:id` | TaskDetail | Single task view with subtasks |
| `/ideas` | Ideas | Idea capture and management |
| `/all-tasks` | AllTasks | All tasks across domains |
| `/calendar` | Calendar | Event and deadline calendar |
| `/terminal` | Terminal | Developer tools/logs |
| `/trash` | Trash | Deleted items with restore |
| `/settings` | Settings | App configuration |
| `/portfolio` | Portfolio | Project showcase |

## Styling Architecture

### CSS Organization
- **Global styles**: `index.css` - CSS variables, resets, utilities
- **Component styles**: Co-located `.css` files with components
- **Themed**: CSS custom properties for easy theming

### Design System
- **Colors**: Semantic color variables (`--accent-primary`, `--text-secondary`)
- **Spacing**: Consistent rem-based spacing
- **Typography**: System font stack with fallbacks
- **Animations**: Subtle transitions and transforms

### Glassmorphism
Modern glass-like effects using:
- `backdrop-filter: blur()`
- Semi-transparent backgrounds
- Layered shadows
- Gradient accents

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Route-based code splitting (can be added)
2. **Memoization**: React.memo for expensive components
3. **Virtual Scrolling**: For large task lists (can be added)
4. **Debouncing**: Search and filter inputs
5. **Local Storage**: Efficient serialization

### Bundle Size
- Tree-shaking with Vite
- Minimal dependencies
- No heavy libraries

## Extending OmniDesk

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in `Sidebar.tsx`
4. Define types in `src/types/index.ts` if needed

### Adding a New Entity Type

1. Define interface in `src/types/index.ts`
2. Add to `AppState` interface
3. Create CRUD functions in `AppContext.tsx`
4. Add localStorage persistence
5. Create UI components

### Adding a Feature

1. Plan state changes needed
2. Update types if necessary
3. Add context functions
4. Build UI components
5. Update documentation

## Testing Strategy (Recommended)

### Unit Tests
- Context functions
- Utility helpers
- Type guards

### Integration Tests
- Component interactions
- State updates
- localStorage sync

### E2E Tests
- User workflows
- Cross-page navigation
- Data persistence

## Security Considerations

### Data Privacy
- All data stored locally
- No external API calls
- No telemetry or tracking

### XSS Prevention
- React's built-in escaping
- Sanitize user input for descriptions

### Best Practices
- TypeScript for type safety
- ESLint for code quality
- Regular dependency updates

## Future Architecture Plans

- [ ] Plugin system for extensibility
- [ ] IndexedDB migration for larger datasets
- [ ] Service Worker for offline functionality
- [ ] Web Worker for background processing
- [ ] Optional cloud sync with E2E encryption
