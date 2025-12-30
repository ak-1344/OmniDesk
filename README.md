# OmniDesk

**Your Personal Thinking & Execution Environment**

> *"I don't use OmniDesk to manage tasks. I use it to manage my mind."*

OmniDesk is a modern productivity platform that respects how humans actually work. It's where your thoughts, plans, and commitments coexist naturally—without forcing you into rigid structures.

![Dashboard](https://github.com/user-attachments/assets/4bdc7195-9b4d-44d9-ab69-fb1cb81ce317)

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
- Node.js 18+
- Docker (for MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/ak-1344/OmniDesk.git
cd OmniDesk

# Start MongoDB
docker run -d -p 27017:27017 --name omnidesk-mongodb mongo:latest

# Set up backend
cd backend
npm install
cp .env.example .env
npm run seed  # Populate default data
npm run dev   # Start on port 3001

# Set up frontend (in new terminal)
cd ..
npm install
cp .env.example .env
npm run dev   # Start on port 5173
```

Open [http://localhost:5173](http://localhost:5173) to see OmniDesk.

📚 **Detailed setup guide:** [docs/QUICK-START.md](docs/QUICK-START.md)

## 📊 Architecture

```
OmniDesk/
├── backend/           # Express + MongoDB API
│   ├── routes/       # API endpoints
│   └── utils/        # Seed data, helpers
├── src/
│   ├── components/   # React components
│   │   └── Canvas/  # TLDraw infinite canvas
│   ├── pages/       # Route views
│   ├── lib/         # Storage adapters (MongoDB/LocalStorage)
│   └── context/     # Global state management
└── docs/            # Documentation
```

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Next.js
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB
- **Canvas**: TLDraw (Excalidraw-like)
- **Drag & Drop**: @hello-pangea/dnd
- **Styling**: CSS with dark theme

## 📖 Documentation

- [Quick Start Guide](docs/QUICK-START.md) - Get up and running
- [Implementation Progress](docs/IMPLEMENTATION-PROGRESS.md) - Current status & roadmap
- [Implementation Roadmap](implementation.md) - Detailed phase breakdown
- [Database Schema](database-structure-NOSQL.md) - MongoDB structure
- [Product Vision](idea.md) - Core philosophy & design

## 🗺 Roadmap

### Phase 1: Core Infrastructure ✅ DONE
MongoDB backend, seed data, frontend integration, connection status

### Phase 2: Infinite Canvas 🔨 IN PROGRESS  
TLDraw integration, canvas per idea, spatial ideas board, thumbnails

### Phase 3: Task-Idea Lineage ⏳ NEXT
Conversion flow, bidirectional linking, lineage sidebar

### Phase 4-10: Advanced Features ⏳ PLANNED
Custom states, Kanban boards, full calendar, terminal, UI polish, auth, production deployment

**Current Progress:** ~20% complete

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linters: `npm run lint`
5. Submit a pull request

## 📸 Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/4bdc7195-9b4d-44d9-ab69-fb1cb81ce317)

*More screenshots coming as features are implemented*

## 🐛 Known Issues

- Authentication not yet implemented (using default-user)
- Canvas thumbnails pending
- Some loading states missing
- Mobile responsiveness needs improvement

See [Issues](https://github.com/ak-1344/OmniDesk/issues) for full list.

## 📝 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## 🌟 Acknowledgments

- Inspired by the need for a thinking-first productivity tool
- Built with amazing open-source tools
- TLDraw for the infinite canvas experience

---

**Status**: Active Development | **Version**: 0.2.0-alpha | **MongoDB**: ✅ Running

Made with ❤️ for people who think before they do.
