# OmniDesk

**Your Personal Thinking & Execution Environment**

> *"I don't use OmniDesk to manage tasks. I use it to manage my mind."*

OmniDesk is a modern productivity platform that respects how humans actually work. It's where your thoughts, plans, and commitments coexist naturally—without forcing you into rigid structures.

![Dashboard](https://github.com/user-attachments/assets/4bdc7195-9b4d-44d9-ab69-fb1cb81ce317)

## 📚 Documentation

**Complete documentation is available in the [/docs](./docs) folder:**

- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[API Reference](./docs/API_REFERENCE.md)** - Backend API documentation
- **[Development Guide](./docs/DEVELOPMENT.md)** - Coding standards and workflows
- **[Handover Document](./docs/HANDOVER.md)** - Project state and production readiness
- **[User Guide](./docs/UserGuide.md)** - End-user documentation

## ✨ Core Philosophy

- **Thinking ≠ Doing**: Not every thought needs to become a task
- **Ideas First**: Thoughts exist independently, optionally expand into infinite canvas
- **Awareness > Urgency**: Clear visibility without pressure
- **Your System**: Customizable domains and workflows that adapt to your reality

## 🚀 Current Features

### ✅ Implemented (Phase 1)
- **MongoDB Backend** - Full API with Express + TypeScript
- **Domain Management** - Organize work by life areas (College, Startup, Health, Personal)
- **Ideas System** - Capture thoughts without commitment pressure
- **Task Management** - Create and track tasks when you're ready
- **Calendar Integration** - Time-aware planning
- **Trash System** - Reversible deletion for peace of mind
- **Connection Status** - Real-time MongoDB connection indicator

### 🔨 In Progress (Phase 2)
- **Infinite Canvas** - TLDraw-powered whiteboard for each idea
- **Spatial Ideas Board** - Draggable idea cards with positioning
- **Idea-to-Task Conversion** - Intentional commitment flow
- **Task Lineage** - Track which tasks originated from which ideas

### ⏳ Coming Soon
- Customizable workflow states (mental states, not rigid processes)
- Subtask Kanban boards with drag-and-drop
- Full calendar integration with FullCalendar
- Terminal for bulk input
- GitHub-inspired modern UI
- JWT authentication for multi-user support

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker (for MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ak-1344/OmniDesk.git
cd OmniDesk

# 2. Start MongoDB
docker run -d -p 27017:27017 --name omnidesk-mongodb mongo:latest

# 3. Set up backend
cd backend
npm install
npm run seed    # Populate default data
npm run dev     # Start on port 3001

# 4. Set up frontend (in new terminal)
cd ..
npm install
npm run dev     # Start on port 3000
```

Open [http://localhost:3000](http://localhost:3000) to see OmniDesk.

📚 **For detailed setup instructions, see [docs/SETUP.md](./docs/SETUP.md)**

## 📊 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Next.js)              │
│   React 19 + TypeScript + Tailwind     │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
┌──────────────▼──────────────────────────┐
│      Backend API (Express.js)           │
│       TypeScript + Node.js              │
└──────────────┬──────────────────────────┘
               │ MongoDB Driver
┌──────────────▼──────────────────────────┐
│       Database (MongoDB)                │
│     domains, tasks, ideas, events       │
└─────────────────────────────────────────┘
```

**For detailed architecture documentation, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**

## 📖 Project Structure

```
OmniDesk/
├── app/                   # Next.js App Router pages
│   ├── dashboard/        # Dashboard view
│   ├── ideas/            # Ideas board
│   ├── tasks/            # Task management
│   └── calendar/         # Calendar view
├── components/           # React components
│   ├── ui/              # Reusable UI (shadcn/ui)
│   └── *.tsx            # Feature components
├── backend/             # Express + MongoDB API
│   └── src/
│       ├── routes/      # API endpoints
│       ├── config/      # Database setup
│       └── utils/       # Seed data
├── lib/                 # Storage adapters, types
├── context/             # Global state (React Context)
└── docs/                # Documentation
```

## 🛠 Tech Stack

**Frontend**
- Next.js 15 (App Router) + React 19
- TypeScript 5.9
- Tailwind CSS 4 + shadcn/ui
- TLDraw (infinite canvas)
- React Context API (state)

**Backend**
- Node.js + Express
- TypeScript
- MongoDB (native driver)
- express-validator
- Helmet + CORS

**Development**
- Docker (MongoDB)
- Hot reload
- ESLint + TypeScript

## 📖 Documentation

**Comprehensive documentation available in [/docs](./docs):**

- **[Setup Guide](./docs/SETUP.md)** - Installation and configuration
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and patterns
- **[API Reference](./docs/API_REFERENCE.md)** - Backend API documentation
- **[Development Guide](./docs/DEVELOPMENT.md)** - Coding standards and workflows
- **[Handover Document](./docs/HANDOVER.md)** - Project state and production readiness
- **[User Guide](./docs/UserGuide.md)** - End-user documentation
- **[Quick Start](./docs/QUICK-START.md)** - Get up and running

## 🗺 Roadmap & Status

**Current Version**: 0.2.0 (Alpha Development)  
**Production Readiness**: ~60%

### ✅ Implemented
- MongoDB backend with RESTful API
- Domain-based organization
- Ideas system with spatial positioning
- Task management with subtasks
- Calendar integration
- Trash system with soft delete
- Customizable Kanban workflows
- Modern UI with dark theme

### 🔨 In Progress
- TLDraw infinite canvas per idea
- Full drag-and-drop for spatial ideas
- Thought Terminal (quick input)
- Enhanced calendar view

### ⏳ Planned
- User authentication (JWT)
- Comprehensive testing suite
- Performance optimization
- Production deployment setup
- Real-time collaboration
- Mobile responsiveness improvements

**For detailed roadmap and project state, see [HANDOVER.md](./docs/HANDOVER.md)**

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Development Resources**:
- [Development Guide](./docs/DEVELOPMENT.md) - Coding standards and workflows
- [API Reference](./docs/API_REFERENCE.md) - Backend API documentation
- [Architecture](./docs/ARCHITECTURE.md) - System design patterns

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with clear commits
4. Test locally
5. Submit a pull request

## 📸 Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/4bdc7195-9b4d-44d9-ab69-fb1cb81ce317)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), and [MongoDB](https://www.mongodb.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Canvas powered by [TLDraw](https://tldraw.dev/)

---

**For questions or support, please open an issue on GitHub.**- Inspired by the need for a thinking-first productivity tool
- Built with amazing open-source tools
- TLDraw for the infinite canvas experience

---

**Status**: Active Development | **Version**: 0.2.0-alpha | **MongoDB**: ✅ Running

Made with ❤️ for people who think before they do.
