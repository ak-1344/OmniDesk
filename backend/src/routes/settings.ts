import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';

const router = Router();

// Default kanban columns for tasks
const DEFAULT_KANBAN_COLUMNS = [
  { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
  { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
  { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
  { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
];

// Default kanban columns for subtasks
const DEFAULT_SUBTASK_KANBAN_COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280', order: 0 },
  { id: 'in-progress', label: 'In Progress', color: '#f97316', order: 1 },
  { id: 'completed', label: 'Done', color: '#22c55e', order: 2 },
];

// Default user profile
const DEFAULT_USER = {
  name: 'User',
  email: '',
  avatar: '',
};

// Get user settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const settings = await db.collection('user_settings').findOne({ user_id: userId });

    if (!settings) {
      // Return default settings with all fields
      return res.json({
        theme: 'dark',
        defaultView: 'dashboard',
        dateFormat: 'YYYY-MM-DD',
        weekStartsOn: 'monday',
        notifications: {
          email: false,
          desktop: true,
          taskReminders: true
        },
        trashRetentionDays: 30,
        kanbanColumns: DEFAULT_KANBAN_COLUMNS,
        subtaskKanbanColumns: DEFAULT_SUBTASK_KANBAN_COLUMNS,
        user: DEFAULT_USER,
        domainOrder: []
      });
    }

    res.json({
      theme: settings.theme || 'dark',
      defaultView: settings.default_view || settings.defaultView || 'dashboard',
      dateFormat: settings.date_format || settings.dateFormat || 'YYYY-MM-DD',
      weekStartsOn: settings.week_starts_on || settings.weekStartsOn || 'monday',
      notifications: settings.notifications || {
        email: settings.notifications_email ?? false,
        desktop: settings.notifications_desktop ?? true,
        taskReminders: settings.notifications_task_reminders ?? true
      },
      trashRetentionDays: settings.trash_retention_days || settings.trashRetentionDays || 30,
      kanbanColumns: settings.kanban_columns || settings.kanbanColumns || DEFAULT_KANBAN_COLUMNS,
      subtaskKanbanColumns: settings.subtask_kanban_columns || settings.subtaskKanbanColumns || DEFAULT_SUBTASK_KANBAN_COLUMNS,
      user: settings.user || DEFAULT_USER,
      domainOrder: settings.domain_order || settings.domainOrder || []
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: { message: 'Failed to fetch settings' } });
  }
});

// Update user settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const { 
      theme, 
      defaultView, 
      dateFormat, 
      weekStartsOn, 
      notifications, 
      trashRetentionDays, 
      kanbanColumns,
      subtaskKanbanColumns,
      user,
      domainOrder,
      user_id 
    } = req.body;
    const userId = user_id || 'default-user';
    const db = getDatabase();
    
    const updateDoc: any = { updated_at: new Date() };
    
    // Basic settings
    if (theme !== undefined) updateDoc.theme = theme;
    if (defaultView !== undefined) updateDoc.default_view = defaultView;
    if (dateFormat !== undefined) updateDoc.date_format = dateFormat;
    if (weekStartsOn !== undefined) updateDoc.week_starts_on = weekStartsOn;
    if (trashRetentionDays !== undefined) updateDoc.trash_retention_days = trashRetentionDays;
    
    // Nested notifications object
    if (notifications !== undefined) {
      updateDoc.notifications = notifications;
    }
    
    // Kanban columns
    if (kanbanColumns !== undefined) updateDoc.kanban_columns = kanbanColumns;
    if (subtaskKanbanColumns !== undefined) updateDoc.subtask_kanban_columns = subtaskKanbanColumns;
    
    // User profile
    if (user !== undefined) updateDoc.user = user;
    
    // Domain order
    if (domainOrder !== undefined) updateDoc.domain_order = domainOrder;

    await db.collection('user_settings').updateOne(
      { user_id: userId },
      { $set: updateDoc },
      { upsert: true }
    );

    // Return the complete updated settings
    const updatedSettings = await db.collection('user_settings').findOne({ user_id: userId });
    
    res.json({
      theme: updatedSettings?.theme || theme || 'dark',
      defaultView: updatedSettings?.default_view || defaultView || 'dashboard',
      dateFormat: updatedSettings?.date_format || dateFormat || 'YYYY-MM-DD',
      weekStartsOn: updatedSettings?.week_starts_on || weekStartsOn || 'monday',
      notifications: updatedSettings?.notifications || notifications || {
        email: false,
        desktop: true,
        taskReminders: true
      },
      trashRetentionDays: updatedSettings?.trash_retention_days || trashRetentionDays || 30,
      kanbanColumns: updatedSettings?.kanban_columns || kanbanColumns || DEFAULT_KANBAN_COLUMNS,
      subtaskKanbanColumns: updatedSettings?.subtask_kanban_columns || subtaskKanbanColumns || DEFAULT_SUBTASK_KANBAN_COLUMNS,
      user: updatedSettings?.user || user || DEFAULT_USER,
      domainOrder: updatedSettings?.domain_order || domainOrder || []
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: { message: 'Failed to update settings' } });
  }
});

export default router;
