import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all idea folders for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const folders = await db
      .collection('idea_folders')
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();
    
    res.json(folders.map(f => ({
      id: f._id.toString(),
      name: f.name,
      color: f.color,
      createdAt: f.created_at
    })));
  } catch (error) {
    console.error('Error fetching idea folders:', error);
    res.status(500).json({ error: { message: 'Failed to fetch idea folders' } });
  }
});

// Create a new idea folder
router.post('/', async (req, res) => {
  try {
    const { name, color, user_id } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('idea_folders').insertOne({
      user_id: user_id || 'default-user',
      name,
      color: color || null,
      created_at: new Date()
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      name,
      color,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error creating idea folder:', error);
    res.status(500).json({ error: { message: 'Failed to create idea folder' } });
  }
});

// Update an idea folder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const db = getDatabase();
    
    const updateDoc: any = {};
    if (name !== undefined) updateDoc.name = name;
    if (color !== undefined) updateDoc.color = color;

    const result = await db.collection('idea_folders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: { message: 'Idea folder not found' } });
    }

    res.json({
      id: result._id.toString(),
      name: result.name,
      color: result.color,
      createdAt: result.created_at
    });
  } catch (error) {
    console.error('Error updating idea folder:', error);
    res.status(500).json({ error: { message: 'Failed to update idea folder' } });
  }
});

// Delete an idea folder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('idea_folders').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: { message: 'Idea folder not found' } });
    }

    res.json({ message: 'Idea folder deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea folder:', error);
    res.status(500).json({ error: { message: 'Failed to delete idea folder' } });
  }
});

export default router;
