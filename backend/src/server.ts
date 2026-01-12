import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectToDatabase, closeDatabaseConnection, getDatabase } from './config/database';

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
const CORS_ALLOW_ALL = process.env.CORS_ALLOW_ALL === 'true';

// Middleware
app.use(helmet());
app.use(cors({
  origin: CORS_ALLOW_ALL ? true : FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Server-Sent Events stream for MongoDB change notifications
app.get('/api/realtime', async (req, res) => {
  try {
    const userId = (req.query.user_id as string) || 'default-user';
    const db = getDatabase();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (payload: any) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    const collections = [
      { name: 'tasks', entity: 'task' },
      { name: 'ideas', entity: 'idea' },
      { name: 'calendar_events', entity: 'event' },
      { name: 'domains', entity: 'domain' },
      { name: 'idea_folders', entity: 'idea_folder' },
      { name: 'user_settings', entity: 'settings' }
    ];

    const streams = collections.map(({ name, entity }) => {
      const pipeline: any[] = [
        {
          $match: {
            $or: [
              { 'fullDocument.user_id': userId },
              { operationType: 'delete' }
            ]
          }
        }
      ];

      const stream = db.collection(name).watch(pipeline, {
        fullDocument: 'updateLookup'
      });

      stream.on('change', (change: any) => {
        const payload = {
          entity,
          operation: change.operationType,
          id: change.documentKey?._id?.toString?.() || change.fullDocument?._id?.toString?.(),
          userId: change.fullDocument?.user_id || userId,
          updatedAt: Date.now()
        };

        // Skip events for other users when possible
        if (payload.userId && payload.userId !== userId) {
          return;
        }

        sendEvent(payload);
      });

      stream.on('error', (error: any) => {
        console.error('Change stream error:', error);
        sendEvent({ entity: 'system', operation: 'error', message: 'Change stream error' });
      });

      return stream;
    });

    // Keep connection alive
    const heartbeat = setInterval(() => {
      res.write(':\n\n');
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
      streams.forEach(stream => stream.close());
      res.end();
    });
  } catch (error) {
    console.error('Realtime stream failed to start:', error);
    res.status(500).end();
  }
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
