import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all tasks for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const tasks = await db
      .collection('tasks')
      .find({ user_id: userId, deleted_at: { $exists: false } })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      domainId: t.domain_id,
      state: t.state,
      deadline: t.deadline,
      notes: t.notes,
      proof: t.proof,
      subtasks: (t.subtasks || []).map((s: any) => ({
        id: s._id,
        title: s.title,
        description: s.description,
        state: s.state,
        deadline: s.deadline,
        scheduledTime: s.scheduled_time ? {
          date: s.scheduled_time.date,
          startTime: s.scheduled_time.start_time,
          duration: s.scheduled_time.duration
        } : undefined,
        proof: s.proof,
        completedAt: s.completed_at
      })),
      createdAt: t.created_at,
      updatedAt: t.updated_at
    })));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: { message: 'Failed to fetch tasks' } });
  }
});

// Get a single task
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(id),
      deleted_at: { $exists: false }
    });

    if (!task) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      domainId: task.domain_id,
      state: task.state,
      deadline: task.deadline,
      notes: task.notes,
      proof: task.proof,
      subtasks: (task.subtasks || []).map((s: any) => ({
        id: s._id,
        title: s.title,
        description: s.description,
        state: s.state,
        deadline: s.deadline,
        scheduledTime: s.scheduled_time ? {
          date: s.scheduled_time.date,
          startTime: s.scheduled_time.start_time,
          duration: s.scheduled_time.duration
        } : undefined,
        proof: s.proof,
        completedAt: s.completed_at
      })),
      createdAt: task.created_at,
      updatedAt: task.updated_at
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: { message: 'Failed to fetch task' } });
  }
});

// Create a new task
router.post('/',
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('domainId').notEmpty().withMessage('Domain ID is required'),
    body('state').isIn(['gotta-start', 'in-progress', 'nearly-done', 'paused', 'completed']),
    body('user_id').notEmpty().withMessage('User ID is required')
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, domainId, state, deadline, notes, proof, user_id } = req.body;
      const db = getDatabase();
      
      const result = await db.collection('tasks').insertOne({
        user_id,
        domain_id: domainId,
        title,
        description: description || '',
        state,
        deadline: deadline || null,
        notes: notes || null,
        proof: proof || null,
        subtasks: [],
        created_at: new Date(),
        updated_at: new Date()
      });

      res.status(201).json({
        id: result.insertedId.toString(),
        title,
        description: description || '',
        domainId,
        state,
        deadline,
        notes,
        proof,
        subtasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: { message: 'Failed to create task' } });
    }
  }
);

// Update a task
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, domainId, state, deadline, notes, proof } = req.body;
    const db = getDatabase();
    
    const updateDoc: any = { updated_at: new Date() };
    if (title !== undefined) updateDoc.title = title;
    if (description !== undefined) updateDoc.description = description;
    if (domainId !== undefined) updateDoc.domain_id = domainId;
    if (state !== undefined) updateDoc.state = state;
    if (deadline !== undefined) updateDoc.deadline = deadline;
    if (notes !== undefined) updateDoc.notes = notes;
    if (proof !== undefined) updateDoc.proof = proof;

    const result = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({
      id: result._id.toString(),
      title: result.title,
      description: result.description,
      domainId: result.domain_id,
      state: result.state,
      deadline: result.deadline,
      notes: result.notes,
      proof: result.proof,
      subtasks: (result.subtasks || []).map((s: any) => ({
        id: s._id,
        title: s.title,
        description: s.description,
        state: s.state,
        deadline: s.deadline,
        scheduledTime: s.scheduled_time,
        proof: s.proof,
        completedAt: s.completed_at
      })),
      createdAt: result.created_at,
      updatedAt: result.updated_at
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: { message: 'Failed to update task' } });
  }
});

// Delete a task (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: { message: 'Failed to delete task' } });
  }
});

export default router;
