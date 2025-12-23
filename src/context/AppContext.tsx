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
  TrashItem
} from '../types';

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
};

// Default domains
const defaultDomains: Domain[] = [
  { id: '1', name: 'College', color: '#667eea', description: 'Academic work and studies' },
  { id: '2', name: 'Personal', color: '#48bb78', description: 'Personal projects and growth' },
  { id: '3', name: 'Work', color: '#ed8936', description: 'Professional work' },
  { id: '4', name: 'Health', color: '#f56565', description: 'Health and fitness' },
];

// Initial state
const initialState: AppState = {
  domains: defaultDomains,
  tasks: [],
  ideas: [],
  events: [],
  settings: defaultSettings,
};

interface AppContextType {
  state: AppState;
  
  // Domain operations
  addDomain: (domain: Omit<Domain, 'id'>) => void;
  updateDomain: (id: string, updates: Partial<Domain>) => void;
  deleteDomain: (id: string) => void;
  
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  
  // Subtask operations
  addSubtask: (taskId: string, subtask: Omit<Subtask, 'id'>) => void;
  updateSubtask: (taskId: string, subtaskId: string, updates: Partial<Subtask>) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  
  // Idea operations
  addIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToTask: (ideaId: string, domainId: string, state: TaskState) => void;
  
  // Event operations
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Settings operations
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Trash operations
  trash: TrashItem[];
  restoreFromTrash: (id: string) => void;
  permanentlyDelete: (id: string) => void;
  emptyTrash: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('omniDesk_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        return initialState;
      }
    }
    return initialState;
  });

  const [trash, setTrash] = useState<TrashItem[]>(() => {
    const saved = localStorage.getItem('omniDesk_trash');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved trash:', e);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('omniDesk_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('omniDesk_trash', JSON.stringify(trash));
  }, [trash]);

  // Helper to generate IDs
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // Domain operations
  const addDomain = (domain: Omit<Domain, 'id'>) => {
    const newDomain: Domain = { ...domain, id: generateId() };
    setState(prev => ({ ...prev, domains: [...prev.domains, newDomain] }));
  };

  const updateDomain = (id: string, updates: Partial<Domain>) => {
    setState(prev => ({
      ...prev,
      domains: prev.domains.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const deleteDomain = (id: string) => {
    setState(prev => ({
      ...prev,
      domains: prev.domains.filter(d => d.id !== id)
    }));
  };

  // Task operations
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: generateId(),
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() } 
          : t
      )
    }));
  };

  const deleteTask = (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      const trashItem: TrashItem = {
        id: generateId(),
        type: 'task',
        item: task,
        deletedAt: new Date().toISOString(),
        deletedBy: 'You',
      };
      setTrash(prev => [...prev, trashItem]);
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
      }));
    }
  };

  const getTask = (id: string) => {
    return state.tasks.find(t => t.id === id);
  };

  // Subtask operations
  const addSubtask = (taskId: string, subtask: Omit<Subtask, 'id'>) => {
    const newSubtask: Subtask = { ...subtask, id: generateId() };
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, newSubtask], updatedAt: new Date().toISOString() }
          : t
      )
    }));
  };

  const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, ...updates } : s),
              updatedAt: new Date().toISOString()
            }
          : t
      )
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.filter(s => s.id !== subtaskId),
              updatedAt: new Date().toISOString()
            }
          : t
      )
    }));
  };

  // Idea operations
  const addIdea = (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      ...idea,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setState(prev => ({ ...prev, ideas: [...prev.ideas, newIdea] }));
  };

  const updateIdea = (id: string, updates: Partial<Idea>) => {
    setState(prev => ({
      ...prev,
      ideas: prev.ideas.map(i =>
        i.id === id
          ? { ...i, ...updates, updatedAt: new Date().toISOString() }
          : i
      )
    }));
  };

  const deleteIdea = (id: string) => {
    const idea = state.ideas.find(i => i.id === id);
    if (idea) {
      const trashItem: TrashItem = {
        id: generateId(),
        type: 'idea',
        item: idea,
        deletedAt: new Date().toISOString(),
        deletedBy: 'You',
      };
      setTrash(prev => [...prev, trashItem]);
      setState(prev => ({
        ...prev,
        ideas: prev.ideas.filter(i => i.id !== id)
      }));
    }
  };

  const convertIdeaToTask = (ideaId: string, domainId: string, state: TaskState) => {
    const idea = getIdea(ideaId);
    if (idea) {
      addTask({
        title: idea.title || idea.text.substring(0, 50),
        description: idea.text,
        domainId,
        state,
      });
    }
  };

  const getIdea = (id: string) => {
    return state.ideas.find(i => i.id === id);
  };

  // Event operations
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: generateId() };
    setState(prev => ({ ...prev, events: [...prev.events, newEvent] }));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEvent = (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // Settings operations
  const updateSettings = (updates: Partial<AppSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  // Trash operations
  const restoreFromTrash = (id: string) => {
    const item = trash.find(t => t.id === id);
    if (!item) return;

    if (item.type === 'task') {
      setState(prev => ({ ...prev, tasks: [...prev.tasks, item.item as Task] }));
    } else if (item.type === 'idea') {
      setState(prev => ({ ...prev, ideas: [...prev.ideas, item.item as Idea] }));
    }

    setTrash(prev => prev.filter(t => t.id !== id));
  };

  const permanentlyDelete = (id: string) => {
    setTrash(prev => prev.filter(t => t.id !== id));
  };

  const emptyTrash = () => {
    setTrash([]);
  };

  const value: AppContextType = {
    state,
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
    addEvent,
    updateEvent,
    deleteEvent,
    updateSettings,
    trash,
    restoreFromTrash,
    permanentlyDelete,
    emptyTrash,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
