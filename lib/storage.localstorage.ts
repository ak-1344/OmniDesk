// LocalStorage implementation of data storage
import type { IDataStorage } from './storage.interface';
import type {
  Domain,
  Task,
  Subtask,
  Idea,
  IdeaFolder,
  CalendarEvent,
  AppSettings,
  TrashItem,
  AppState,
} from '@/types';

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
  domainOrder: ['1', '2', '3', '4', '5', '6'],
};

// Default domains
const defaultDomains: Domain[] = [
  { id: '1', name: 'College', color: '#667eea', description: 'Academic work, studies, assignments' },
  { id: '2', name: 'Personal', color: '#48bb78', description: 'Personal projects, hobbies, growth' },
  { id: '3', name: 'Work', color: '#ed8936', description: 'Professional work, career' },
  { id: '4', name: 'Health', color: '#f56565', description: 'Fitness, wellness, medical' },
  { id: '5', name: 'Family', color: '#9f7aea', description: 'Family time, relationships' },
  { id: '6', name: 'Finance', color: '#38b2ac', description: 'Budget, savings, investments' },
];

// Initial state
const initialState: AppState = {
  domains: defaultDomains,
  tasks: [],
  ideas: [],
  ideaFolders: [],
  events: [],
  settings: defaultSettings,
};

export class LocalStorageAdapter implements IDataStorage {
  private storageKey = 'omniDesk_state';
  private trashKey = 'omniDesk_trash';
  private state: AppState;
  private trash: TrashItem[];

  constructor() {
    // Load state from localStorage or use initial state
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
        this.state = initialState;
      }
    } else {
      this.state = initialState;
    }

    // Load trash
    const savedTrash = localStorage.getItem(this.trashKey);
    if (savedTrash) {
      try {
        this.trash = JSON.parse(savedTrash);
      } catch (e) {
        console.error('Failed to parse saved trash:', e);
        this.trash = [];
      }
    } else {
      this.trash = [];
    }
  }

  async initialize(): Promise<void> {
    // No initialization needed for LocalStorage
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private saveState(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
  }

  private saveTrash(): void {
    localStorage.setItem(this.trashKey, JSON.stringify(this.trash));
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    return this.state.domains;
  }

  async addDomain(domain: Omit<Domain, 'id'>): Promise<Domain> {
    const newDomain: Domain = { ...domain, id: this.generateId() };
    this.state.domains.push(newDomain);
    this.saveState();
    return newDomain;
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    const domain = this.state.domains.find(d => d.id === id);
    if (!domain) throw new Error('Domain not found');

    Object.assign(domain, updates);
    this.saveState();
    return domain;
  }

  async deleteDomain(id: string): Promise<void> {
    this.state.domains = this.state.domains.filter(d => d.id !== id);
    this.saveState();
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return this.state.tasks.filter(t => !t.deletedAt);
  }

  async getTask(id: string): Promise<Task | null> {
    return this.state.tasks.find(t => t.id === id && !t.deletedAt) || null;
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    this.state.tasks.push(newTask);
    this.saveState();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = this.state.tasks.find(t => t.id === id);
    if (!task) throw new Error('Task not found');

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });
    this.saveState();
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      const trashItem: TrashItem = {
        id: this.generateId(),
        type: 'task',
        item: task,
        deletedAt: new Date().toISOString(),
        deletedBy: 'You',
      };
      this.trash.push(trashItem);
      this.saveTrash();

      this.state.tasks = this.state.tasks.filter(t => t.id !== id);
      this.saveState();
    }
  }

  // Subtask operations
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const task = this.state.tasks.find(t => t.id === taskId);
    return task?.subtasks || [];
  }

  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const newSubtask: Subtask = { ...subtask, id: this.generateId() };
    task.subtasks.push(newSubtask);
    task.updatedAt = new Date().toISOString();
    this.saveState();
    return newSubtask;
  }

  async updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) throw new Error('Subtask not found');

    Object.assign(subtask, updates);
    task.updatedAt = new Date().toISOString();
    this.saveState();
    return subtask;
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
    task.updatedAt = new Date().toISOString();
    this.saveState();
  }

  // Idea operations
  async getIdeas(): Promise<Idea[]> {
    return this.state.ideas.filter(i => !i.deletedAt);
  }

  async getIdea(id: string): Promise<Idea | null> {
    return this.state.ideas.find(i => i.id === id && !i.deletedAt) || null;
  }

  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      ...idea,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
    this.state.ideas.push(newIdea);
    this.saveState();
    return newIdea;
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    const idea = this.state.ideas.find(i => i.id === id);
    if (!idea) throw new Error('Idea not found');

    Object.assign(idea, updates, { updatedAt: new Date().toISOString() });
    this.saveState();
    return idea;
  }

  async deleteIdea(id: string): Promise<void> {
    const idea = this.state.ideas.find(i => i.id === id);
    if (idea) {
      const trashItem: TrashItem = {
        id: this.generateId(),
        type: 'idea',
        item: idea,
        deletedAt: new Date().toISOString(),
        deletedBy: 'You',
      };
      this.trash.push(trashItem);
      this.saveTrash();

      this.state.ideas = this.state.ideas.filter(i => i.id !== id);
      this.saveState();
    }
  }

  // Idea folder operations
  async getIdeaFolders(): Promise<IdeaFolder[]> {
    return this.state.ideaFolders;
  }

  async addIdeaFolder(folder: Omit<IdeaFolder, 'id'>): Promise<IdeaFolder> {
    const newFolder: IdeaFolder = { ...folder, id: this.generateId() };
    this.state.ideaFolders.push(newFolder);
    this.saveState();
    return newFolder;
  }

  async updateIdeaFolder(id: string, updates: Partial<IdeaFolder>): Promise<IdeaFolder> {
    const folder = this.state.ideaFolders.find(f => f.id === id);
    if (!folder) throw new Error('Idea folder not found');

    Object.assign(folder, updates);
    this.saveState();
    return folder;
  }

  async deleteIdeaFolder(id: string): Promise<void> {
    this.state.ideaFolders = this.state.ideaFolders.filter(f => f.id !== id);
    this.saveState();
  }

  // Calendar event operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.state.events;
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const newEvent: CalendarEvent = { ...event, id: this.generateId() };
    this.state.events.push(newEvent);
    this.saveState();
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = this.state.events.find(e => e.id === id);
    if (!event) throw new Error('Calendar event not found');

    Object.assign(event, updates);
    this.saveState();
    return event;
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    this.state.events = this.state.events.filter(e => e.id !== id);
    this.saveState();
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return this.state.settings;
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.state.settings = { ...this.state.settings, ...updates };
    this.saveState();
    return this.state.settings;
  }

  // Trash operations
  async getTrash(): Promise<TrashItem[]> {
    return this.trash;
  }

  async addToTrash(item: Omit<TrashItem, 'id'>): Promise<TrashItem> {
    const trashItem: TrashItem = { ...item, id: this.generateId() };
    this.trash.push(trashItem);
    this.saveTrash();
    return trashItem;
  }

  async restoreFromTrash(id: string): Promise<void> {
    const item = this.trash.find(t => t.id === id);
    if (!item) return;

    if (item.type === 'task') {
      this.state.tasks.push(item.item as Task);
    } else if (item.type === 'idea') {
      this.state.ideas.push(item.item as Idea);
    }

    this.trash = this.trash.filter(t => t.id !== id);
    this.saveState();
    this.saveTrash();
  }

  async permanentlyDelete(id: string): Promise<void> {
    this.trash = this.trash.filter(t => t.id !== id);
    this.saveTrash();
  }

  async emptyTrash(): Promise<void> {
    this.trash = [];
    this.saveTrash();
  }
}
