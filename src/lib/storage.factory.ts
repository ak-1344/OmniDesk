// Storage factory to get the appropriate storage adapter
import { LocalStorageAdapter } from './storage.localstorage';
import { MongoDBAdapter } from './storage.mongodb';
import type { IDataStorage } from './storage.interface';

// Storage backend type
export type StorageBackend = 'localstorage' | 'mongodb';

// Get configured storage backend
export const getStorageBackend = (): StorageBackend => {
  const backend = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_STORAGE_BACKEND : undefined) || (import.meta as any).env?.VITE_STORAGE_BACKEND;
  return (backend as StorageBackend) || 'localstorage';
};

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
      console.log('Using MongoDB API storage backend');
    } catch (error) {
      console.error('Failed to initialize MongoDB API, falling back to LocalStorage:', error);
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
