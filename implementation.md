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