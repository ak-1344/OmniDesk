// Core data types for OmniDesk

export interface Domain {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export type TaskState = 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed';
export type SubtaskState = 'todo' | 'in-progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  description?: string;
  state: SubtaskState;
  deadline?: string;
  scheduledTime?: {
    date: string;
    startTime: string;
    duration: number; // in minutes
  };
  proof?: string; // URL or file path
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  domainId: string;
  state: TaskState;
  deadline?: string;
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // For trash
  notes?: string;
  proof?: string[];
}

export interface Idea {
  id: string;
  title?: string; // Optional - can be just text
  text: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // For trash
  tags?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'task-deadline' | 'subtask-scheduled' | 'personal-event';
  relatedTaskId?: string;
  relatedSubtaskId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  defaultView: 'dashboard' | 'tasks' | 'calendar';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  weekStartsOn: 'sunday' | 'monday';
  notifications: {
    email: boolean;
    desktop: boolean;
    taskReminders: boolean;
  };
  trashRetentionDays: number;
}

export interface AppState {
  domains: Domain[];
  tasks: Task[];
  ideas: Idea[];
  events: CalendarEvent[];
  settings: AppSettings;
  customTaskStates?: TaskState[];
  customSubtaskStates?: SubtaskState[];
}

export interface TrashItem {
  id: string;
  type: 'task' | 'idea' | 'subtask';
  item: Task | Idea | Subtask;
  deletedAt: string;
  deletedBy: string;
}
