import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Storage backend type
export type StorageBackend = 'localstorage' | 'supabase';

// Get configured storage backend
export const getStorageBackend = (): StorageBackend => {
  const backend = import.meta.env.VITE_STORAGE_BACKEND as StorageBackend;
  
  // If backend is set to supabase but not configured, fall back to localstorage
  if (backend === 'supabase' && !isSupabaseConfigured()) {
    console.warn('Supabase not configured. Falling back to LocalStorage.');
    return 'localstorage';
  }
  
  return backend || 'localstorage';
};
