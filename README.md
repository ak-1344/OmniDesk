# OmniDesk

OmniDesk is a lightweight productivity cockpit built with React, TypeScript, and Vite. It keeps your domains, tasks, ideas, calendar events, and trash management in one place, persisting state locally so you can pick up where you left off.

## Features
- Dashboard navigation with sidebar access to tasks, calendar, ideas, trash, and settings
- Task and subtask management with states, deadlines, descriptions, and domain tagging
- Notion-inspired idea capture with quick conversion to tasks
- Calendar integration showing current month with event management
- Drag-and-drop task deletion with floating trash can
- Dynamic sidebar with lock/unlock for optimal screen space
- Local persistence via browser storage with trash and restore flows

## Tech Stack
- React 19 + TypeScript
- Vite for dev server and builds
- React Router for routing
- LocalStorage for persistence (no backend required)

## Getting Started
### Prerequisites
- Node.js 18+ and npm

### Install
```bash
npm install
```

### Run locally
```bash
npm run dev
```
The app starts on http://localhost:5173 by default.

### Lint
```bash
npm run lint
```

### Build for production
```bash
npm run build
```
Outputs production assets to dist/.

### Preview production build
```bash
npm run preview
```

## Project Structure
- src/App.tsx sets up routing and layout with dynamic sidebar adjustment
- src/context/AppContext.tsx holds app state, persistence, and domain/task/idea/calendar/trash operations
- src/pages/ contains routed screens (Dashboard, Tasks, TaskDetail, Ideas, AllTasks, Calendar, Terminal, Trash, Settings)
- src/components/ contains shared UI like Sidebar, FloatingTrash, and modals
- src/types/ centralizes domain types with enhanced subtask properties

## Deployment
- Build with npm run build; deploy the dist/ directory to any static host (Vercel, Netlify, S3 + CDN, GitHub Pages).
- GitHub Actions workflow .github/workflows/ci.yml runs lint and build to validate changes before deployment.

## Contributing
See CONTRIBUTING.md for how to propose changes, run checks, and submit pull requests.

## License
Distributed under the MIT License. See LICENSE for details.
