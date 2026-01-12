"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  Task,
  Idea,
  Domain,
  CalendarEvent,
  AppSettings,
  Subtask,
  TaskState,
  TrashItem,
  IdeaFolder
} from '@/types';
import { getStorage } from '@/lib/storage.factory';
import { getSyncStatus, onSyncStatusChange, type SyncStatus } from '@/lib/sync';
import type { IDataStorage } from '@/lib/storage.interface';

// Default settings
const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultView: 'dashboard',
  dateFormat: 'YYYY-MM-DD',
  weekStartsOn: 'monday',
  notifications: {
    email: true,
    desktop: true,
    taskReminders: true,
  },
  trashRetentionDays: 30,
  user: {
    name: 'User',
    email: '',
  },
  kanbanColumns: [
    { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
    { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
    { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
    { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
  ],
  domainOrder: [],
};

// Initial state
const initialState: AppState = {
  domains: [],
  tasks: [],
  ideas: [],
  ideaFolders: [],
  events: [],
  settings: defaultSettings,
};

interface AppContextType {
  state: AppState;
  loading: boolean;
  syncStatus: SyncStatus;

  // Domain operations
  addDomain: (domain: Omit<Domain, 'id'>) => Promise<void>;
  updateDomain: (id: string, updates: Partial<Domain>) => Promise<void>;
  deleteDomain: (id: string) => Promise<void>;

  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;

  // Subtask operations
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => Promise<void>;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Idea operations
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  convertIdeaToTask: (ideaId: string, domainId: string, state: TaskState) => Promise<void>;

  // Idea folder operations
  addIdeaFolder: (folder: Omit<IdeaFolder, 'id'>) => Promise<void>;
  updateIdeaFolder: (id: string, updates: Partial<IdeaFolder>) => Promise<void>;
  deleteIdeaFolder: (id: string) => Promise<void>;

  // Event operations
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Settings operations
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // Trash operations
  trash: TrashItem[];
  restoreFromTrash: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ 
    isOnline: false, 
    pendingChanges: 0, 
    isSyncing: false 
  });
  const [storage, setStorage] = useState<IDataStorage | null>(null);

  // Initialize storage and load data
  useEffect(() => {
    const initStorage = async () => {
      try {
        const storageInstance = await getStorage();
        setStorage(storageInstance);

        // Load all data
        const [
          domains,
          tasks,
          ideas,
          ideaFolders,
          events,
          settings,
          trashItems,
        ] = await Promise.all([
          storageInstance.getDomains(),
          storageInstance.getTasks(),
          storageInstance.getIdeas(),
          storageInstance.getIdeaFolders(),
          storageInstance.getCalendarEvents(),
          storageInstance.getSettings(),
          storageInstance.getTrash(),
        ]);

        setState({
          domains,
          tasks,
          ideas,
          ideaFolders,
          events,sync status changes
        const unsubscribeSync = onSyncStatusChange((status) => {
          setSyncStatus(status);
        });
        
        // Get initial sync status
        const initialStatus = getSyncStatus();
        setSyncStatus(initialStatus);

        // Subscribe to 
          settings,
        });
        setTrash(trashItems);

        // Subscribe to real-time updates if available
        if (storageInstance.subscribeToTasks) {
          storageInstance.subscribeToTasks((updatedTasks) => {
            setState(prev => ({ ...prev, tasks: updatedTasks }));
          });
        }

        if (storageInstance.subscribeToIdeas) {
          storageInstance.subscribeToIdeas((updatedIdeas) => {
            setState(prev => ({ ...prev, ideas: updatedIdeas }));
          });
        }

        if (storageInstance.subscribeToEvents) {
          storageInstance.subscribeToEvents((updatedEvents) => {
            setState(prev => ({ ...prev, events: updatedEvents }));
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        setLoading(false);
      }
    };

    initStorage();
  }, []);

  // Helper to refresh data after mutations
  const refreshDomains = async () => {
    if (storage) {
      const domains = await storage.getDomains();
      setState(prev => ({ ...prev, domains }));
    }
  };

  const refreshTasks = async () => {
    if (storage) {
      const tasks = await storage.getTasks();
      setState(prev => ({ ...prev, tasks }));
    }
  };

  const refreshIdeas = async () => {
    if (storage) {
      const ideas = await storage.getIdeas();
      setState(prev => ({ ...prev, ideas }));
    }
  };

  const refreshIdeaFolders = async () => {
    if (storage) {
      const ideaFolders = await storage.getIdeaFolders();
      setState(prev => ({ ...prev, ideaFolders }));
    }
  };

  const refreshEvents = async () => {
    if (storage) {
      const events = await storage.getCalendarEvents();
      setState(prev => ({ ...prev, events }));
    }
  };

  const refreshSettings = async () => {
    if (storage) {
      const settings = await storage.getSettings();
      setState(prev => ({ ...prev, settings }));
    }
  };

  const refreshTrash = async () => {
    if (storage) {
      const trashItems = await storage.getTrash();
      setTrash(trashItems);
    }
  };

  // Domain operations
  const addDomain = async (domain: Omit<Domain, 'id'>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.addDomain(domain);
    await refreshDomains();
  };

  const updateDomain = async (id: string, updates: Partial<Domain>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateDomain(id, updates);
    await refreshDomains();
  };

  const deleteDomain = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteDomain(id);
    await refreshDomains();
  };

  // Task operations
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    if (!storage) throw new Error('Storage not initialized');
    const newTask = await storage.addTask(task);
    await refreshTasks();
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateTask(id, updates);
    await refreshTasks();
  };

  const deleteTask = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteTask(id);
    await refreshTasks();
    await refreshTrash();
  };

  const getTask = (id: string) => {
    return state.tasks.find(t => t.id === id);
  };

  // Subtask operations
  const addSubtask = async (taskId: string, subtask: Omit<Subtask, 'id'>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.addSubtask(taskId, subtask);
    await refreshTasks();
  };

  const updateSubtask = async (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateSubtask(taskId, subtaskId, updates);
    await refreshTasks();
  };

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteSubtask(taskId, subtaskId);
    await refreshTasks();
  };

  // Idea operations
  const addIdea = async (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.addIdea(idea);
    await refreshIdeas();
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateIdea(id, updates);
    await refreshIdeas();
  };

  const deleteIdea = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteIdea(id);
    await refreshIdeas();
    await refreshTrash();
  };

  const convertIdeaToTask = async (ideaId: string, domainId: string, state: TaskState) => {
    const idea = await storage?.getIdea(ideaId);
    if (!idea || !storage) return;

    const textContent = idea.notes.find(n => n.type === 'text')?.content || '';

    // Create task with idea lineage
    const newTask = await addTask({
      title: idea.title || textContent.substring(0, 50),
      description: textContent,
      domainId,
      state,
      ideaId, // Link task back to idea
    });

    // Update idea with task reference (bidirectional linking)
    if (newTask && newTask.id) {
      const convertedTasks = idea.convertedToTasks || [];
      await storage.updateIdea(ideaId, {
        convertedToTasks: [...convertedTasks, newTask.id]
      });
      await refreshIdeas();
    }
  };

  // Idea folder operations
  const addIdeaFolder = async (folder: Omit<IdeaFolder, 'id'>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.addIdeaFolder(folder);
    await refreshIdeaFolders();
  };

  const updateIdeaFolder = async (id: string, updates: Partial<IdeaFolder>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateIdeaFolder(id, updates);
    await refreshIdeaFolders();
  };

  const deleteIdeaFolder = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteIdeaFolder(id);
    await refreshIdeaFolders();
  };

  // Event operations
  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.addCalendarEvent(event);
    await refreshEvents();
  };

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateCalendarEvent(id, updates);
    await refreshEvents();
  };

  const deleteEvent = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.deleteCalendarEvent(id);
    await refreshEvents();
  };

  // Settings operations
  const updateSettingsHandler = async (updates: Partial<AppSettings>) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.updateSettings(updates);
    await refreshSettings();
  };

  // Trash operations
  const restoreFromTrash = async (id: string) => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.restoreFromTrash(id);
    await refreshTasks();
    await refreshIdeas();
    await refreshTrash();
  };

  const permanentlyDelete = async (id: string) => {
    syncStatus,
    if (!storage) throw new Error('Storage not initialized');
    await storage.permanentlyDelete(id);
    await refreshTrash();
  };

  const emptyTrash = async () => {
    if (!storage) throw new Error('Storage not initialized');
    await storage.emptyTrash();
    await refreshTrash();
  };

  const value: AppContextType = {
    state,
    loading,
    addDomain,
    updateDomain,
    deleteDomain,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addIdea,
    updateIdea,
    deleteIdea,
    convertIdeaToTask,
    addIdeaFolder,
    updateIdeaFolder,
    deleteIdeaFolder,
    addEvent,
    updateEvent,
    deleteEvent,
    updateSettings: updateSettingsHandler,
    trash,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading OmniDesk...</div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
