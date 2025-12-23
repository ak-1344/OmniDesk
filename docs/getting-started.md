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
2. Click "Add Subtask"
3. Break down your task into smaller steps
4. Track progress on each subtask
5. Schedule time blocks for subtasks

## Features

### Dashboard
- Overview of all your tasks by state
- Quick stats (total tasks, completed, in progress)
- Filter by domain
- Recent activity

### Task Management
- Create tasks with rich descriptions
- Assign to domains
- Set deadlines
- Track state progression
- Add subtasks with individual tracking
- Attach proof/notes

### Ideas
- Quick capture interface
- Tag-based organization
- Convert to tasks with one click
- Search and filter

### Calendar
- Unified view of deadlines and events
- Task-linked events
- Subtask scheduling
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
