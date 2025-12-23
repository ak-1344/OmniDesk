// Storage factory to get the appropriate storage adapter
import { getStorageBackend } from './mongodb';
import { LocalStorageAdapter } from './storage.localstorage';
import { MongoDBAdapter } from './storage.mongodb';
import type { IDataStorage } from './storage.interface';

let storageInstance: IDataStorage | null = null;

export async function getStorage(): Promise<IDataStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const backend = getStorageBackend();

  if (backend === 'mongodb') {
    const adapter = new MongoDBAdapter();
    try {
      await adapter.initialize();
      storageInstance = adapter;
      console.log('Using MongoDB storage backend');
    } catch (error) {
      console.error('Failed to initialize MongoDB, falling back to LocalStorage:', error);
      storageInstance = new LocalStorageAdapter();
      console.log('Using LocalStorage backend');
    }
  } else {
    storageInstance = new LocalStorageAdapter();
    console.log('Using LocalStorage backend');
  }

  return storageInstance;
}

export function resetStorage(): void {
  storageInstance = null;
}
