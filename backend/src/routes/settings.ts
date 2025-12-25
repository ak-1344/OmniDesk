import { Router, Request, Response } from 'express';
import { getDatabase } from '../config/database';

const router = Router();

// Get user settings
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const settings = await db.collection('user_settings').findOne({ user_id: userId });

    if (!settings) {
      // Return default settings
      return res.json({
        theme: 'dark',
        defaultView: 'dashboard',
        dateFormat: 'YYYY-MM-DD',
        weekStartsOn: 'monday',
        notifications: {
          email: true,
          desktop: true,
          taskReminders: true
        },
        trashRetentionDays: 30
      });
    }

    res.json({
      theme: settings.theme,
      defaultView: settings.default_view,
      dateFormat: settings.date_format,
      weekStartsOn: settings.week_starts_on,
      notifications: {
        email: settings.notifications_email,
        desktop: settings.notifications_desktop,
        taskReminders: settings.notifications_task_reminders
      },
      trashRetentionDays: settings.trash_retention_days
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: { message: 'Failed to fetch settings' } });
  }
});

// Update user settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const { theme, defaultView, dateFormat, weekStartsOn, notifications, trashRetentionDays, user_id } = req.body;
    const userId = user_id || 'default-user';
    const db = getDatabase();
    
    const updateDoc: any = { updated_at: new Date() };
    if (theme !== undefined) updateDoc.theme = theme;
    if (defaultView !== undefined) updateDoc.default_view = defaultView;
    if (dateFormat !== undefined) updateDoc.date_format = dateFormat;
    if (weekStartsOn !== undefined) updateDoc.week_starts_on = weekStartsOn;
    if (notifications?.email !== undefined) updateDoc.notifications_email = notifications.email;
    if (notifications?.desktop !== undefined) updateDoc.notifications_desktop = notifications.desktop;
    if (notifications?.taskReminders !== undefined) updateDoc.notifications_task_reminders = notifications.taskReminders;
    if (trashRetentionDays !== undefined) updateDoc.trash_retention_days = trashRetentionDays;

    const result = await db.collection('user_settings').updateOne(
      { user_id: userId },
      { $set: updateDoc },
      { upsert: true }
    );

    res.json({
      theme,
      defaultView,
      dateFormat,
      weekStartsOn,
      notifications,
      trashRetentionDays
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: { message: 'Failed to update settings' } });
  }
});

export default router;
