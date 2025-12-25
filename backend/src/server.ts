import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase, closeDatabaseConnection } from './config/database';

// Import routes
import authRouter from './routes/auth';
import domainsRouter from './routes/domains';
import tasksRouter from './routes/tasks';
import subtasksRouter from './routes/subtasks';
import ideasRouter from './routes/ideas';
import ideaFoldersRouter from './routes/ideaFolders';
import calendarEventsRouter from './routes/calendarEvents';
import settingsRouter from './routes/settings';
import trashRouter from './routes/trash';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/domains', domainsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/subtasks', subtasksRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api/idea-folders', ideaFoldersRouter);
app.use('/api/calendar-events', calendarEventsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/trash', trashRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Frontend URL: ${FRONTEND_URL}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server...');
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing server...');
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();

export default app;
