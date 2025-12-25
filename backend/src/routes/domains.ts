import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database';

const router = Router();

// Get all domains for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.user_id as string || 'default-user';
    const db = getDatabase();
    
    const domains = await db
      .collection('domains')
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();
    
    res.json(domains.map(d => ({
      id: d._id.toString(),
      name: d.name,
      color: d.color,
      description: d.description,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    })));
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({ error: { message: 'Failed to fetch domains' } });
  }
});

// Create a new domain
router.post('/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
    body('user_id').notEmpty().withMessage('User ID is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, color, description, user_id } = req.body;
      const db = getDatabase();
      
      const result = await db.collection('domains').insertOne({
        user_id,
        name,
        color,
        description: description || null,
        created_at: new Date(),
        updated_at: new Date()
      });

      res.status(201).json({
        id: result.insertedId.toString(),
        name,
        color,
        description,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error creating domain:', error);
      res.status(500).json({ error: { message: 'Failed to create domain' } });
    }
  }
);

// Update a domain
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid domain ID'),
    body('name').optional().notEmpty().trim(),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, color, description } = req.body;
      const db = getDatabase();
      
      const updateDoc: any = { updated_at: new Date() };
      if (name !== undefined) updateDoc.name = name;
      if (color !== undefined) updateDoc.color = color;
      if (description !== undefined) updateDoc.description = description;

      const result = await db.collection('domains').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: 'after' }
      );

      if (!result) {
        return res.status(404).json({ error: { message: 'Domain not found' } });
      }

      res.json({
        id: result._id.toString(),
        name: result.name,
        color: result.color,
        description: result.description,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      });
    } catch (error) {
      console.error('Error updating domain:', error);
      res.status(500).json({ error: { message: 'Failed to update domain' } });
    }
  }
);

// Delete a domain
router.delete('/:id',
  [param('id').isMongoId().withMessage('Invalid domain ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const db = getDatabase();
      
      const result = await db.collection('domains').deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: { message: 'Domain not found' } });
      }

      res.json({ message: 'Domain deleted successfully' });
    } catch (error) {
      console.error('Error deleting domain:', error);
      res.status(500).json({ error: { message: 'Failed to delete domain' } });
    }
  }
);

export default router;
