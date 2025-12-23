// Storage factory to get the appropriate storage adapter
import { getStorageBackend } from './supabase';
import { LocalStorageAdapter } from './storage.localstorage';
import { SupabaseAdapter } from './storage.supabase';
import type { IDataStorage } from './storage.interface';

let storageInstance: IDataStorage | null = null;

export async function getStorage(): Promise<IDataStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  const backend = getStorageBackend();

  if (backend === 'supabase') {
    const adapter = new SupabaseAdapter();
    try {
      await adapter.initialize();
      storageInstance = adapter;
      console.log('Using Supabase storage backend');
    } catch (error) {
      console.error('Failed to initialize Supabase, falling back to LocalStorage:', error);
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
