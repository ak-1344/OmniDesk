import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all trash items for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const trashItems: any[] = [];

    // Get deleted tasks
    const tasks = await db.collection('tasks').find({
      user_id: userId,
      deleted_at: { $exists: true }
    }).toArray();

    tasks.forEach(t => {
      trashItems.push({
        id: t._id.toString(),
        type: 'task',
        item: {
          id: t._id.toString(),
          title: t.title,
          description: t.description,
          domainId: t.domain_id,
          state: t.state,
          subtasks: [],
          createdAt: t.created_at,
          updatedAt: t.updated_at
        },
        deletedAt: t.deleted_at,
        deletedBy: 'You'
      });
    });

    // Get deleted ideas
    const ideas = await db.collection('ideas').find({
      user_id: userId,
      deleted_at: { $exists: true }
    }).toArray();

    ideas.forEach(i => {
      trashItems.push({
        id: i._id.toString(),
        type: 'idea',
        item: {
          id: i._id.toString(),
          title: i.title,
          color: i.color,
          notes: [],
          createdAt: i.created_at,
          updatedAt: i.updated_at
        },
        deletedAt: i.deleted_at,
        deletedBy: 'You'
      });
    });

    // Sort by deleted date
    trashItems.sort((a, b) => 
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    res.json(trashItems);
  } catch (error) {
    console.error('Error fetching trash:', error);
    res.status(500).json({ error: { message: 'Failed to fetch trash' } });
  }
});

// Restore an item from trash
router.post('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Try to restore as task
    const taskResult = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $unset: { deleted_at: '' } }
    );

    if (taskResult.modifiedCount > 0) {
      return res.json({ message: 'Task restored successfully' });
    }

    // Try to restore as idea
    const ideaResult = await db.collection('ideas').updateOne(
      { _id: new ObjectId(id) },
      { $unset: { deleted_at: '' } }
    );

    if (ideaResult.modifiedCount > 0) {
      return res.json({ message: 'Idea restored successfully' });
    }

    res.status(404).json({ error: { message: 'Item not found in trash' } });
  } catch (error) {
    console.error('Error restoring from trash:', error);
    res.status(500).json({ error: { message: 'Failed to restore from trash' } });
  }
});

// Permanently delete an item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Try to delete as task
    const taskResult = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    if (taskResult.deletedCount > 0) {
      return res.json({ message: 'Task permanently deleted' });
    }

    // Try to delete as idea
    const ideaResult = await db.collection('ideas').deleteOne({ _id: new ObjectId(id) });
    if (ideaResult.deletedCount > 0) {
      return res.json({ message: 'Idea permanently deleted' });
    }

    res.status(404).json({ error: { message: 'Item not found' } });
  } catch (error) {
    console.error('Error permanently deleting:', error);
    res.status(500).json({ error: { message: 'Failed to permanently delete' } });
  }
});

// Empty trash
router.delete('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    // Delete all soft-deleted tasks
    await db.collection('tasks').deleteMany({
      user_id: userId,
      deleted_at: { $exists: true }
    });

    // Delete all soft-deleted ideas
    await db.collection('ideas').deleteMany({
      user_id: userId,
      deleted_at: { $exists: true }
    });

    res.json({ message: 'Trash emptied successfully' });
  } catch (error) {
    console.error('Error emptying trash:', error);
    res.status(500).json({ error: { message: 'Failed to empty trash' } });
  }
});

export default router;
