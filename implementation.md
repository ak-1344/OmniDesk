# OmniDesk MVP Implementation Roadmap

> **Goal**: Build a functional MVP of OmniDesk that brings the vision to life with full MongoDB integration

---

## Current Project Status Assessment

### ✅ What's Already Implemented

#### Frontend Structure (React + TypeScript)
- ✅ Basic routing and navigation (React Router)
- ✅ All page components created (Dashboard, Tasks, Ideas, Calendar, Terminal, Trash, Settings)
- ✅ Sidebar navigation with dock-style interface
- ✅ AppContext for state management
- ✅ Storage abstraction layer (LocalStorage + MongoDB adapters)
- ✅ Basic type definitions for core entities

#### Backend API (Express + MongoDB)
- ✅ Express server setup with TypeScript
- ✅ MongoDB connection configuration
- ✅ CORS, Helmet, Morgan middleware
- ✅ API routes for all collections (domains, tasks, ideas, calendar events, etc.)
- ✅ MongoDB adapter on frontend to consume backend API

#### Data Model
- ✅ Basic types defined (Task, Idea, Domain, CalendarEvent, etc.)
- ✅ MongoDB schema documented in `database-structure-NOSQL.md`

### ❌ What's Missing (Critical for MVP)

#### 1. **Infinite Canvas for Ideas** ⭐ HIGH PRIORITY
- Current: Simple text/image notes with basic structure
- Needed: Full infinite whiteboard with:
  - Draggable note cards
  - Flowchart/diagram support
  - Visual connections between elements
  - Zoom and pan controls
  - Spatial positioning

#### 2. **Task-Idea Lineage Tracking**
- Current: No connection between ideas and derived tasks
- Needed: Right sidebar showing tasks born from each idea

#### 3. **Customizable Task States & Dashboard**
- Current: Hard-coded task states
- Needed: User-defined workflow states and dashboard sections

#### 4. **Task Execution Space (Kanban)**
- Current: Basic task detail page
- Needed: Full Kanban board for subtasks within each task

#### 5. **Calendar Integration**
- Current: Basic calendar page
- Needed: Full integration with task deadlines and scheduled subtasks

#### 6. **Terminal Bulk Input**
- Current: Placeholder page
- Needed: Structured input parser for bulk task creation

#### 7. **MongoDB Integration Completion**
- Current: Backend API exists but needs testing and frontend integration
- Needed: Full CRUD operations working end-to-end

#### 8. **User Authentication**
- Current: No authentication (using default user)
- Needed: Basic auth system to enable multi-user support

---

## MVP Implementation Plan

### Phase 1: Core Infrastructure & MongoDB Integration (Week 1-2)

#### 1.1 Complete MongoDB Backend API

**Goal**: Ensure all backend routes are fully functional and tested.

**Tasks**:
- [ ] **Test all existing API routes** with Postman/Thunder Client
  - GET, POST, PUT, DELETE for: domains, tasks, subtasks, ideas, events, settings, trash
  - Verify error handling and validation
  
- [ ] **Implement missing backend routes**:
  - `/api/task-states` - Custom task states CRUD
  - `/api/idea-elements` - Canvas elements CRUD
  - `/api/users` - User profile management
  
- [ ] **Add MongoDB Schema Validation**:
  - Implement schema validators for each collection
  - Add proper indexes as defined in `database-structure-NOSQL.md`
  - Test data integrity constraints
  
- [ ] **Create seed data script**:
  - Script to populate default domains and task states
  - Sample data for testing
  
- [ ] **Environment setup documentation**:
  - `.env.example` file with all required variables
  - MongoDB connection string setup guide
  - Local development setup instructions

**Files to Create/Modify**:
```
backend/
  src/
    routes/
      taskStates.ts          (NEW)
      ideaElements.ts        (NEW)
      users.ts               (NEW)
    middleware/
      validation.ts          (NEW)
      errorHandler.ts        (MODIFY)
    utils/
      seedData.ts            (NEW)
    config/
      schemas.ts             (NEW - MongoDB validators)
```

**Acceptance Criteria**:
- All API endpoints return proper JSON responses
- MongoDB connection is stable and handles errors gracefully
- Seed data script successfully populates test database
- API documentation updated with all endpoints

---

#### 1.2 Complete Frontend-Backend Integration

**Goal**: Replace all localStorage usage with MongoDB API calls.

**Tasks**:
- [ ] **Update MongoDBAdapter** (`src/lib/storage.mongodb.ts`):
  - Implement all missing methods
  - Add proper error handling and user feedback
  - Add loading states for async operations
  
- [ ] **Update AppContext** to use MongoDB by default:
  - Change storage factory to prefer MongoDB when API is available
  - Add connection status indicator
  - Implement reconnection logic
  
- [ ] **Test all CRUD operations** through UI:
  - Create, read, update, delete for all entities
  - Verify data persistence across page refreshes
  - Test error scenarios (network failure, validation errors)
  
- [ ] **Add API status indicator** to UI:
  - Show connection status in sidebar or header
  - Display appropriate messages when API is unavailable
  - Fallback to localStorage if MongoDB is down

**Files to Modify**:
```
src/
  lib/
    storage.mongodb.ts       (COMPLETE implementation)
    storage.factory.ts       (UPDATE to prefer MongoDB)
  context/
    AppContext.tsx           (ADD connection status)
  components/
    ConnectionStatus.tsx     (NEW - API status indicator)
```

**Acceptance Criteria**:
- All data operations work through MongoDB API
- UI shows loading states during API calls
- Error messages are clear and actionable
- Data persists correctly in MongoDB

---

### Phase 2: Infinite Canvas for Ideas (Week 2-3) ⭐ FLAGSHIP FEATURE

#### 2.1 Choose and Integrate Canvas Library

**Recommended Libraries**:
1. **React Flow** - Excellent for node-based editors
2. **Excalidraw** - Whiteboard-style with drawing
3. **Fabric.js** - Full-featured canvas library
4. **TLDraw** - Modern infinite canvas

**Recommendation**: **TLDraw** or **React Flow**
- TLDraw: More whiteboard-like, modern, good for sketching
- React Flow: Better for structured flowcharts and connections

**Tasks**:
- [ ] **Install chosen library**:
  ```bash
  npm install @tldraw/tldraw
  # or
  npm install reactflow
  ```
  
- [ ] **Create canvas component**:
  - Infinite canvas container
  - Note card components (draggable, resizable)
  - Connection/arrow components
  - Toolbar for adding elements
  - Zoom/pan controls
  
- [ ] **Implement canvas state management**:
  - Store element positions in MongoDB
  - Save canvas viewport state (zoom, pan position)
  - Auto-save functionality (debounced)
  
- [ ] **Add element types**:
  - Text note cards (resizable, draggable)
  - Image uploads with positioning
  - Flowchart shapes (rectangles, circles, diamonds)
  - Connectors/arrows between elements
  - Sticky notes in different colors

**Files to Create**:
```
src/
  components/
    Canvas/
      InfiniteCanvas.tsx           (MAIN canvas container)
      InfiniteCanvas.css
      elements/
        NoteCard.tsx               (Draggable text note)
        NoteCard.css
        ImageElement.tsx           (Positioned image)
        FlowchartShape.tsx         (Shapes for diagrams)
        Connector.tsx              (Arrows/lines)
      toolbar/
        CanvasToolbar.tsx          (Add elements, tools)
        CanvasToolbar.css
      hooks/
        useCanvasState.ts          (Canvas state management)
        useAutoSave.ts             (Auto-save debouncer)
```

**Acceptance Criteria**:
- Users can create infinite canvas for each idea
- Elements can be added, moved, resized, deleted
- Canvas state persists to MongoDB
- Zoom and pan work smoothly
- Visual connections can be drawn between elements

---

#### 2.2 Integrate Canvas into Ideas

**Tasks**:
- [ ] **Replace current Ideas page** with canvas-based version:
  - Each idea opens in canvas view
  - Show thumbnail preview in Ideas list
  
- [ ] **Update Idea data model**:
  - Add canvas configuration (width, height, viewport)
  - Store elements in `ideaElements` collection
  
- [ ] **Implement canvas thumbnail generation**:
  - Generate preview image of canvas
  - Display in Ideas grid view
  
- [ ] **Add canvas templates**:
  - Blank canvas
  - Mindmap template
  - Flowchart template
  - Note-taking template

**Files to Modify**:
```
src/
  pages/
    Ideas.tsx                 (MODIFY to show canvas previews)
    IdeaDetail.tsx            (REPLACE with canvas view)
    IdeaCreate.tsx            (ADD canvas initialization)
  types/
    index.ts                  (UPDATE Idea type with canvas fields)
```

**Acceptance Criteria**:
- Each idea has its own infinite canvas
- Canvas elements persist correctly
- Thumbnails show preview of canvas content
- Users can switch between ideas seamlessly

---

### Phase 3: Task-Idea Lineage & Conversion (Week 3-4)

#### 3.1 Implement Idea-to-Task Conversion

**Tasks**:
- [ ] **Add "Convert to Task" button** in idea canvas view
  
- [ ] **Create conversion modal**:
  - Pre-fill task title from idea title
  - Option to include canvas snapshot as task description
  - Select domain
  - Select initial state
  
- [ ] **Update data models**:
  - Add `ideaId` field to Task (reference to originating idea)
  - Add `convertedToTasks[]` array to Idea
  
- [ ] **Implement bidirectional linking**:
  - When task is created from idea, update both records
  - When task is deleted, remove from idea's array

**Files to Create/Modify**:
```
src/
  components/
    ConvertIdeaModal.tsx      (MODIFY with canvas integration)
    ConvertIdeaModal.css
  context/
    AppContext.tsx            (UPDATE convertIdeaToTask method)
  types/
    index.ts                  (ADD ideaId to Task, convertedToTasks to Idea)
```

**Acceptance Criteria**:
- Users can convert any idea to a task
- Conversion preserves idea content
- Original idea remains intact
- Linkage is maintained in database

---

#### 3.2 Task Lineage Sidebar

**Tasks**:
- [ ] **Create task lineage sidebar** in idea view:
  - Shows all tasks derived from current idea
  - Click to navigate to task
  - Shows task status and progress
  
- [ ] **Add visual indicator** in task view:
  - Show "Originated from Idea" badge
  - Link back to original idea

**Files to Create**:
```
src/
  components/
    TaskLineageSidebar/
      TaskLineageSidebar.tsx    (Shows related tasks)
      TaskLineageSidebar.css
      TaskLineageItem.tsx       (Individual task card)
```

**Acceptance Criteria**:
- Ideas show all derived tasks in sidebar
- Tasks show link to originating idea
- Navigation between ideas and tasks is seamless

---

### Phase 4: Customizable Task States & Dashboard (Week 4-5)

#### 4.1 Implement Custom Task States

**Tasks**:
- [ ] **Create Task States management** in Settings:
  - CRUD interface for creating/editing states
  - Drag-to-reorder states
  - Color picker for each state
  - Mark state as "final" (completion state)
  
- [ ] **Update backend** to support custom states:
  - Ensure `taskStates` API is functional
  - Validate state transitions
  
- [ ] **Apply custom states** throughout app:
  - Dashboard sections reflect user's states
  - Task detail Kanban uses user's states
  - Filters use user's states

**Files to Create/Modify**:
```
src/
  pages/
    Settings.tsx              (ADD task states management)
  components/
    Settings/
      TaskStatesManager.tsx   (NEW - CRUD interface)
      TaskStatesManager.css
      StateItem.tsx           (NEW - Individual state editor)
  types/
    index.ts                  (ADD TaskStateDefinition type)
```

**Acceptance Criteria**:
- Users can create custom workflow states
- States can be reordered and customized
- Dashboard adapts to custom states
- Default states provided for new users

---

#### 4.2 Dynamic Dashboard Layout

**Tasks**:
- [ ] **Make Dashboard sections dynamic**:
  - Generate sections from user's task states
  - Show task count in each section
  - Allow hiding/showing sections
  
- [ ] **Add dashboard customization**:
  - Drag sections to reorder
  - Toggle section visibility
  - Choose compact vs. expanded card view
  
- [ ] **Implement smart filtering**:
  - Filter by domain
  - Filter by deadline (today, this week, overdue)
  - Filter by priority
  - Combine filters

**Files to Modify**:
```
src/
  pages/
    Dashboard.tsx             (MAKE dynamic based on states)
    Dashboard.css             (ADD layout customization)
  components/
    Dashboard/
      DashboardSection.tsx    (NEW - Dynamic state section)
      DashboardFilters.tsx    (NEW - Filter controls)
      TaskCard.tsx            (NEW - Reusable task card)
```

**Acceptance Criteria**:
- Dashboard shows sections for each task state
- Sections can be customized and reordered
- Filtering works correctly
- Performance is good with many tasks

---

### Phase 5: Task Execution & Kanban (Week 5-6)

#### 5.1 Task Detail Kanban Board

**Tasks**:
- [ ] **Implement Kanban board** for subtasks:
  - Columns for each subtask state
  - Drag-and-drop between columns
  - Add subtask inline
  - Edit subtask in modal
  
- [ ] **Use React DnD or react-beautiful-dnd**:
  ```bash
  npm install react-beautiful-dnd
  npm install --save-dev @types/react-beautiful-dnd
  ```
  
- [ ] **Calculate task progress** from subtasks:
  - Auto-update progress bar
  - Show completion percentage
  - Trigger completion when all subtasks done
  
- [ ] **Add subtask features**:
  - Deadline picker
  - Time estimation
  - Proof upload
  - Notes/description

**Files to Create/Modify**:
```
src/
  pages/
    TaskDetail.tsx            (REPLACE with Kanban view)
    TaskDetail.css            (UPDATE for Kanban layout)
  components/
    TaskDetail/
      SubtaskKanban.tsx       (NEW - Kanban board)
      SubtaskKanban.css
      KanbanColumn.tsx        (NEW - Single column)
      SubtaskCard.tsx         (NEW - Draggable card)
      SubtaskModal.tsx        (NEW - Edit subtask)
```

**Acceptance Criteria**:
- Subtasks can be dragged between states
- Task progress updates automatically
- Kanban is intuitive and performant
- Works well on mobile (touch-friendly)

---

#### 5.2 Task Completion & Reflection

**Tasks**:
- [ ] **Add completion flow**:
  - When task moves to final state, trigger completion
  - Prompt for reflection notes
  - Option to add proof/attachments
  - Set completedAt timestamp
  
- [ ] **Create reflection modal**:
  - What did you learn?
  - What went well?
  - What could be improved?
  - Attach final deliverables

**Files to Create**:
```
src/
  components/
    TaskCompletion/
      CompletionModal.tsx     (NEW - Reflection prompt)
      CompletionModal.css
      ProofUpload.tsx         (NEW - Upload component)
```

**Acceptance Criteria**:
- Completing task triggers reflection prompt
- Reflections are saved with task
- Proof can be uploaded and viewed later

---

### Phase 6: Calendar Integration (Week 6-7)

#### 6.1 Full Calendar Implementation

**Recommended Library**: **FullCalendar** or **React Big Calendar**

**Tasks**:
- [ ] **Install calendar library**:
  ```bash
  npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
  ```
  
- [ ] **Implement calendar views**:
  - Month view
  - Week view
  - Day view
  - Agenda list view
  
- [ ] **Show calendar events**:
  - Task deadlines (red)
  - Scheduled subtasks (blue)
  - Personal events (green)
  - Domain-colored events
  
- [ ] **Enable event creation**:
  - Click empty slot to create event
  - Drag to create time block
  - Double-click to edit

**Files to Modify**:
```
src/
  pages/
    Calendar.tsx              (IMPLEMENT full calendar)
    Calendar.css              (STYLE calendar)
  components/
    Calendar/
      CalendarView.tsx        (NEW - Main calendar)
      EventModal.tsx          (NEW - Create/edit event)
      EventDetails.tsx        (NEW - Event popup)
```

**Acceptance Criteria**:
- All task deadlines appear on calendar
- Scheduled subtasks show as time blocks
- Users can create personal events
- Drag-and-drop to reschedule works

---

#### 6.2 Task-Calendar Synchronization

**Tasks**:
- [ ] **Auto-create calendar events** for:
  - Task deadlines
  - Scheduled subtasks
  
- [ ] **Implement drag-to-schedule**:
  - Drag subtask from Kanban to calendar
  - Creates time block
  - Updates both subtask and calendar event
  
- [ ] **Add reminder system**:
  - Browser notifications
  - Email reminders (future)
  - Configurable timing (15 min, 1 hour, 1 day before)

**Files to Modify**:
```
src/
  context/
    AppContext.tsx            (ADD auto-event creation)
  components/
    ReminderSettings.tsx      (NEW - Configure reminders)
  utils/
    notifications.ts          (NEW - Browser notifications)
```

**Acceptance Criteria**:
- Task deadlines automatically appear in calendar
- Scheduling subtasks updates calendar
- Reminders work reliably
- No duplicate events created

---

### Phase 7: Terminal & Bulk Operations (Week 7)

#### 7.1 Structured Input Parser

**Tasks**:
- [ ] **Define input format** (YAML-like or custom):
  ```
  Task: Complete project proposal
  Domain: Startup
  State: In Progress
  Deadline: 2025-01-15
  Subtasks:
    - Research competitors
    - Draft outline
    - Write content
    - Review and edit
  
  Task: Prepare presentation
  Domain: College
  ...
  ```
  
- [ ] **Create parser**:
  - Parse structured text into tasks/subtasks
  - Validate domains and states exist
  - Handle dates and times
  - Show preview before creating
  
- [ ] **Implement Terminal UI**:
  - Monaco Editor for syntax highlighting (optional)
  - Simple textarea with monospace font
  - Parse button
  - Preview table
  - Confirm/cancel actions

**Files to Modify**:
```
src/
  pages/
    Terminal.tsx              (IMPLEMENT parser UI)
    Terminal.css              (STYLE terminal)
  utils/
    parser.ts                 (NEW - Input parser)
    validator.ts              (NEW - Validate parsed data)
  components/
    Terminal/
      InputEditor.tsx         (NEW - Text input area)
      PreviewTable.tsx        (NEW - Show parsed items)
```

**Acceptance Criteria**:
- Parser handles simple text format
- Validation catches errors before creation
- Preview shows exactly what will be created
- Bulk creation works correctly

---

### Phase 8: Polish & UX Improvements (Week 8)

#### 8.1 Loading States & Error Handling

**Tasks**:
- [ ] **Add loading skeletons** for:
  - Dashboard cards
  - Task list
  - Calendar events
  
- [ ] **Improve error messages**:
  - Network errors
  - Validation errors
  - Permission errors
  
- [ ] **Add empty states**:
  - No tasks yet
  - No ideas yet
  - No events scheduled
  
- [ ] **Implement optimistic updates**:
  - UI updates immediately
  - Rollback on error

**Files to Create**:
```
src/
  components/
    common/
      LoadingSkeleton.tsx     (NEW - Skeleton screens)
      EmptyState.tsx          (NEW - No data states)
      ErrorBoundary.tsx       (NEW - Error boundaries)
      Toast.tsx               (NEW - Toast notifications)
```

**Acceptance Criteria**:
- No blank screens during loading
- Errors are clear and actionable
- Empty states are helpful and inviting
- UI feels responsive (optimistic updates)

---

#### 8.2 Responsive Design & Mobile Optimization

**Tasks**:
- [ ] **Make sidebar responsive**:
  - Collapse to icons on mobile
  - Slide-out drawer on tablet
  
- [ ] **Optimize touch interactions**:
  - Larger touch targets
  - Swipe gestures where appropriate
  - Mobile-friendly drag-and-drop
  
- [ ] **Test on mobile devices**:
  - iPhone Safari
  - Android Chrome
  - Tablet sizes
  
- [ ] **Add PWA support** (optional):
  - Service worker
  - Offline support
  - Install prompt

**Files to Modify**:
```
src/
  components/
    Sidebar.tsx               (ADD responsive behavior)
    Sidebar.css               (ADD media queries)
  App.css                     (ADD mobile styles)
public/
  manifest.json               (NEW - PWA manifest)
```

**Acceptance Criteria**:
- App is fully usable on mobile
- Touch interactions work smoothly
- Layout adapts to all screen sizes
- Performance is good on slower devices

---

### Phase 9: User Authentication (Week 9) 🔐

#### 9.1 Basic Auth System

**Recommended Approach**: **JWT-based authentication**

**Tasks**:
- [ ] **Backend authentication**:
  - Create `/api/auth/register` endpoint
  - Create `/api/auth/login` endpoint
  - Implement JWT token generation
  - Add authentication middleware
  - Protect all API routes
  
- [ ] **Frontend auth state**:
  - Login page
  - Registration page
  - Store JWT in localStorage
  - Add token to all API requests
  - Logout functionality
  
- [ ] **User management**:
  - User profile page
  - Update profile
  - Change password
  - Delete account

**Files to Create**:
```
backend/
  src/
    routes/
      auth.ts                 (NEW - Auth endpoints)
    middleware/
      auth.ts                 (NEW - JWT verification)
    utils/
      jwt.ts                  (NEW - Token generation)
      password.ts             (NEW - Bcrypt hashing)

src/
  pages/
    Login.tsx                 (NEW - Login page)
    Login.css
    Register.tsx              (NEW - Registration page)
    Register.css
    Profile.tsx               (NEW - User profile)
  context/
    AuthContext.tsx           (NEW - Auth state)
  utils/
    api.ts                    (NEW - API client with auth)
```

**Acceptance Criteria**:
- Users can register and login
- JWT tokens are properly validated
- All API routes require authentication
- User data is isolated by userId
- Password reset flow works (basic version)

---

#### 9.2 Multi-User Support

**Tasks**:
- [ ] **Update all queries** to filter by userId:
  - Ensure data isolation
  - Test that users can't access others' data
  
- [ ] **Add user onboarding**:
  - Welcome screen
  - Create default domains
  - Sample tasks/ideas (optional)
  
- [ ] **Implement user settings**:
  - Personal preferences
  - Default domains
  - Default task states

**Acceptance Criteria**:
- Multiple users can use the system
- Data is properly isolated
- New users get helpful onboarding
- Settings persist per user

---

### Phase 10: Portfolio & Public Features (Week 10)

#### 10.1 Portfolio Page Implementation

**Tasks**:
- [ ] **Create portfolio settings**:
  - Toggle portfolio public/private
  - Select tasks to publish
  - Customize portfolio theme
  
- [ ] **Build public portfolio view**:
  - Public URL: `/portfolio/:username`
  - Show selected projects
  - Professional theme
  - Contact information
  
- [ ] **Implement project showcase**:
  - Task as project card
  - Show proof/deliverables
  - Custom descriptions
  - Live/repo links

**Files to Create**:
```
src/
  pages/
    Portfolio.tsx             (MODIFY - Settings view)
    PortfolioPublic.tsx       (NEW - Public view)
    PortfolioPublic.css
  components/
    Portfolio/
      ProjectCard.tsx         (NEW - Public project card)
      PortfolioSettings.tsx   (NEW - Configuration)
      ThemeSelector.tsx       (NEW - Theme picker)
```

**Acceptance Criteria**:
- Users can publish selected tasks
- Public portfolio is accessible without login
- Portfolio looks professional
- SEO-friendly for sharing

---

### Phase 11: Advanced Features (Week 11-12)

#### 11.1 Search & Filtering

**Tasks**:
- [ ] **Global search**:
  - Search across tasks, ideas, notes
  - Keyboard shortcut (Cmd/Ctrl + K)
  - Instant results
  
- [ ] **Advanced filters**:
  - Multi-domain selection
  - Date ranges
  - Priority levels
  - Completion status
  
- [ ] **Saved filters**:
  - Save common filter combinations
  - Quick access buttons

**Files to Create**:
```
src/
  components/
    Search/
      GlobalSearch.tsx        (NEW - Search modal)
      GlobalSearch.css
      SearchResults.tsx       (NEW - Results list)
  utils/
    search.ts                 (NEW - Search logic)
```

**Acceptance Criteria**:
- Search is fast and accurate
- Results are well-formatted
- Keyboard navigation works
- Filters combine correctly

---

#### 11.2 Data Export & Backup

**Tasks**:
- [ ] **Implement data export**:
  - Export all data as JSON
  - Export specific collections
  - Download as file
  
- [ ] **Import functionality**:
  - Import from JSON
  - Validate before importing
  - Handle conflicts
  
- [ ] **Automatic backups** (optional):
  - Daily backup to user's account
  - Restore from backup

**Files to Create**:
```
src/
  utils/
    export.ts                 (NEW - Export logic)
    import.ts                 (NEW - Import logic)
  components/
    Settings/
      DataManagement.tsx      (NEW - Export/import UI)
```

**Acceptance Criteria**:
- Users can export all their data
- Export format is readable and portable
- Import works correctly
- No data loss during export/import

---

#### 11.3 Keyboard Shortcuts

**Tasks**:
- [ ] **Implement common shortcuts**:
  - `Cmd/Ctrl + K` - Global search
  - `Cmd/Ctrl + N` - New task
  - `Cmd/Ctrl + I` - New idea
  - `Cmd/Ctrl + B` - Toggle sidebar
  - `Cmd/Ctrl + ,` - Settings
  - `G then D` - Go to Dashboard
  - `G then T` - Go to Tasks
  - `G then I` - Go to Ideas
  
- [ ] **Show shortcut hints**:
  - Tooltip on hover
  - Help modal with all shortcuts
  - `?` to show shortcuts

**Files to Create**:
```
src/
  hooks/
    useKeyboardShortcuts.ts   (NEW - Shortcuts hook)
  components/
    ShortcutsHelp.tsx         (NEW - Help modal)
```

**Acceptance Criteria**:
- All major actions have shortcuts
- Shortcuts are discoverable
- No conflicts with browser shortcuts
- Works across different OS

---

## MongoDB Integration Checklist

### Backend Setup

- [ ] **Install MongoDB locally** or use **MongoDB Atlas** (cloud)
  ```bash
  # Local installation
  brew install mongodb-community  # macOS
  sudo apt install mongodb         # Ubuntu
  
  # Or use Docker
  docker run -d -p 27017:27017 --name mongodb mongo
  ```

- [ ] **Create `.env` file** in backend:
  ```
  MONGODB_URI=mongodb://localhost:27017/omnidesk
  # or MongoDB Atlas
  # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/omnidesk
  
  PORT=3001
  JWT_SECRET=your-secret-key-here
  FRONTEND_URL=http://localhost:5173
  ```

- [ ] **Initialize MongoDB connection** on server start

- [ ] **Create database indexes** for performance:
  ```javascript
  // In seedData.ts or migration script
  await db.collection('tasks').createIndex({ userId: 1, stateId: 1 });
  await db.collection('tasks').createIndex({ userId: 1, deadline: 1 });
  await db.collection('ideas').createIndex({ userId: 1 });
  await db.collection('ideaElements').createIndex({ ideaId: 1 });
  ```

### Frontend Setup

- [ ] **Create `.env` file** in root:
  ```
  VITE_API_URL=http://localhost:3001/api
  VITE_STORAGE_TYPE=mongodb  # or 'localstorage' for fallback
  ```

- [ ] **Update storage factory** to use environment variable

- [ ] **Add API error handling** with user-friendly messages

- [ ] **Implement retry logic** for failed API calls

---

## Testing Strategy

### Unit Tests
- [ ] API endpoint tests (Jest + Supertest)
- [ ] Storage adapter tests
- [ ] Parser/validator tests

### Integration Tests
- [ ] Full CRUD workflows
- [ ] Authentication flow
- [ ] Data migration tests

### E2E Tests (Optional)
- [ ] Critical user flows (Playwright/Cypress)
- [ ] Cross-browser testing

### Manual Testing Checklist
- [ ] Create domain
- [ ] Create task with subtasks
- [ ] Create idea with canvas
- [ ] Convert idea to task
- [ ] Schedule subtask on calendar
- [ ] Complete task with reflection
- [ ] Use terminal for bulk creation
- [ ] Delete and restore from trash
- [ ] Customize task states
- [ ] Export/import data

---

## Performance Optimization

- [ ] **Lazy load pages** with React.lazy()
- [ ] **Virtualize long lists** (react-window)
- [ ] **Debounce auto-save** (300-500ms)
- [ ] **Optimize images** (compression, lazy loading)
- [ ] **Cache API responses** where appropriate
- [ ] **Add pagination** for large datasets
- [ ] **Monitor bundle size** (keep under 500KB initial)

---

## Deployment Checklist

### Backend Deployment (Render/Heroku/Railway)
- [ ] Set environment variables
- [ ] Connect to MongoDB Atlas
- [ ] Configure CORS for production domain
- [ ] Set up SSL/HTTPS
- [ ] Add monitoring (Sentry/LogRocket)

### Frontend Deployment (Vercel/Netlify)
- [ ] Set VITE_API_URL to production backend
- [ ] Build and test production bundle
- [ ] Configure redirects for SPA routing
- [ ] Add custom domain (optional)
- [ ] Set up analytics (optional)

---

## Success Metrics for MVP

### Technical Metrics
- ✅ All API endpoints working (100% coverage)
- ✅ Data persists correctly in MongoDB
- ✅ Page load time < 2 seconds
- ✅ No critical bugs in core flows

### User Experience Metrics
- ✅ User can create idea on infinite canvas
- ✅ User can convert idea to task seamlessly
- ✅ User can manage tasks through Kanban board
- ✅ User can view timeline in calendar
- ✅ User can customize workflow states
- ✅ User can export their data
- ✅ App works on mobile devices

### Feature Completeness
- ✅ All 11 pages functional
- ✅ Infinite canvas implemented
- ✅ Task-idea lineage working
- ✅ MongoDB fully integrated
- ✅ Authentication implemented
- ✅ Basic portfolio working

---

## Post-MVP Roadmap (Future Enhancements)

### Collaboration Features
- [ ] Share ideas with team members
- [ ] Collaborative canvas editing
- [ ] Task assignment to others
- [ ] Comments and discussions

### Advanced Analytics
- [ ] Productivity insights
- [ ] Time tracking
- [ ] Completion trends
- [ ] Domain distribution charts

### AI Integration
- [ ] AI-powered task suggestions
- [ ] Smart deadline estimation
- [ ] Idea-to-task automation
- [ ] Summary generation

### Integrations
- [ ] Google Calendar sync
- [ ] GitHub integration
- [ ] Notion import/export
- [ ] Email integration

---

## Resource Requirements

### Development Time Estimate
- **Phase 1-2**: 3 weeks (Infrastructure + Canvas)
- **Phase 3-5**: 4 weeks (Core Features)
- **Phase 6-8**: 3 weeks (Calendar + Polish)
- **Phase 9-11**: 3 weeks (Auth + Advanced)
- **Total**: ~13 weeks for full MVP

### Team Recommendation
- 1 Full-Stack Developer (React + Node.js)
- 1 UI/UX Designer (optional, for polish)
- 1 QA/Tester (part-time, for final weeks)

### Technology Stack Summary
```
Frontend:
  - React 19 + TypeScript
  - TLDraw/React Flow (infinite canvas)
  - FullCalendar (calendar)
  - React Beautiful DnD (Kanban)
  - React Router (navigation)

Backend:
  - Node.js + Express
  - MongoDB (database)
  - JWT (authentication)
  - Bcrypt (password hashing)

DevOps:
  - Vite (build tool)
  - ESLint + TypeScript (code quality)
  - Jest (testing)
  - Docker (optional, for deployment)
```

---

## Getting Started with Implementation

### Immediate Next Steps (This Week)

1. **Set up MongoDB**:
   ```bash
   # In backend directory
   npm install
   # Create .env with MongoDB URI
   npm run dev
   ```

2. **Test backend API**:
   - Use Postman/Thunder Client
   - Test all existing routes
   - Document any issues

3. **Choose canvas library**:
   - Test TLDraw demo
   - Test React Flow demo
   - Make decision based on UX

4. **Create implementation branch**:
   ```bash
   git checkout -b feature/mvp-implementation
   ```

5. **Start with Phase 1**: Complete MongoDB integration first
   - Everything else depends on stable backend
   - Test thoroughly before moving to Phase 2

---

## Final Notes

**This is an ambitious but achievable MVP.** The key is to:

1. ✅ **Build incrementally** - Each phase builds on the previous
2. ✅ **Test continuously** - Don't accumulate technical debt
3. ✅ **Focus on UX** - The vision is about "managing your mind"
4. ✅ **Stay flexible** - Adjust based on what works

**The infinite canvas is your differentiator.** Get that right, and OmniDesk becomes something truly special.

**Start small, ship often, iterate fast.**

Welcome to building OmniDesk 🚀






















OmniDesk MVP Implementation Roadmap (Revised & Aligned)

Goal: Build a functional MVP of OmniDesk as a thinking-first execution environment, where ideas exist independently, optionally expand into infinite canvases, and only become tasks when explicitly chosen — all backed by MongoDB.

Core Product Principle (Locked In)

Ideas are first-class citizens.
Tasks are optional outcomes.
Canvas is a tool, not a mandate.

Current Project Status Assessment
✅ What’s Already Implemented
Frontend Structure (React + TypeScript)

✅ Routing and navigation (React Router)

✅ All major pages scaffolded (Dashboard, Tasks, Ideas, Calendar, Terminal, Trash, Settings)

✅ Dock-style sidebar navigation

✅ AppContext for global state

✅ Storage abstraction (LocalStorage + MongoDB adapters)

✅ Core entity types defined

Backend API (Express + MongoDB)

✅ Express + TypeScript setup

✅ MongoDB connection configured

✅ Middleware (CORS, Helmet, Morgan)

✅ CRUD routes for all major collections

✅ Frontend MongoDB adapter consuming backend API

Data Model

✅ Core schemas defined (Task, Idea, Domain, CalendarEvent, etc.)

✅ MongoDB structure documented in database-structure-NOSQL.md

❌ What’s Missing (Critical for MVP)
1. Ideas Board + Per-Idea Infinite Canvas ⭐ FLAGSHIP

Current: Linear idea list with basic notes

Needed:

Ideas page as a spatial board of idea cards

Draggable, duplicatable, trashable idea cards

Each idea optionally opens into its own isolated infinite canvas

Canvas is disabled by default, user-controlled

2. Task–Idea Lineage (Optional & Intentional)

Current: Ideas and tasks are disconnected

Needed:

Tasks can reference an originating idea

Ideas can show tasks derived from them

No forced conversion or nudging

3. Customizable Task States & Adaptive Dashboard

Current: Fixed task states

Needed:

User-defined workflow states

Dashboard generated dynamically from states

4. Task Execution Space (Kanban per Task)

Current: Static task detail view

Needed:

Kanban board inside a task

Execution-only space, not global focus

5. Calendar as Awareness Layer

Current: Placeholder calendar

Needed:

Passive reflection of deadlines and schedules

No urgency-first design

6. Terminal for Cognitive Offload

Current: Placeholder

Needed:

Bulk creation via structured text

Brain-dump friendly

7. MongoDB End-to-End Integration

Current: API exists but not fully wired

Needed:

All UI actions persist to MongoDB

Graceful fallback + error handling

8. Basic Authentication

Current: Single default user

Needed:

JWT-based auth

User-level data isolation

MVP Implementation Plan
Phase 1: Core Infrastructure & MongoDB Integration (Week 1–2)

(UNCHANGED structurally — fully aligned already)

Goal: Make MongoDB the single source of truth before adding higher-level UX.

✔ Backend routes
✔ Schema validation
✔ Seed scripts
✔ Frontend adapter completion

(All tasks, files, and acceptance criteria remain valid and unchanged)

Phase 2: Ideas Board & Per-Idea Infinite Canvas (Week 2–3) ⭐ FLAGSHIP

This phase defines OmniDesk’s identity.

2.1 Ideas Page = Spatial Ideas Board

Clarified Behavior:

Ideas page shows many idea cards

Cards are:

draggable

position-persistent

duplicatable

trashable

Cards show:

title

short overview

canvas-enabled indicator (on/off)

No canvas here.
This page is overview-level cognition.

2.2 Per-Idea Infinite Canvas (Optional)

Key Rule:

Each idea owns exactly one canvas.
Canvas is optional and user-enabled.

Tasks:

Integrate TLDraw (preferred) or React Flow

Canvas loads only when an idea is opened

Canvas state stored per idea:

elements

viewport

zoom/pan

Auto-save with debounce

No task prompts inside canvas

Files (Adjusted Meaning, Same Structure)
src/
  pages/
    Ideas.tsx              (Ideas board with draggable cards)
    IdeaDetail.tsx         (Single idea focus view)
  components/
    Canvas/
      IdeaCanvas.tsx       (Canvas scoped to one idea)
      CanvasToolbar.tsx
  hooks/
    useIdeaLayout.ts       (Idea card positions)
    useCanvasState.ts

Acceptance Criteria

User can create unlimited ideas

Ideas can exist without canvas

Each idea’s canvas is isolated

No cross-idea bleed

Zero pressure to convert to tasks

Phase 3: Task–Idea Lineage (Week 3–4)

Tasks are born from ideas — never the other way around.

3.1 Idea → Task Conversion (Explicit Only)

Clarifications:

Conversion is manual

No automatic prompts

Idea remains unchanged after conversion

Enhancement:

Option to convert:

whole idea

specific canvas element

canvas snapshot

3.2 Lineage Visibility (Passive)

Idea view:

shows derived tasks (sidebar)

Task view:

shows origin idea (badge + link)

(Structure, files, and criteria unchanged)

Phase 4–8: Execution, Calendar, Terminal, UX Polish

These phases remain architecturally valid, with one important constraint applied globally:

🔒 Global Constraint (Applies to Phases 4–8)

Execution tools must never dominate thinking tools.

This means:

Kanban lives inside tasks

Calendar is awareness-first

Dashboard reflects reality, not urgency

Terminal is optional, not required

No structural changes needed — only UX discipline.

Phase 9: Authentication (Week 9)

Clarification:

MVP auth = login/register + JWT

Advanced flows (reset, deletion) optional post-MVP

Everything else remains intact.

Phase 10–11: Portfolio & Advanced Features

Status: Optional / Post-Core MVP
Kept intentionally late to avoid philosophy drift.

Final Alignment Summary
Aspect	Status
Ideas-first philosophy	✅ Preserved
Many ideas, many canvases	✅ Clear
Canvas optionality	✅ Explicit
No forced task creation	✅ Locked
Execution contained	✅ Scoped
Architecture stability	✅ Maintained
Final Verdict

This roadmap is now:

Philosophically consistent

Architecturally unchanged

Execution-safe

True to OmniDesk’s identity