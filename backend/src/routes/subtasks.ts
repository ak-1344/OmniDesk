import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Add a subtask to a task
router.post('/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { title, description, state, deadline, scheduledTime, proof } = req.body;
    const db = getDatabase();
    
    const newSubtask = {
      _id: new ObjectId().toString(),
      title,
      description: description || null,
      state: state || 'todo',
      deadline: deadline || null,
      scheduled_time: scheduledTime ? {
        date: scheduledTime.date,
        start_time: scheduledTime.startTime,
        duration: scheduledTime.duration
      } : null,
      proof: proof || null,
      completed_at: null
    };

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: { subtasks: newSubtask } as any,
        $set: { updated_at: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.status(201).json({
      id: newSubtask._id,
      title: newSubtask.title,
      description: newSubtask.description,
      state: newSubtask.state,
      deadline: newSubtask.deadline,
      scheduledTime,
      proof: newSubtask.proof,
      completedAt: newSubtask.completed_at
    });
  } catch (error) {
    console.error('Error creating subtask:', error);
    res.status(500).json({ error: { message: 'Failed to create subtask' } });
  }
});

// Update a subtask
router.put('/:taskId/:subtaskId', async (req: Request, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { title, description, state, deadline, scheduledTime, proof, completedAt } = req.body;
    const db = getDatabase();
    
    const updateDoc: any = {};
    if (title !== undefined) updateDoc['subtasks.$.title'] = title;
    if (description !== undefined) updateDoc['subtasks.$.description'] = description;
    if (state !== undefined) updateDoc['subtasks.$.state'] = state;
    if (deadline !== undefined) updateDoc['subtasks.$.deadline'] = deadline;
    if (scheduledTime !== undefined) {
      updateDoc['subtasks.$.scheduled_time'] = scheduledTime ? {
        date: scheduledTime.date,
        start_time: scheduledTime.startTime,
        duration: scheduledTime.duration
      } : null;
    }
    if (proof !== undefined) updateDoc['subtasks.$.proof'] = proof;
    if (completedAt !== undefined) updateDoc['subtasks.$.completed_at'] = completedAt;

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId), 'subtasks._id': subtaskId },
      {
        $set: { ...updateDoc, updated_at: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: { message: 'Task or subtask not found' } });
    }

    res.json({ message: 'Subtask updated successfully' });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ error: { message: 'Failed to update subtask' } });
  }
});

// Delete a subtask
router.delete('/:taskId/:subtaskId', async (req: Request, res: Response) => {
  try {
    const { taskId, subtaskId } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      {
        $pull: { subtasks: { _id: subtaskId } } as any,
        $set: { updated_at: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: { message: 'Failed to delete subtask' } });
  }
});

export default router;
