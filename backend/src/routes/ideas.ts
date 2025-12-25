import { Router, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all ideas for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const ideas = await db
      .collection('ideas')
      .find({ user_id: userId, deleted_at: { $exists: false } })
      .sort({ created_at: -1 })
      .toArray();
    
    res.json(ideas.map(i => ({
      id: i._id.toString(),
      title: i.title,
      color: i.color,
      folderId: i.folder_id,
      tags: i.tags,
      position: i.position,
      notes: (i.notes || []).map((n: any) => ({
        id: n._id,
        type: n.type,
        content: n.content,
        createdAt: n.created_at,
        order: n.order
      })),
      createdAt: i.created_at,
      updatedAt: i.updated_at
    })));
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: { message: 'Failed to fetch ideas' } });
  }
});

// Create a new idea
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, color, folderId, tags, position, notes, user_id } = req.body;
    const db = getDatabase();
    
    const result = await db.collection('ideas').insertOne({
      user_id: user_id || 'default-user',
      folder_id: folderId || null,
      title,
      color: color || null,
      tags: tags || [],
      position: position || null,
      notes: (notes || []).map((n: any, idx: number) => ({
        _id: new ObjectId().toString(),
        type: n.type || 'text',
        content: n.content,
        created_at: new Date(),
        order: n.order !== undefined ? n.order : idx
      })),
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({
      id: result.insertedId.toString(),
      title,
      color,
      folderId,
      tags,
      position,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: { message: 'Failed to create idea' } });
  }
});

// Update an idea
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, color, folderId, tags, position, notes } = req.body;
    const db = getDatabase();
    
    const updateDoc: any = { updated_at: new Date() };
    if (title !== undefined) updateDoc.title = title;
    if (color !== undefined) updateDoc.color = color;
    if (folderId !== undefined) updateDoc.folder_id = folderId;
    if (tags !== undefined) updateDoc.tags = tags;
    if (position !== undefined) updateDoc.position = position;
    if (notes !== undefined) {
      updateDoc.notes = notes.map((n: any, idx: number) => ({
        _id: n.id || new ObjectId().toString(),
        type: n.type,
        content: n.content,
        created_at: new Date(),
        order: n.order !== undefined ? n.order : idx
      }));
    }

    const result = await db.collection('ideas').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: { message: 'Idea not found' } });
    }

    res.json({
      id: result._id.toString(),
      title: result.title,
      color: result.color,
      folderId: result.folder_id,
      tags: result.tags,
      position: result.position,
      notes: result.notes,
      createdAt: result.created_at,
      updatedAt: result.updated_at
    });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: { message: 'Failed to update idea' } });
  }
});

// Delete an idea (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const result = await db.collection('ideas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted_at: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: { message: 'Idea not found' } });
    }

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: { message: 'Failed to delete idea' } });
  }
});

export default router;
