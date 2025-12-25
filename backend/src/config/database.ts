import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'omnidesk';

let client: MongoClient | null = null;
let db: Db | null = null;

export const connectToDatabase = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB_NAME);
    
    console.log(`✓ Connected to MongoDB database: ${MONGODB_DB_NAME}`);
    
    // Create indexes
    await createIndexes(db);
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const getDatabase = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✓ MongoDB connection closed');
  }
};

// Create database indexes for performance
const createIndexes = async (database: Db): Promise<void> => {
  try {
    // Domains indexes
    await database.collection('domains').createIndex({ user_id: 1, name: 1 });
    
    // Tasks indexes
    await database.collection('tasks').createIndex({ user_id: 1, domain_id: 1 });
    await database.collection('tasks').createIndex({ user_id: 1, state: 1 });
    await database.collection('tasks').createIndex({ user_id: 1, deleted_at: 1 });
    await database.collection('tasks').createIndex({ deadline: 1 });
    await database.collection('tasks').createIndex({ 'subtasks._id': 1 });
    
    // Ideas indexes
    await database.collection('ideas').createIndex({ user_id: 1, folder_id: 1 });
    await database.collection('ideas').createIndex({ user_id: 1, deleted_at: 1 });
    await database.collection('ideas').createIndex({ tags: 1 });
    
    // Calendar events indexes
    await database.collection('calendar_events').createIndex({ user_id: 1, date: 1 });
    
    // Idea folders indexes
    await database.collection('idea_folders').createIndex({ user_id: 1, name: 1 });
    
    // User settings indexes
    await database.collection('user_settings').createIndex({ user_id: 1 }, { unique: true });
    
    console.log('✓ Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};
