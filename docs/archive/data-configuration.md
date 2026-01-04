# Data Configuration Guide

## Overview

This document specifies all data structures, configuration files, and storage requirements for OmniDesk. It serves as a comprehensive reference for understanding how data is structured, stored, and managed within the application.

## Data Storage Options

OmniDesk supports two storage backends:

1. **LocalStorage** (Default): Browser-based persistence, no backend required
2. **Supabase** (Optional): Cloud-based PostgreSQL database with real-time capabilities

## Data Entities

### 1. Domains

Domains are top-level categories for organizing tasks (e.g., College, Work, Personal, Health).

**TypeScript Interface:**
```typescript
interface Domain {
  id: string;              // Unique identifier (UUID or generated ID)
  name: string;            // Domain name (required)
  color: string;           // Hex color code for visual identification
  description?: string;    // Optional description
}
```

**Default Domains:**
```json
[
  { "id": "1", "name": "College", "color": "#667eea", "description": "Academic work and studies" },
  { "id": "2", "name": "Personal", "color": "#48bb78", "description": "Personal projects and growth" },
  { "id": "3", "name": "Work", "color": "#ed8936", "description": "Professional work" },
  { "id": "4", "name": "Health", "color": "#f56565", "description": "Health and fitness" }
]
```

**Storage:**
- LocalStorage: Part of `omniDesk_state` object
- Supabase: `domains` table with user_id foreign key

**Configuration Requirements:**
- Domain names must be unique per user
- Color must be a valid hex color code
- At least one domain must exist

---

### 2. Tasks

Core task management entity with support for states, deadlines, and subtasks.

**TypeScript Interface:**
```typescript
type TaskState = 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed';

interface Task {
  id: string;                // Unique identifier
  title: string;             // Task title (required)
  description: string;       // Task description
  domainId: string;          // Foreign key to Domain
  state: TaskState;          // Current task state
  deadline?: string;         // ISO 8601 datetime string
  subtasks: Subtask[];       // Array of subtasks
  createdAt: string;         // ISO 8601 datetime
  updatedAt: string;         // ISO 8601 datetime
  deletedAt?: string;        // ISO 8601 datetime (for soft delete)
  notes?: string;            // Additional notes
  proof?: string[];          // Array of URLs or file paths
}
```

**Valid Task States:**
- `gotta-start`: Task not yet started
- `in-progress`: Currently being worked on
- `nearly-done`: Almost complete
- `paused`: Temporarily on hold
- `completed`: Task finished

**Storage:**
- LocalStorage: Part of `omniDesk_state.tasks` array
- Supabase: `tasks` table with foreign key to domains

**Configuration Requirements:**
- Title is required (non-empty string)
- domainId must reference a valid domain
- Timestamps should be ISO 8601 format
- State must be one of the valid TaskState values

---

### 3. Subtasks

Granular breakdown of tasks with individual tracking.

**TypeScript Interface:**
```typescript
type SubtaskState = 'todo' | 'in-progress' | 'completed';

interface Subtask {
  id: string;                  // Unique identifier
  title: string;               // Subtask title (required)
  description?: string;        // Optional description
  state: SubtaskState;         // Current subtask state
  deadline?: string;           // ISO 8601 datetime string
  scheduledTime?: {            // Time blocking
    date: string;              // ISO 8601 date
    startTime: string;         // Time in HH:mm format
    duration: number;          // Duration in minutes
  };
  proof?: string;              // URL or file path for completion proof
  completedAt?: string;        // ISO 8601 datetime when completed
}
```

**Valid Subtask States:**
- `todo`: Not started
- `in-progress`: Being worked on
- `completed`: Finished

**Storage:**
- LocalStorage: Nested within Task objects in `tasks.subtasks` array
- Supabase: Separate `subtasks` table with task_id foreign key

**Configuration Requirements:**
- Title is required
- State must be one of the valid SubtaskState values
- scheduledTime.duration must be a positive integer
- scheduledTime.startTime must be in HH:mm format (24-hour)

---

### 4. Ideas

Notion-inspired idea capture with flexible content types.

**TypeScript Interface:**
```typescript
type NoteContentType = 'text' | 'image' | 'whiteboard';

interface NoteContent {
  id: string;                  // Unique identifier
  type: NoteContentType;       // Content type
  content: string;             // Content data (text, URL, or JSON)
  createdAt: string;           // ISO 8601 datetime
  order: number;               // Display order
}

interface Idea {
  id: string;                  // Unique identifier
  title: string;               // Idea title
  color?: string;              // Sticky note color (hex code)
  folderId?: string;           // Optional folder for organization
  notes: NoteContent[];        // Array of content pieces
  createdAt: string;           // ISO 8601 datetime
  updatedAt: string;           // ISO 8601 datetime
  deletedAt?: string;          // ISO 8601 datetime (for soft delete)
  tags?: string[];             // Array of tag strings
  position?: {                 // Position for canvas layout
    x: number;
    y: number;
  };
}
```

**Storage:**
- LocalStorage: Part of `omniDesk_state.ideas` array
- Supabase: `ideas` table with separate `note_contents` table for notes

**Configuration Requirements:**
- At least one note content piece recommended
- NoteContent order must be sequential integers starting from 0
- For image type, content should be a valid URL
- For whiteboard type, content should be valid JSON

---

### 5. Idea Folders

Organization system for ideas.

**TypeScript Interface:**
```typescript
interface IdeaFolder {
  id: string;                  // Unique identifier
  name: string;                // Folder name (required)
  color?: string;              // Optional color (hex code)
  createdAt: string;           // ISO 8601 datetime
}
```

**Storage:**
- LocalStorage: Part of `omniDesk_state.ideaFolders` array
- Supabase: `idea_folders` table with user_id foreign key

**Configuration Requirements:**
- Folder names should be unique per user
- Color must be a valid hex color code if provided

---

### 6. Calendar Events

Events linked to tasks, subtasks, or standalone personal events.

**TypeScript Interface:**
```typescript
interface CalendarEvent {
  id: string;                     // Unique identifier
  title: string;                  // Event title (required)
  description?: string;           // Optional description
  date: string;                   // ISO 8601 date (YYYY-MM-DD)
  startTime?: string;             // Time in HH:mm format
  endTime?: string;               // Time in HH:mm format
  type: 'task-deadline' | 'subtask-scheduled' | 'personal-event';
  relatedTaskId?: string;         // Foreign key to Task (if type is task-deadline)
  relatedSubtaskId?: string;      // Foreign key to Subtask (if type is subtask-scheduled)
}
```

**Event Types:**
- `task-deadline`: Automatically created from task deadlines
- `subtask-scheduled`: Automatically created from subtask scheduled times
- `personal-event`: User-created standalone events

**Storage:**
- LocalStorage: Part of `omniDesk_state.events` array
- Supabase: `calendar_events` table with foreign keys

**Configuration Requirements:**
- date must be valid ISO 8601 date format (YYYY-MM-DD)
- startTime and endTime must be HH:mm format (24-hour)
- If type is 'task-deadline', relatedTaskId must be provided
- If type is 'subtask-scheduled', relatedSubtaskId must be provided

---

### 7. Settings

User preferences and application configuration.

**TypeScript Interface:**
```typescript
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'dashboard' | 'tasks' | 'calendar';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  weekStartsOn: 'sunday' | 'monday';
  notifications: {
    email: boolean;
    desktop: boolean;
    taskReminders: boolean;
  };
  trashRetentionDays: number;   // Days before auto-delete from trash
}
```

**Default Settings:**
```json
{
  "theme": "dark",
  "defaultView": "dashboard",
  "dateFormat": "YYYY-MM-DD",
  "weekStartsOn": "monday",
  "notifications": {
    "email": true,
    "desktop": true,
    "taskReminders": true
  },
  "trashRetentionDays": 30
}
```

**Storage:**
- LocalStorage: Part of `omniDesk_state.settings` object
- Supabase: `user_settings` table with user_id primary/foreign key

**Configuration Requirements:**
- theme must be one of: 'light', 'dark', 'auto'
- defaultView must be one of: 'dashboard', 'tasks', 'calendar'
- dateFormat must be one of the specified formats
- trashRetentionDays must be a positive integer (recommended: 7-90 days)

---

### 8. Trash Items

Soft-deleted items with restore capability.

**TypeScript Interface:**
```typescript
interface TrashItem {
  id: string;                     // Unique trash item identifier
  type: 'task' | 'idea' | 'subtask';
  item: Task | Idea | Subtask;   // The deleted item
  deletedAt: string;              // ISO 8601 datetime
  deletedBy: string;              // User identifier
}
```

**Storage:**
- LocalStorage: Separate `omniDesk_trash` array
- Supabase: Items marked with `deleted_at` timestamp in respective tables

**Configuration Requirements:**
- Items should auto-delete after `trashRetentionDays` from settings
- Deleted items should maintain all relationships for restore
- Restore should place item back in its original location

---

## Complete State Structure

**LocalStorage Schema:**
```typescript
interface AppState {
  domains: Domain[];
  tasks: Task[];
  ideas: Idea[];
  ideaFolders: IdeaFolder[];
  events: CalendarEvent[];
  settings: AppSettings;
  customTaskStates?: TaskState[];
  customSubtaskStates?: SubtaskState[];
}
```

**LocalStorage Keys:**
- `omniDesk_state`: Main application state (JSON serialized AppState)
- `omniDesk_trash`: Trash items array (JSON serialized TrashItem[])

---

## Data Relationships

### Entity Relationship Diagram

```
User (Supabase Auth)
  ├── has many → Domains
  ├── has many → Tasks
  │   ├── belongs to → Domain
  │   └── has many → Subtasks
  ├── has many → Ideas
  │   ├── belongs to → IdeaFolder (optional)
  │   └── has many → NoteContents
  ├── has many → IdeaFolders
  ├── has many → CalendarEvents
  │   ├── may reference → Task
  │   └── may reference → Subtask
  └── has one → Settings
```

### Foreign Key Relationships

1. **Tasks → Domains**: `tasks.domainId` references `domains.id`
2. **Subtasks → Tasks**: `subtasks.taskId` references `tasks.id`
3. **Ideas → IdeaFolders**: `ideas.folderId` references `ideaFolders.id` (optional)
4. **NoteContents → Ideas**: `noteContents.ideaId` references `ideas.id`
5. **CalendarEvents → Tasks**: `events.relatedTaskId` references `tasks.id` (optional)
6. **CalendarEvents → Subtasks**: `events.relatedSubtaskId` references `subtasks.id` (optional)

---

## Data Validation Rules

### Input Validation

1. **Required Fields:**
   - Domain: name, color
   - Task: title, domainId, state
   - Subtask: title, state
   - Idea: title
   - CalendarEvent: title, date, type
   - Settings: all fields required

2. **Format Validation:**
   - Dates: ISO 8601 format (YYYY-MM-DD)
   - DateTimes: ISO 8601 format with timezone
   - Times: HH:mm format (24-hour)
   - Colors: Hex format (#RRGGBB)
   - URLs: Valid URL format for images and proof

3. **Constraint Validation:**
   - Task state must be valid TaskState
   - Subtask state must be valid SubtaskState
   - Domain references must exist
   - Trash retention days: 1-365 range

### Data Integrity

1. **Cascade Deletes:**
   - Deleting a domain should move its tasks to trash
   - Deleting a task should delete its subtasks
   - Deleting a task should remove related calendar events
   - Deleting an idea should delete its note contents

2. **Referential Integrity:**
   - Tasks cannot reference non-existent domains
   - Calendar events cannot reference non-existent tasks/subtasks
   - Ideas cannot reference non-existent folders

---

## Configuration Files

### Environment Variables

For Supabase integration, create a `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Storage Configuration
NEXT_PUBLIC_STORAGE_BACKEND=supabase  # or 'localstorage'
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=true
NEXT_PUBLIC_SYNC_INTERVAL_MS=30000    # 30 seconds
```

### Supabase Project Configuration

Required Supabase features:
- **Database**: PostgreSQL with tables for all entities
- **Authentication**: Email/password or OAuth providers
- **Row Level Security**: Enabled for all tables
- **Real-time**: Enabled for live updates
- **Storage** (optional): For file uploads (proof images, etc.)

---

## Data Migration

### From LocalStorage to Supabase

1. **Export LocalStorage data:**
   ```javascript
   const state = JSON.parse(localStorage.getItem('omniDesk_state'));
   const trash = JSON.parse(localStorage.getItem('omniDesk_trash'));
   ```

2. **Transform and upload:**
   - Add user_id to all records
   - Maintain ID consistency for relationships
   - Preserve timestamps
   - Upload in dependency order (domains → tasks → subtasks)

3. **Verify migration:**
   - Check record counts
   - Verify relationships
   - Test CRUD operations

### Backup and Restore

**Export Format (JSON):**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-12-23T19:00:00Z",
  "data": {
    "domains": [],
    "tasks": [],
    "ideas": [],
    "ideaFolders": [],
    "events": [],
    "settings": {}
  }
}
```

---

## Performance Considerations

### Indexing Strategy

Recommended indexes for Supabase:
- `domains(user_id, name)`
- `tasks(user_id, domain_id, state)`
- `tasks(user_id, deadline)` for calendar queries
- `subtasks(task_id, state)`
- `ideas(user_id, folder_id)`
- `calendar_events(user_id, date)`

### Caching Strategy

- Cache domains in memory (rarely change)
- Cache user settings in memory
- Use Supabase real-time for live updates
- Implement optimistic updates for UI responsiveness

### Data Limits

Recommended limits:
- Max domains per user: 50
- Max tasks per domain: 1000
- Max subtasks per task: 50
- Max ideas per user: 5000
- Max note contents per idea: 20

---

## Security Considerations

### Data Privacy

1. **Row Level Security (RLS):**
   - All tables must have RLS enabled
   - Users can only access their own data
   - Implement policies for CRUD operations

2. **Input Sanitization:**
   - Sanitize all user input to prevent XSS
   - Validate URLs before storing
   - Escape HTML in descriptions and notes

3. **Authentication:**
   - Require authentication for all data operations
   - Implement session timeout
   - Use secure password policies

### Best Practices

- Never store sensitive data in tasks/ideas
- Use environment variables for API keys
- Implement CSRF protection for forms
- Regular security audits
- Keep dependencies updated

---

## Troubleshooting

### Common Issues

1. **Data not persisting (LocalStorage):**
   - Check browser storage quota
   - Verify localStorage is enabled
   - Check for JSON serialization errors

2. **Supabase connection issues:**
   - Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   - Check network connectivity
   - Verify RLS policies allow access

3. **Data synchronization conflicts:**
   - Implement conflict resolution strategy
   - Use timestamps for last-write-wins
   - Consider operational transformation for real-time

### Data Recovery

- LocalStorage: Export data regularly via Settings
- Supabase: Automatic backups (check Supabase dashboard)
- Keep local copies of critical data

---

## Support and Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Project Repository](https://github.com/ak-1344/OmniDesk)
