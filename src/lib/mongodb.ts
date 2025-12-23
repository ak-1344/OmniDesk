import { MongoClient } from 'mongodb';

const mongoUri = import.meta.env.VITE_MONGODB_URI || '';
const dbName = import.meta.env.VITE_MONGODB_DB_NAME || 'omnidesk';

let client: MongoClient | null = null;

// Create MongoDB client
export const getMongoClient = async () => {
  if (!client) {
    if (!mongoUri) {
      throw new Error('MongoDB URI not configured');
    }
    client = new MongoClient(mongoUri);
    await client.connect();
  }
  return client;
};

// Get database instance
export const getDatabase = async () => {
  const mongoClient = await getMongoClient();
  return mongoClient.db(dbName);
};

// Check if MongoDB is configured
export const isMongoDBConfigured = () => {
  return Boolean(mongoUri);
};

// Storage backend type
export type StorageBackend = 'localstorage' | 'mongodb';

// Get configured storage backend
export const getStorageBackend = (): StorageBackend => {
  const backend = import.meta.env.VITE_STORAGE_BACKEND as StorageBackend;
  
  // If backend is set to mongodb but not configured, fall back to localstorage
  if (backend === 'mongodb' && !isMongoDBConfigured()) {
    console.warn('MongoDB not configured. Falling back to LocalStorage.');
    return 'localstorage';
  }
  
  return backend || 'localstorage';
};

// Close MongoDB connection
export const closeMongoConnection = async () => {
  if (client) {
    await client.close();
    client = null;
  }
};
