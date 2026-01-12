// MongoDB API implementation of data storage using backend API
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
} from '@/types';

const API_URL = (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined) || process.env?.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class MongoDBAdapter implements IDataStorage {
  private userId: string = 'default-user';
  private eventSource: EventSource | null = null;
  private reconnectTimer: number | null = null;
  private taskSubscribers: Array<(tasks: Task[]) => void> = [];
  private ideaSubscribers: Array<(ideas: Idea[]) => void> = [];
  private eventSubscribers: Array<(events: CalendarEvent[]) => void> = [];

  async initialize(): Promise<void> {
    // In a real implementation, you would get the user ID from authentication
    // For now, we'll use a default user ID
    this.userId = 'default-user';

    if (typeof window !== 'undefined') {
      this.startRealtimeStream();
    }
  }

  private async fetchAPI(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
      throw new Error(error.error?.message || 'Request failed');
    }

    return response.json();
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    return this.fetchAPI(`/domains?user_id=${this.userId}`);
  }

  async addDomain(domain: Omit<Domain, 'id'>): Promise<Domain> {
    return this.fetchAPI('/domains', {
      method: 'POST',
      body: JSON.stringify({ ...domain, user_id: this.userId }),
    });
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    return this.fetchAPI(`/domains/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDomain(id: string): Promise<void> {
    await this.fetchAPI(`/domains/${id}`, { method: 'DELETE' });
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    return this.fetchAPI(`/tasks?user_id=${this.userId}`);
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      return await this.fetchAPI(`/tasks/${id}`);
    } catch {
      return null;
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): Promise<Task> {
    return this.fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...task, user_id: this.userId }),
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return this.fetchAPI(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.fetchAPI(`/tasks/${id}`, { method: 'DELETE' });
  }

  // Subtask operations
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const task = await this.getTask(taskId);
    return task?.subtasks || [];
  }

  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
    return this.fetchAPI(`/subtasks/${taskId}`, {
      method: 'POST',
      body: JSON.stringify(subtask),
    });
  }

  async updateSubtask(_taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    // Find which task contains this subtask
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.subtasks.some(s => s.id === subtaskId));

    if (!task) throw new Error('Subtask not found');

    await this.fetchAPI(`/subtasks/${task.id}/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    const updatedTask = await this.getTask(task.id);
    const updatedSubtask = updatedTask?.subtasks.find(s => s.id === subtaskId);

    if (!updatedSubtask) throw new Error('Subtask not found after update');
    return updatedSubtask;
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    await this.fetchAPI(`/subtasks/${taskId}/${subtaskId}`, { method: 'DELETE' });
  }

  // Idea operations
  async getIdeas(): Promise<Idea[]> {
    return this.fetchAPI(`/ideas?user_id=${this.userId}`);
  }

  async getIdea(id: string): Promise<Idea | null> {
    try {
      const ideas = await this.getIdeas();
      return ideas.find(i => i.id === id) || null;
    } catch {
      return null;
    }
  }

  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    return this.fetchAPI('/ideas', {
      method: 'POST',
      body: JSON.stringify({ ...idea, user_id: this.userId }),
    });
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    return this.fetchAPI(`/ideas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIdea(id: string): Promise<void> {
    await this.fetchAPI(`/ideas/${id}`, { method: 'DELETE' });
  }

  // Idea folder operations
  async getIdeaFolders(): Promise<IdeaFolder[]> {
    return this.fetchAPI(`/idea-folders?user_id=${this.userId}`);
  }

  async addIdeaFolder(folder: Omit<IdeaFolder, 'id'>): Promise<IdeaFolder> {
    return this.fetchAPI('/idea-folders', {
      method: 'POST',
      body: JSON.stringify({ ...folder, user_id: this.userId }),
    });
  }

  async updateIdeaFolder(id: string, updates: Partial<IdeaFolder>): Promise<IdeaFolder> {
    return this.fetchAPI(`/idea-folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIdeaFolder(id: string): Promise<void> {
    await this.fetchAPI(`/idea-folders/${id}`, { method: 'DELETE' });
  }

  // Calendar event operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    return this.fetchAPI(`/calendar-events?user_id=${this.userId}`);
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    return this.fetchAPI('/calendar-events', {
      method: 'POST',
      body: JSON.stringify({ ...event, user_id: this.userId }),
    });
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return this.fetchAPI(`/calendar-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await this.fetchAPI(`/calendar-events/${id}`, { method: 'DELETE' });
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    return this.fetchAPI(`/settings?user_id=${this.userId}`);
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    return this.fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify({ ...updates, user_id: this.userId }),
    });
  }

  // Trash operations
  async getTrash(): Promise<TrashItem[]> {
    return this.fetchAPI(`/trash?user_id=${this.userId}`);
  }

  async addToTrash(): Promise<TrashItem> {
    throw new Error('Use deleteTask() or deleteIdea() instead');
  }

  async restoreFromTrash(id: string): Promise<void> {
    await this.fetchAPI(`/trash/${id}/restore`, { method: 'POST' });
  }

  async permanentlyDelete(id: string): Promise<void> {
    await this.fetchAPI(`/trash/${id}`, { method: 'DELETE' });
  }

  async emptyTrash(): Promise<void> {
    await this.fetchAPI(`/trash?user_id=${this.userId}`, { method: 'DELETE' });
  }

  // Real-time subscriptions backed by server-sent events
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    this.taskSubscribers.push(callback);
    this.startRealtimeStream();
    this.notifyTasks();

    return () => {
      this.taskSubscribers = this.taskSubscribers.filter(cb => cb !== callback);
      this.teardownRealtimeStreamIfIdle();
    };
  }

  subscribeToIdeas(callback: (ideas: Idea[]) => void): () => void {
    this.ideaSubscribers.push(callback);
    this.startRealtimeStream();
    this.notifyIdeas();

    return () => {
      this.ideaSubscribers = this.ideaSubscribers.filter(cb => cb !== callback);
      this.teardownRealtimeStreamIfIdle();
    };
  }

  subscribeToEvents(callback: (events: CalendarEvent[]) => void): () => void {
    this.eventSubscribers.push(callback);
    this.startRealtimeStream();
    this.notifyEvents();

    return () => {
      this.eventSubscribers = this.eventSubscribers.filter(cb => cb !== callback);
      this.teardownRealtimeStreamIfIdle();
    };
  }

  private startRealtimeStream() {
    if (typeof window === 'undefined') return;
    if (this.eventSource || (!this.taskSubscribers.length && !this.ideaSubscribers.length && !this.eventSubscribers.length)) {
      return;
    }

    const streamUrl = `${API_URL}/realtime?user_id=${encodeURIComponent(this.userId)}`;
    this.eventSource = new EventSource(streamUrl, { withCredentials: true });

    this.eventSource.onmessage = (event: MessageEvent) => {
      this.handleRealtimeMessage(event.data);
    };

    this.eventSource.onerror = () => {
      this.eventSource?.close();
      this.eventSource = null;

      if (this.reconnectTimer === null) {
        this.reconnectTimer = window.setTimeout(() => {
          this.reconnectTimer = null;
          this.startRealtimeStream();
        }, 5000);
      }
    };
  }

  private teardownRealtimeStreamIfIdle() {
    if (!this.taskSubscribers.length && !this.ideaSubscribers.length && !this.eventSubscribers.length) {
      this.eventSource?.close();
      this.eventSource = null;
      if (this.reconnectTimer !== null) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }
  }

  private async handleRealtimeMessage(rawData: string) {
    try {
      const payload = JSON.parse(rawData) as { entity?: string };

      switch (payload.entity) {
        case 'task':
          await this.notifyTasks();
          break;
        case 'idea':
          await this.notifyIdeas();
          break;
        case 'event':
          await this.notifyEvents();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to handle realtime message:', error);
    }
  }

  private async notifyTasks() {
    if (!this.taskSubscribers.length) return;
    const tasks = await this.getTasks();
    this.taskSubscribers.forEach(cb => cb(tasks));
  }

  private async notifyIdeas() {
    if (!this.ideaSubscribers.length) return;
    const ideas = await this.getIdeas();
    this.ideaSubscribers.forEach(cb => cb(ideas));
  }

  private async notifyEvents() {
    if (!this.eventSubscribers.length) return;
    const events = await this.getCalendarEvents();
    this.eventSubscribers.forEach(cb => cb(events));
  }
}
