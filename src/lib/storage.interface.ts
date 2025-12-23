// Data storage interface abstraction
// This allows switching between LocalStorage and Supabase backends

import type {
  Domain,
  Task,
  Subtask,
  Idea,
  IdeaFolder,
  CalendarEvent,
  AppSettings,
  TrashItem,
  NoteContent,
} from '../types';

export interface IDataStorage {
  // Initialize storage
  initialize(): Promise<void>;
  
  // Domain operations
  getDomains(): Promise<Domain[]>;
  addDomain(domain: Omit<Domain, 'id'>): Promise<Domain>;
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain>;
  deleteDomain(id: string): Promise<void>;
  
  // Task operations
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  
  // Subtask operations
  getSubtasks(taskId: string): Promise<Subtask[]>;
  addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask>;
  updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask>;
  deleteSubtask(taskId: string, subtaskId: string): Promise<void>;
  
  // Idea operations
  getIdeas(): Promise<Idea[]>;
  getIdea(id: string): Promise<Idea | null>;
  addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea>;
  updateIdea(id: string, updates: Partial<Idea>): Promise<Idea>;
  deleteIdea(id: string): Promise<void>;
  
  // Idea folder operations
  getIdeaFolders(): Promise<IdeaFolder[]>;
  addIdeaFolder(folder: Omit<IdeaFolder, 'id'>): Promise<IdeaFolder>;
  updateIdeaFolder(id: string, updates: Partial<IdeaFolder>): Promise<IdeaFolder>;
  deleteIdeaFolder(id: string): Promise<void>;
  
  // Calendar event operations
  getCalendarEvents(): Promise<CalendarEvent[]>;
  addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;
  
  // Settings operations
  getSettings(): Promise<AppSettings>;
  updateSettings(updates: Partial<AppSettings>): Promise<AppSettings>;
  
  // Trash operations
  getTrash(): Promise<TrashItem[]>;
  addToTrash(item: Omit<TrashItem, 'id'>): Promise<TrashItem>;
  restoreFromTrash(id: string): Promise<void>;
  permanentlyDelete(id: string): Promise<void>;
  emptyTrash(): Promise<void>;
  
  // Real-time subscriptions (only for Supabase)
  subscribeToTasks?(callback: (tasks: Task[]) => void): () => void;
  subscribeToIdeas?(callback: (ideas: Idea[]) => void): () => void;
  subscribeToEvents?(callback: (events: CalendarEvent[]) => void): () => void;
}
