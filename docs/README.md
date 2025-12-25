# OmniDesk Documentation

Welcome to the OmniDesk documentation! This guide will help you understand the architecture, components, and APIs of OmniDesk.

## Table of Contents

- [Getting Started](./getting-started.md)
- [Architecture](./architecture.md)
- [Components Guide](./components.md)
- [API Reference](./api-reference.md)
- [Styling Guide](./styling-guide.md)
- [State Management](./state-management.md)
- [Data Configuration](./data-configuration.md) - **Data structures and storage requirements**
- [Supabase Setup](./supabase-setup.md) - **Cloud database integration guide**

## Quick Links

### For Users
- [Installation Guide](./getting-started.md#installation)
- [Basic Usage](./getting-started.md#basic-usage)
- [Features Overview](./getting-started.md#features)

### For Developers
- [Project Structure](./architecture.md#project-structure)
- [Component Documentation](./components.md)
- [Adding New Features](./architecture.md#extending)
- [Data Configuration](./data-configuration.md)
- [Supabase Integration](./supabase-setup.md)
- [Database Schema](./database-schema.sql)
- [Contributing Guidelines](../CONTRIBUTING.md)

## Overview

OmniDesk is a modern productivity application built with React, TypeScript, and Vite. It provides a comprehensive solution for managing tasks, ideas, calendar events, and more. Data can be stored locally in your browser or synced to the cloud using Supabase.

### Key Features
- **Task Management**: Organize tasks with domains, states, deadlines, and enhanced subtasks (with descriptions and deadlines)
- **Idea Capture**: Notion-inspired minimalist interface for quickly saving ideas and converting them to actionable tasks
- **Calendar Integration**: View current month with events linked to your tasks and subtasks
- **Drag-and-Drop Deletion**: Floating trash can for quick task deletion via drag-and-drop
- **Adaptive Layout**: Dynamic sidebar that adjusts content area for optimal screen usage
- **Flexible Storage**: Choose between local browser storage or cloud sync with Supabase
- **Real-time Sync** (Supabase): Live updates across devices with real-time subscriptions
- **Modern UI**: Glassmorphism design with smooth animations and transitions

### Technology Stack
- **React 19**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling and HMR
- **React Router**: Client-side routing
- **CSS3**: Modern styling with glassmorphism effects
- **Supabase** (Optional): PostgreSQL database with real-time capabilities and authentication

## Support

For issues, questions, or contributions:
- [GitHub Issues](https://github.com/ak-1344/OmniDesk/issues)
- [Contributing Guide](../CONTRIBUTING.md)
