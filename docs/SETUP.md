# OmniDesk Setup Guide

This guide will help you set up OmniDesk for local development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Docker** (for MongoDB) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ak-1344/OmniDesk.git
cd OmniDesk
```

### 2. Start MongoDB

You have two options for running MongoDB:

#### Option A: Using Docker (Recommended)

```bash
docker run -d -p 27017:27017 --name omnidesk-mongodb mongo:latest
```

This creates a MongoDB container named `omnidesk-mongodb` running on port 27017.

#### Option B: Local MongoDB Installation

If you have MongoDB installed locally:

```bash
mongod --dbpath /path/to/your/data/directory
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (default values work for local development)
# MONGODB_URI=mongodb://localhost:27017/
# MONGODB_DB_NAME=omnidesk
# PORT=3001
# FRONTEND_URL=http://localhost:5173

# Seed the database with default data
npm run seed

# Start the backend server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 4. Setup Frontend

Open a new terminal window:

```bash
cd /path/to/OmniDesk

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000` (Next.js default) or `http://localhost:5173` if configured.

### 5. Verify Installation

1. Open your browser to `http://localhost:3000`
2. You should see the OmniDesk landing page
3. Click "Enter Workspace" to access the dashboard
4. You should see seeded domains and sample data

## Detailed Configuration

### Environment Variables

#### Backend (.env)

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=omnidesk

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# JWT Configuration (for future authentication)
# JWT_SECRET=your-secret-key-here
# JWT_EXPIRE=7d
```

#### Frontend (.env)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Database Seeding

The backend includes a seed script that populates the database with:

- 4 default domains (College, Startup, Health, Personal)
- Sample tasks across different states
- Sample ideas with various configurations
- Default user settings

To re-seed the database (this will clear existing data):

```bash
cd backend
npm run seed
```

### Storage Adapter Configuration

OmniDesk supports two storage backends:

1. **MongoDB** (default, recommended for production)
2. **LocalStorage** (browser-based, for offline development)

To switch adapters, modify `lib/storage.factory.ts`:

```typescript
// Use MongoDB (default)
const STORAGE_TYPE: StorageType = 'mongodb';

// Or use LocalStorage
const STORAGE_TYPE: StorageType = 'localstorage';
```

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Backend fails to connect to MongoDB

**Solutions**:
1. Ensure MongoDB is running: `docker ps` (should show omnidesk-mongodb)
2. Check MongoDB is accessible: `mongosh mongodb://localhost:27017/omnidesk`
3. Verify MONGODB_URI in backend/.env matches your MongoDB instance

### Port Conflicts

**Problem**: Port 3001 or 3000 already in use

**Solutions**:
1. Change PORT in backend/.env to another port (e.g., 3002)
2. Change frontend port by updating package.json: `"dev": "next dev -p 5173"`
3. Update NEXT_PUBLIC_API_URL in frontend .env accordingly

### CORS Errors

**Problem**: Frontend can't connect to backend API

**Solutions**:
1. Ensure backend is running on the correct port
2. Verify FRONTEND_URL in backend/.env matches your frontend URL
3. Check NEXT_PUBLIC_API_URL in frontend .env is correct

### Missing Dependencies

**Problem**: Module not found errors

**Solutions**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Do the same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Running Both Servers

You need two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
npm run dev
```

### Stopping Services

- Press `Ctrl+C` in each terminal to stop the servers
- Stop MongoDB: `docker stop omnidesk-mongodb`
- Remove MongoDB container: `docker rm omnidesk-mongodb`

### Restarting from Scratch

```bash
# Stop and remove MongoDB container
docker stop omnidesk-mongodb
docker rm omnidesk-mongodb

# Start fresh MongoDB
docker run -d -p 27017:27017 --name omnidesk-mongodb mongo:latest

# Re-seed database
cd backend
npm run seed

# Restart servers
npm run dev  # in backend directory
npm run dev  # in root directory
```

## Production Setup

For production deployment, see [DEVELOPMENT.md](./DEVELOPMENT.md) for build instructions.

### Build Commands

```bash
# Build frontend
npm run build
npm start

# Build backend
cd backend
npm run build
npm start
```

### Environment Variables for Production

Update your .env files with production values:

- Use a secure MongoDB instance (MongoDB Atlas recommended)
- Set NODE_ENV=production
- Configure proper CORS settings
- Set secure JWT_SECRET (when authentication is implemented)
- Use HTTPS URLs for FRONTEND_URL and NEXT_PUBLIC_API_URL

## Next Steps

- Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the system design
- Review [API_REFERENCE.md](./API_REFERENCE.md) for API documentation
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for development guidelines
- See [UserGuide.md](./UserGuide.md) to learn about features

## Getting Help

- Check existing [Issues](https://github.com/ak-1344/OmniDesk/issues)
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Contact the maintainers for support
