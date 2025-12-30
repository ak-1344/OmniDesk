// Storage factory to get the appropriate storage adapter
import { LocalStorageAdapter } from './storage.localstorage';
import { MongoDBAdapter } from './storage.mongodb';
import { getSyncStorage } from './sync';
import type { IDataStorage } from './storage.interface';

// Storage backend type
export type StorageBackend = 'localstorage' | 'mongodb' | 'sync';

// Get configured storage backend
export const getStorageBackend = (): StorageBackend => {
  // Next.js uses NEXT_PUBLIC_ prefix for client-side env vars
  const backend = process.env.NEXT_PUBLIC_STORAGE_BACKEND as StorageBackend;
  // Default to sync mode (localStorage with MongoDB sync when available)
  return backend || 'sync';
};

let storageInstance: IDataStorage | null = null;

export async function getStorage(): Promise<IDataStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const backend = getStorageBackend();

  if (backend === 'sync') {
    // Use sync storage (localStorage primary, MongoDB sync when available)
    storageInstance = await getSyncStorage();
    console.log('Using Sync storage (localStorage + MongoDB sync)');
  } else if (backend === 'mongodb') {
    const adapter = new MongoDBAdapter();
    try {
      await adapter.initialize();
      storageInstance = adapter;
      console.log('Using MongoDB API storage backend');
    } catch (error) {
      console.error('Failed to initialize MongoDB API, falling back to LocalStorage:', error);
      storageInstance = new LocalStorageAdapter();
      console.log('Using LocalStorage backend (fallback)');
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
