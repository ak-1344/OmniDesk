# MongoDB Database Schema Documentation

## Overview

OmniDesk uses MongoDB's flexible document model with embedded subdocuments for optimal performance and data relationships.

## Collections

### 1. domains

Organizational categories for tasks.

**Schema**:
```javascript
{
  _id: ObjectId,              // Auto-generated MongoDB ID
  user_id: String,            // User identifier (indexed)
  name: String,               // Domain name
  color: String,              // Hex color code (#RRGGBB)
  description: String | null, // Optional description
  created_at: Date,           // Creation timestamp
  updated_at: Date            // Last update timestamp
}
```

**Indexes**:
- `{ user_id: 1, name: 1 }` - User domains lookup and sorting

**Example**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "user_id": "default-user",
  "name": "Work",
  "color": "#667eea",
  "description": "Work-related tasks",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 2. tasks

Main task management with embedded subtasks.

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // User identifier (indexed)
  domain_id: String,         // Reference to domain
  title: String,             // Task title
  description: String,       // Task description
  state: String,             // 'gotta-start', 'in-progress', 'nearly-done', 'paused', 'completed'
  deadline: String | null,   // ISO date string
  notes: String | null,      // Additional notes
  proof: [String] | null,    // Array of proof URLs/paths
  subtasks: [                // Embedded subtasks array
    {
      _id: String,          // Unique subtask ID
      title: String,
      description: String | null,
      state: String,        // 'todo', 'in-progress', 'completed'
      deadline: String | null,
      scheduled_time: {
        date: String,
        start_time: String,
        duration: Number    // Minutes
      } | null,
      proof: String | null,
      completed_at: String | null
    }
  ],
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null    // For soft delete (trash)
}
```

**Indexes**:
- `{ user_id: 1, domain_id: 1 }` - User tasks by domain
- `{ user_id: 1, state: 1 }` - User tasks by state
- `{ user_id: 1, deleted_at: 1 }` - Trash items lookup
- `{ deadline: 1 }` - Upcoming deadlines
- `{ "subtasks._id": 1 }` - Quick subtask lookup

**Example**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user_id": "default-user",
  "domain_id": "507f1f77bcf86cd799439011",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for all modules",
  "state": "in-progress",
  "deadline": "2024-01-20",
  "notes": "Focus on API documentation first",
  "proof": null,
  "subtasks": [
    {
      "_id": "sub1",
      "title": "API docs",
      "description": "Document all REST endpoints",
      "state": "completed",
      "deadline": null,
      "scheduled_time": {
        "date": "2024-01-16",
        "start_time": "14:00",
        "duration": 120
      },
      "proof": null,
      "completed_at": "2024-01-16T16:30:00Z"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-16T16:30:00Z",
  "deleted_at": null
}
```

---

### 3. ideas

Notion-style idea capture with rich content.

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // User identifier (indexed)
  folder_id: String | null,  // Reference to idea_folders
  title: String | null,      // Optional title
  color: String | null,      // Hex color code
  tags: [String],           // Array of tag strings
  position: {                // For canvas positioning
    x: Number,
    y: Number
  } | null,
  notes: [                   // Embedded note content array
    {
      _id: String,          // Unique note ID
      type: String,         // 'text', 'image', 'whiteboard'
      content: String,      // Text content, URL, or JSON data
      created_at: Date,
      order: Number         // Display order
    }
  ],
  created_at: Date,
  updated_at: Date,
  deleted_at: Date | null    // For soft delete
}
```

**Indexes**:
- `{ user_id: 1, folder_id: 1 }` - User ideas by folder
- `{ user_id: 1, deleted_at: 1 }` - Trash items lookup
- `{ tags: 1 }` - Tag-based search

**Example**:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "user_id": "default-user",
  "folder_id": "folder1",
  "title": "App Feature Ideas",
  "color": "#10b981",
  "tags": ["features", "v2.0"],
  "position": { "x": 100, "y": 200 },
  "notes": [
    {
      "_id": "note1",
      "type": "text",
      "content": "Add dark mode toggle",
      "created_at": "2024-01-15T10:30:00Z",
      "order": 0
    },
    {
      "_id": "note2",
      "type": "image",
      "content": "https://example.com/mockup.png",
      "created_at": "2024-01-15T10:35:00Z",
      "order": 1
    }
  ],
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z",
  "deleted_at": null
}
```

---

### 4. idea_folders

Folders for organizing ideas.

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // User identifier (indexed)
  name: String,              // Folder name
  color: String | null,      // Hex color code
  created_at: Date
}
```

**Indexes**:
- `{ user_id: 1, name: 1 }` - User folders lookup and sorting

**Example**:
```json
{
  "_id": "folder1",
  "user_id": "default-user",
  "name": "Project Ideas",
  "color": "#f59e0b",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 5. calendar_events

Calendar events with optional task/subtask links.

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,              // User identifier (indexed)
  title: String,                // Event title
  description: String | null,   // Event description
  date: String,                 // ISO date string
  start_time: String | null,    // HH:MM format
  end_time: String | null,      // HH:MM format
  type: String,                 // 'task-deadline', 'subtask-scheduled', 'personal-event'
  related_task_id: String | null,    // Reference to task
  related_subtask_id: String | null, // Reference to subtask
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `{ user_id: 1, date: 1 }` - User events by date

**Example**:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "user_id": "default-user",
  "title": "Team Meeting",
  "description": "Weekly standup",
  "date": "2024-01-18",
  "start_time": "10:00",
  "end_time": "10:30",
  "type": "personal-event",
  "related_task_id": null,
  "related_subtask_id": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 6. user_settings

User preferences and configuration.

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,                    // User identifier (unique index)
  theme: String,                      // 'light', 'dark'
  default_view: String,               // 'dashboard', 'tasks', 'ideas', 'calendar'
  date_format: String,                // 'YYYY-MM-DD', 'DD/MM/YYYY', etc.
  week_starts_on: String,             // 'monday', 'sunday'
  notifications_email: Boolean,
  notifications_desktop: Boolean,
  notifications_task_reminders: Boolean,
  trash_retention_days: Number,       // Days to keep trash items
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
- `{ user_id: 1 }` - Unique index for one settings doc per user

**Example**:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "user_id": "default-user",
  "theme": "dark",
  "default_view": "dashboard",
  "date_format": "YYYY-MM-DD",
  "week_starts_on": "monday",
  "notifications_email": true,
  "notifications_desktop": true,
  "notifications_task_reminders": true,
  "trash_retention_days": 30,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## Design Decisions

### Embedded vs Referenced Documents

**Embedded Documents (Used):**
- **Subtasks in Tasks**: Always loaded together, 1:N relationship
- **Notes in Ideas**: Tightly coupled content
- **Benefits**: Single query, atomic updates, better performance

**Referenced Documents (Used):**
- **Domain ↔ Tasks**: Many tasks per domain, separate lifecycle
- **Folder ↔ Ideas**: Ideas can move between folders
- **Benefits**: Avoid duplication, independent updates

### Soft Deletes

Tasks and ideas use `deleted_at` field instead of physical deletion:
- **Benefits**: Trash/restore functionality, audit trail
- **Query**: Always filter by `deleted_at: { $exists: false }`
- **Cleanup**: Periodic job to permanently delete old trash

### User Data Isolation

All collections include `user_id` field:
- **Purpose**: Multi-user support, data isolation
- **Security**: Row-level security in application layer
- **Indexes**: All queries scoped to user_id first

## Query Patterns

### Common Queries

```javascript
// Get all active tasks for a user in a specific domain
db.tasks.find({
  user_id: "user123",
  domain_id: "domain456",
  deleted_at: { $exists: false }
}).sort({ created_at: -1 })

// Get all ideas with specific tag
db.ideas.find({
  user_id: "user123",
  tags: "important",
  deleted_at: { $exists: false }
})

// Get upcoming events for a user
db.calendar_events.find({
  user_id: "user123",
  date: { $gte: "2024-01-15" }
}).sort({ date: 1 })

// Get trash items (soft-deleted tasks and ideas)
db.tasks.find({
  user_id: "user123",
  deleted_at: { $exists: true }
})
```

### Performance Tips

1. **Always use user_id in queries** - Indexed first
2. **Use projection** - Only fetch needed fields
3. **Limit results** - Use `.limit()` for large datasets
4. **Index compound queries** - Already done for common patterns

## Migration Notes

### From LocalStorage

When migrating from LocalStorage to MongoDB:

1. Export LocalStorage data
2. Transform structure:
   - Add `user_id` to all documents
   - Convert `id` to `_id`
   - Convert date strings to Date objects
   - Nest subtasks array in tasks
3. Import using MongoDB insertMany()

### Schema Evolution

MongoDB is schema-less, but maintain consistency:

1. **Adding fields**: Just start using them
2. **Removing fields**: Use `$unset` operator
3. **Renaming fields**: Use `$rename` operator
4. **Default values**: Handle in application layer

## Backup and Restore

### Backup

```bash
# Full database backup
mongodump --db=omnidesk --out=./backup

# Specific collection
mongodump --db=omnidesk --collection=tasks --out=./backup
```

### Restore

```bash
# Full database restore
mongorestore --db=omnidesk ./backup/omnidesk

# Specific collection
mongorestore --db=omnidesk --collection=tasks ./backup/omnidesk/tasks.bson
```

## Future Enhancements

- [ ] Add full-text search indexes for tasks/ideas
- [ ] Implement change streams for real-time updates
- [ ] Add geospatial indexes for location-based features
- [ ] Create materialized views for analytics
- [ ] Implement sharding strategy for scale

## References

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)
- [Indexing Strategies](https://docs.mongodb.com/manual/applications/indexes/)
