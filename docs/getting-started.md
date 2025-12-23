# Getting Started with OmniDesk

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/ak-1344/OmniDesk.git
cd OmniDesk
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Basic Usage

### Creating Your First Task

1. Navigate to the **Tasks** page from the sidebar
2. Click the "+" or "Create Task" button
3. Fill in the task details:
   - Title (required)
   - Description
   - Domain (College, Personal, Work, etc.)
   - State (gotta-start, in-progress, nearly-done, completed)
   - Optional deadline
4. Click "Create Task"

### Managing Domains

Domains are categories for organizing your tasks (e.g., College, Work, Personal).

1. Go to **Settings**
2. Navigate to the "Domains" section
3. Add, edit, or delete domains
4. Assign custom colors to each domain

### Capturing Ideas

1. Click on **Ideas** in the sidebar
2. Click "New Idea"
3. Type your idea
4. Optionally add tags
5. Convert ideas to tasks when ready to act on them

### Using the Calendar

1. Navigate to **Calendar**
2. View tasks with deadlines
3. See scheduled subtasks
4. Add personal events

### Working with Subtasks

1. Open a task detail page
2. Click "Add Subtask" in any column
3. Fill in:
   - Title (required)
   - Description (optional)
   - Deadline (optional)
4. Break down your task into smaller steps
5. Drag subtasks between columns to track progress
6. Each subtask shows its description and deadline

### Drag-and-Drop Task Deletion

1. From Dashboard or Tasks page
2. Drag any task card
3. Drop it on the floating trash can in the bottom-right corner
4. Task is immediately moved to trash
5. Restore from Trash page if needed

## Features

### Dashboard
- Kanban-style overview of all your tasks by state
- Drag-and-drop task state updates
- Quick stats and progress tracking
- Filter by domain
- Custom state management
- Draggable task cards for deletion

### Task Management
- Create tasks with rich descriptions
- Assign to domains
- Set deadlines
- Track state progression
- Add subtasks with:
  - Individual descriptions
  - Separate deadlines
  - State tracking
  - Drag-and-drop organization
- Kanban-style subtask boards
- Custom workflow columns
- Drag tasks to floating trash for quick deletion

### Ideas
- Notion-inspired minimal interface
- Quick capture with Ctrl+Enter
- No forced structure or categories
- Hover-only action buttons
- Convert to tasks with one click
- Timestamp tracking

### Calendar
- Current month display (December 2025)
- Month/year navigation
- Today highlighting
- Task deadlines visualization
- Subtask scheduling
- Personal event management
- Time blocking

### Trash
- Soft delete functionality
- Restore deleted items
- Auto-cleanup after retention period
- Permanent delete option

### Settings
- Theme customization (coming soon)
- Domain management
- Notification preferences
- Data export/import (coming soon)

## Tips & Tricks

1. **Use keyboard shortcuts**: Navigate faster with shortcuts (coming soon)
2. **Batch operations**: Select multiple tasks for bulk actions (coming soon)
3. **Smart filters**: Combine domain and state filters for focused views
4. **Color coding**: Use domain colors to visually organize your workspace
5. **Subtask scheduling**: Schedule subtasks to time-block your day

## Troubleshooting

### Data not persisting
- Check browser localStorage is enabled
- Clear cache if data seems corrupted
- Export data regularly as backup (feature coming soon)

### Performance issues
- Clear old trash items
- Archive completed tasks (feature coming soon)
- Check browser console for errors

### Build errors
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

## Next Steps

- [Learn about the architecture](./architecture.md)
- [Explore component documentation](./components.md)
- [Review API reference](./api-reference.md)
- [Contribute to the project](../CONTRIBUTING.md)
