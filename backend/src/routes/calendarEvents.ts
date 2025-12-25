import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all calendar events for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const events = await db
      .collection('calendar_events')
      .find({ user_id: userId })
      .sort({ date: 1 })
      .toArray();
    
    res.json(events.map(e => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.start_time,
      endTime: e.end_time,
      type: e.type,
      relatedTaskId: e.related_task_id,
      relatedSubtaskId: e.related_subtask_id
    })));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: { message: 'Failed to fetch calendar events' } });
  }
});

// Create a new calendar event
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, date, startTime, endTime, type, relatedTaskId, relatedSubtaskId, user_id } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('calendar_events').insertOne({
      user_id: user_id || 'default-user',
      title,
      description: description || null,
      date,
      start_time: startTime || null,
      end_time: endTime || null,
      type,
      related_task_id: relatedTaskId || null,
      related_subtask_id: relatedSubtaskId || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      title,
      description,
      date,
      startTime,
      endTime,
      type,
      relatedTaskId,
      relatedSubtaskId
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: { message: 'Failed to create calendar event' } });
  }
});

// Update a calendar event
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, type, relatedTaskId, relatedSubtaskId } = req.body;
    const db = getDatabase();
    
    const updateDoc: any = { updated_at: new Date() };
    if (title !== undefined) updateDoc.title = title;
    if (description !== undefined) updateDoc.description = description;
    if (date !== undefined) updateDoc.date = date;
    if (startTime !== undefined) updateDoc.start_time = startTime;
    if (endTime !== undefined) updateDoc.end_time = endTime;
    if (type !== undefined) updateDoc.type = type;
    if (relatedTaskId !== undefined) updateDoc.related_task_id = relatedTaskId;
    if (relatedSubtaskId !== undefined) updateDoc.related_subtask_id = relatedSubtaskId;

    const result = await db.collection('calendar_events').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: { message: 'Calendar event not found' } });
    }

    res.json({
      id: result._id.toString(),
      title: result.title,
      description: result.description,
      date: result.date,
      startTime: result.start_time,
      endTime: result.end_time,
      type: result.type,
      relatedTaskId: result.related_task_id,
      relatedSubtaskId: result.related_subtask_id
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: { message: 'Failed to update calendar event' } });
  }
});

// Delete a calendar event
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('calendar_events').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: { message: 'Calendar event not found' } });
    }

    res.json({ message: 'Calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: { message: 'Failed to delete calendar event' } });
  }
});

export default router;
