# OmniDesk API Reference

Complete API documentation for the OmniDesk backend.

## Base URL

```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication

**Current**: No authentication (single default user)
**Future**: JWT-based authentication with Bearer tokens

For authenticated endpoints (future):
```
Authorization: Bearer <jwt_token>
```

## Common Response Formats

### Success Response

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Example Task",
  ...
}
```

### Error Response

```json
{
  "error": {
    "message": "Error description",
    "stack": "..." // Development only
  }
}
```

### Validation Error Response

```json
{
  "errors": [
    {
      "msg": "Title is required",
      "param": "title",
      "location": "body"
    }
  ]
}
```

## API Endpoints

### Health Check

#### GET /health

Check API server health.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T10:30:00.000Z"
}
```

---

## Domains

Domains represent life areas (e.g., College, Startup, Health, Personal).

### GET /api/domains

Get all domains for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "College",
    "color": "#3b82f6",
    "description": "Academic work and studies"
  }
]
```

### POST /api/domains

Create a new domain.

**Request Body**
```json
{
  "name": "Work",
  "color": "#f97316",
  "description": "Professional projects",
  "user_id": "default-user"
}
```

**Response**: Created domain object (201 Created)

### PUT /api/domains/:id

Update a domain.

**Request Body**
```json
{
  "name": "Updated Name",
  "color": "#22c55e"
}
```

**Response**: Updated domain object

### DELETE /api/domains/:id

Delete a domain.

**Response**: 204 No Content

---

## Tasks

### GET /api/tasks

Get all tasks for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Complete project proposal",
    "description": "Write and submit the Q1 proposal",
    "domainId": "507f1f77bcf86cd799439012",
    "state": "in-progress",
    "deadline": "2026-01-15T00:00:00.000Z",
    "notes": "Focus on budget section",
    "proof": ["url1", "url2"],
    "ideaId": "507f1f77bcf86cd799439013",
    "subtasks": [
      {
        "id": "subtask1",
        "title": "Research competitors",
        "description": "Analyze top 3 competitors",
        "state": "completed",
        "deadline": null,
        "scheduledTime": {
          "date": "2026-01-10T00:00:00.000Z",
          "startTime": "14:00",
          "duration": 60
        },
        "proof": null,
        "completedAt": "2026-01-09T15:30:00.000Z"
      }
    ],
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-04T12:00:00.000Z"
  }
]
```

### GET /api/tasks/:id

Get a single task by ID.

**Response**: Task object or 404 Not Found

### POST /api/tasks

Create a new task.

**Request Body**
```json
{
  "title": "New task",
  "description": "Task description",
  "domainId": "507f1f77bcf86cd799439012",
  "state": "gotta-start",
  "deadline": "2026-01-20T00:00:00.000Z",
  "notes": "Optional notes",
  "proof": [],
  "ideaId": "507f1f77bcf86cd799439013",
  "user_id": "default-user"
}
```

**Validation**
- `title`: Required, non-empty string
- `domainId`: Required
- `state`: Must be one of: 'gotta-start', 'in-progress', 'nearly-done', 'paused', 'completed'
- `user_id`: Required

**Response**: Created task object (201 Created)

### PUT /api/tasks/:id

Update a task.

**Request Body** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "state": "completed",
  "deadline": "2026-01-25T00:00:00.000Z",
  "notes": "Updated notes",
  "proof": ["new-url"]
}
```

**Response**: Updated task object

### DELETE /api/tasks/:id

Soft delete a task (moves to trash).

**Response**: 204 No Content

---

## Subtasks

### POST /api/subtasks

Add a subtask to a task.

**Request Body**
```json
{
  "taskId": "507f1f77bcf86cd799439011",
  "title": "Subtask title",
  "description": "Subtask description",
  "state": "todo",
  "deadline": "2026-01-18T00:00:00.000Z",
  "scheduledTime": {
    "date": "2026-01-15T00:00:00.000Z",
    "startTime": "10:00",
    "duration": 120
  }
}
```

**Validation**
- `taskId`: Required
- `title`: Required
- `state`: Must be one of: 'todo', 'in-progress', 'completed'

**Response**: Updated task object with new subtask (201 Created)

### PUT /api/subtasks/:taskId/:subtaskId

Update a subtask.

**Request Body**
```json
{
  "title": "Updated subtask",
  "state": "completed",
  "proof": "completion-screenshot.png"
}
```

**Response**: Updated task object

### DELETE /api/subtasks/:taskId/:subtaskId

Delete a subtask.

**Response**: Updated task object (200 OK)

---

## Ideas

### GET /api/ideas

Get all ideas for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Product Vision Q2",
    "color": "#fbbf24",
    "folderId": "507f1f77bcf86cd799439012",
    "tags": ["strategy", "planning"],
    "position": { "x": 120, "y": 80 },
    "canvasEnabled": true,
    "canvasData": { /* TLDraw snapshot */ },
    "convertedToTasks": ["taskId1", "taskId2"],
    "notes": [
      {
        "id": "note1",
        "type": "text",
        "content": "Initial thoughts about the vision",
        "createdAt": "2026-01-01T10:00:00.000Z",
        "order": 0
      }
    ],
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-04T12:00:00.000Z"
  }
]
```

### GET /api/ideas/:id

Get a single idea by ID.

**Response**: Idea object or 404 Not Found

### POST /api/ideas

Create a new idea.

**Request Body**
```json
{
  "title": "New Idea",
  "color": "#a855f7",
  "folderId": "507f1f77bcf86cd799439012",
  "tags": ["brainstorm"],
  "position": { "x": 200, "y": 150 },
  "canvasEnabled": false,
  "notes": [
    {
      "type": "text",
      "content": "Initial note content",
      "order": 0
    }
  ],
  "user_id": "default-user"
}
```

**Response**: Created idea object (201 Created)

### PUT /api/ideas/:id

Update an idea.

**Request Body** (all fields optional)
```json
{
  "title": "Updated Idea",
  "color": "#ec4899",
  "folderId": "newFolderId",
  "tags": ["updated", "tags"],
  "position": { "x": 300, "y": 200 },
  "canvasEnabled": true,
  "canvasData": { /* TLDraw snapshot */ },
  "convertedToTasks": ["taskId1", "taskId2", "taskId3"],
  "notes": [
    {
      "id": "note1",
      "type": "text",
      "content": "Updated content"
    }
  ]
}
```

**Response**: Updated idea object

### DELETE /api/ideas/:id

Soft delete an idea (moves to trash).

**Response**: 204 No Content

---

## Idea Folders

### GET /api/idea-folders

Get all idea folders for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Work Projects",
    "color": "#3b82f6",
    "createdAt": "2026-01-01T10:00:00.000Z"
  }
]
```

### POST /api/idea-folders

Create a new folder.

**Request Body**
```json
{
  "name": "Personal",
  "color": "#22c55e",
  "user_id": "default-user"
}
```

**Response**: Created folder object (201 Created)

### PUT /api/idea-folders/:id

Update a folder.

**Request Body**
```json
{
  "name": "Updated Folder",
  "color": "#f97316"
}
```

**Response**: Updated folder object

### DELETE /api/idea-folders/:id

Delete a folder (ideas are NOT deleted, only unassigned).

**Response**: 204 No Content

---

## Calendar Events

### GET /api/calendar-events

Get all calendar events for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')
- `start_date` (optional): ISO date string for filtering
- `end_date` (optional): ISO date string for filtering

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "date": "2026-01-10T00:00:00.000Z",
    "startTime": "14:00",
    "endTime": "15:00",
    "duration": 60,
    "type": "meeting",
    "relatedTaskId": null,
    "relatedSubtaskId": null
  }
]
```

### POST /api/calendar-events

Create a calendar event.

**Request Body**
```json
{
  "title": "Project Deadline",
  "description": "Final submission",
  "date": "2026-01-20T00:00:00.000Z",
  "startTime": "23:59",
  "duration": 0,
  "type": "task-deadline",
  "relatedTaskId": "507f1f77bcf86cd799439012",
  "user_id": "default-user"
}
```

**Event Types**
- `task-deadline`: Task due date
- `subtask-scheduled`: Scheduled subtask
- `personal-event`: Personal calendar entry
- `meeting`: Meeting or appointment
- `event`: Generic event
- `task`: Task time block
- `blocked`: Blocked time
- `available`: Available time

**Response**: Created event object (201 Created)

### PUT /api/calendar-events/:id

Update an event.

**Request Body**
```json
{
  "title": "Updated Meeting",
  "startTime": "15:00",
  "duration": 90
}
```

**Response**: Updated event object

### DELETE /api/calendar-events/:id

Delete an event.

**Response**: 204 No Content

---

## Settings

### GET /api/settings

Get user settings.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "default-user",
  "theme": "dark",
  "defaultView": "dashboard",
  "dateFormat": "YYYY-MM-DD",
  "weekStartsOn": "monday",
  "notifications": {
    "email": true,
    "desktop": true,
    "taskReminders": true
  },
  "trashRetentionDays": 30,
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "kanbanColumns": [
    {
      "id": "gotta-start",
      "label": "Exploring",
      "color": "#3b82f6",
      "order": 0
    }
  ],
  "subtaskKanbanColumns": [],
  "domainOrder": ["domainId1", "domainId2"]
}
```

### PUT /api/settings

Update user settings.

**Request Body** (all fields optional)
```json
{
  "theme": "light",
  "defaultView": "tasks",
  "notifications": {
    "email": false,
    "desktop": true,
    "taskReminders": true
  },
  "user": {
    "name": "Jane Doe"
  },
  "kanbanColumns": [
    {
      "id": "custom-state",
      "label": "Custom Label",
      "color": "#10b981",
      "order": 0
    }
  ]
}
```

**Response**: Updated settings object

---

## Trash

### GET /api/trash

Get all trash items for a user.

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "type": "task",
    "item": { /* Full task object */ },
    "deletedAt": "2026-01-03T10:00:00.000Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "type": "idea",
    "item": { /* Full idea object */ },
    "deletedAt": "2026-01-02T15:30:00.000Z"
  }
]
```

**Item Types**: `task`, `idea`, `subtask`

### POST /api/trash/restore/:type/:id

Restore an item from trash.

**Parameters**
- `type`: 'task' or 'idea'
- `id`: Item ID

**Response**: Restored item object (200 OK)

### DELETE /api/trash/:type/:id

Permanently delete an item from trash.

**Parameters**
- `type`: 'task' or 'idea'
- `id`: Item ID

**Response**: 204 No Content

### DELETE /api/trash/empty

Empty the entire trash (permanent deletion).

**Query Parameters**
- `user_id` (optional): User ID (default: 'default-user')

**Response**: 204 No Content

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Created |
| 204  | No Content (successful deletion) |
| 400  | Bad Request (validation error) |
| 404  | Not Found |
| 500  | Internal Server Error |

## Rate Limiting

**Current**: No rate limiting
**Future**: 100 requests per minute per user

## Pagination

**Current**: No pagination (returns all items)
**Future**: Query parameters `?page=1&limit=50`

## Filtering and Sorting

**Current**: Limited filtering by user_id
**Future**: 
- Filter by domain, state, tags
- Sort by created_at, updated_at, deadline
- Full-text search

## Webhooks

**Current**: Not implemented
**Future**: Webhook support for external integrations

## WebSocket Support

**Current**: Not implemented
**Future**: Real-time updates via WebSocket for collaborative features

## Batch Operations

**Current**: Not implemented
**Future**: Batch create/update/delete endpoints

## Example API Calls

### Create Task from Idea

```bash
# 1. Create the task
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement feature",
    "domainId": "507f1f77bcf86cd799439012",
    "state": "gotta-start",
    "ideaId": "507f1f77bcf86cd799439013",
    "user_id": "default-user"
  }'

# 2. Update the idea to track conversion
curl -X PUT http://localhost:3001/api/ideas/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -d '{
    "convertedToTasks": ["newTaskId"]
  }'
```

### Schedule Subtask

```bash
curl -X POST http://localhost:3001/api/subtasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "507f1f77bcf86cd799439011",
    "title": "Review code",
    "state": "todo",
    "scheduledTime": {
      "date": "2026-01-15T00:00:00.000Z",
      "startTime": "14:00",
      "duration": 60
    }
  }'
```

### Update User Settings

```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "default-user",
    "theme": "dark",
    "kanbanColumns": [
      {"id": "backlog", "label": "Backlog", "color": "#6b7280", "order": 0},
      {"id": "active", "label": "Active", "color": "#3b82f6", "order": 1},
      {"id": "done", "label": "Done", "color": "#22c55e", "order": 2}
    ]
  }'
```
