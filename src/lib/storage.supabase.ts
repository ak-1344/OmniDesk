// Supabase implementation of data storage
import { supabase } from './supabase';
import type { IDataStorage } from './storage.interface';
import type { RealtimeChannel } from '@supabase/supabase-js';
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
  SubtaskState,
} from '../types';

export class SupabaseAdapter implements IDataStorage {
  private userId: string | null = null;
  private channels: RealtimeChannel[] = [];

  async initialize(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    this.userId = user.id;
  }

  private ensureUserId(): string {
    if (!this.userId) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }
    return this.userId;
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;
    
    return data.map(d => ({
      id: d.id,
      name: d.name,
      color: d.color,
      description: d.description || undefined,
    }));
  }

  async addDomain(domain: Omit<Domain, 'id'>): Promise<Domain> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('domains')
      .insert({
        user_id: userId,
        name: domain.name,
        color: domain.color,
        description: domain.description || null,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      description: data.description || undefined,
    };
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    const { data, error } = await supabase
      .from('domains')
      .update({
        name: updates.name,
        color: updates.color,
        description: updates.description || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      color: data.color,
      description: data.description || undefined,
    };
  }

  async deleteDomain(id: string): Promise<void> {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    const userId = this.ensureUserId();
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (tasksError) throw tasksError;

    // Fetch all subtasks for these tasks
    const taskIds = tasksData.map(t => t.id);
    const { data: subtasksData, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*')
      .in('task_id', taskIds);

    if (subtasksError) throw subtasksError;

    // Group subtasks by task_id
    const subtasksByTask = new Map<string, Subtask[]>();
    subtasksData.forEach(s => {
      const subtask: Subtask = {
        id: s.id,
        title: s.title,
        description: s.description || undefined,
        state: s.state as SubtaskState,
        deadline: s.deadline || undefined,
        scheduledTime: s.scheduled_date ? {
          date: s.scheduled_date,
          startTime: s.scheduled_start_time || '',
          duration: s.scheduled_duration || 0,
        } : undefined,
        proof: s.proof || undefined,
        completedAt: s.completed_at || undefined,
      };
      
      const taskSubtasks = subtasksByTask.get(s.task_id) || [];
      taskSubtasks.push(subtask);
      subtasksByTask.set(s.task_id, taskSubtasks);
    });

    return tasksData.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      domainId: t.domain_id,
      state: t.state,
      deadline: t.deadline || undefined,
      subtasks: subtasksByTask.get(t.id) || [],
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      notes: t.notes || undefined,
      proof: t.proof || undefined,
    }));
  }

  async getTask(id: string): Promise<Task | null> {
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (taskError) {
      if (taskError.code === 'PGRST116') return null; // Not found
      throw taskError;
    }

    // Fetch subtasks
    const { data: subtasksData, error: subtasksError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', id);

    if (subtasksError) throw subtasksError;

    const subtasks: Subtask[] = subtasksData.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      state: s.state as SubtaskState,
      deadline: s.deadline || undefined,
      scheduledTime: s.scheduled_date ? {
        date: s.scheduled_date,
        startTime: s.scheduled_start_time || '',
        duration: s.scheduled_duration || 0,
      } : undefined,
      proof: s.proof || undefined,
      completedAt: s.completed_at || undefined,
    }));

    return {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      domainId: taskData.domain_id,
      state: taskData.state,
      deadline: taskData.deadline || undefined,
      subtasks,
      createdAt: taskData.created_at,
      updatedAt: taskData.updated_at,
      notes: taskData.notes || undefined,
      proof: taskData.proof || undefined,
    };
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): Promise<Task> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        domain_id: task.domainId,
        title: task.title,
        description: task.description,
        state: task.state,
        deadline: task.deadline || null,
        notes: task.notes || null,
        proof: task.proof || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      domainId: data.domain_id,
      state: data.state,
      deadline: data.deadline || undefined,
      subtasks: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      notes: data.notes || undefined,
      proof: data.proof || undefined,
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.domainId !== undefined) updateData.domain_id = updates.domainId;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    if (updates.proof !== undefined) updateData.proof = updates.proof || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Fetch subtasks
    const { data: subtasksData } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', id);

    const subtasks: Subtask[] = (subtasksData || []).map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      state: s.state as SubtaskState,
      deadline: s.deadline || undefined,
      scheduledTime: s.scheduled_date ? {
        date: s.scheduled_date,
        startTime: s.scheduled_start_time || '',
        duration: s.scheduled_duration || 0,
      } : undefined,
      proof: s.proof || undefined,
      completedAt: s.completed_at || undefined,
    }));

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      domainId: data.domain_id,
      state: data.state,
      deadline: data.deadline || undefined,
      subtasks,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      notes: data.notes || undefined,
      proof: data.proof || undefined,
    };
  }

  async deleteTask(id: string): Promise<void> {
    // Soft delete
    const { error } = await supabase
      .from('tasks')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Subtask operations
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');

    if (error) throw error;

    return data.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description || undefined,
      state: s.state as SubtaskState,
      deadline: s.deadline || undefined,
      scheduledTime: s.scheduled_date ? {
        date: s.scheduled_date,
        startTime: s.scheduled_start_time || '',
        duration: s.scheduled_duration || 0,
      } : undefined,
      proof: s.proof || undefined,
      completedAt: s.completed_at || undefined,
    }));
  }

  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        title: subtask.title,
        description: subtask.description || null,
        state: subtask.state,
        deadline: subtask.deadline || null,
        scheduled_date: subtask.scheduledTime?.date || null,
        scheduled_start_time: subtask.scheduledTime?.startTime || null,
        scheduled_duration: subtask.scheduledTime?.duration || null,
        proof: subtask.proof || null,
        completed_at: subtask.completedAt || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      state: data.state as SubtaskState,
      deadline: data.deadline || undefined,
      scheduledTime: data.scheduled_date ? {
        date: data.scheduled_date,
        startTime: data.scheduled_start_time || '',
        duration: data.scheduled_duration || 0,
      } : undefined,
      proof: data.proof || undefined,
      completedAt: data.completed_at || undefined,
    };
  }

  async updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.state !== undefined) updateData.state = updates.state;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline || null;
    if (updates.scheduledTime !== undefined) {
      updateData.scheduled_date = updates.scheduledTime?.date || null;
      updateData.scheduled_start_time = updates.scheduledTime?.startTime || null;
      updateData.scheduled_duration = updates.scheduledTime?.duration || null;
    }
    if (updates.proof !== undefined) updateData.proof = updates.proof || null;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt || null;

    const { data, error } = await supabase
      .from('subtasks')
      .update(updateData)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      state: data.state as SubtaskState,
      deadline: data.deadline || undefined,
      scheduledTime: data.scheduled_date ? {
        date: data.scheduled_date,
        startTime: data.scheduled_start_time || '',
        duration: data.scheduled_duration || 0,
      } : undefined,
      proof: data.proof || undefined,
      completedAt: data.completed_at || undefined,
    };
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  }

  // Idea operations
  async getIdeas(): Promise<Idea[]> {
    const userId = this.ensureUserId();
    const { data: ideasData, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (ideasError) throw ideasError;

    // Fetch note contents for all ideas
    const ideaIds = ideasData.map(i => i.id);
    const { data: notesData, error: notesError } = await supabase
      .from('note_contents')
      .select('*')
      .in('idea_id', ideaIds)
      .order('display_order');

    if (notesError) throw notesError;

    // Group notes by idea_id
    const notesByIdea = new Map<string, NoteContent[]>();
    notesData.forEach(n => {
      const note: NoteContent = {
        id: n.id,
        type: n.type,
        content: n.content,
        createdAt: n.created_at,
        order: n.display_order,
      };
      
      const ideaNotes = notesByIdea.get(n.idea_id) || [];
      ideaNotes.push(note);
      notesByIdea.set(n.idea_id, ideaNotes);
    });

    return ideasData.map(i => ({
      id: i.id,
      title: i.title,
      color: i.color || undefined,
      folderId: i.folder_id || undefined,
      notes: notesByIdea.get(i.id) || [],
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      tags: i.tags || undefined,
      position: (i.position_x !== null && i.position_y !== null) ? {
        x: i.position_x,
        y: i.position_y,
      } : undefined,
    }));
  }

  async getIdea(id: string): Promise<Idea | null> {
    const { data: ideaData, error: ideaError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (ideaError) {
      if (ideaError.code === 'PGRST116') return null;
      throw ideaError;
    }

    const { data: notesData, error: notesError } = await supabase
      .from('note_contents')
      .select('*')
      .eq('idea_id', id)
      .order('display_order');

    if (notesError) throw notesError;

    const notes: NoteContent[] = notesData.map(n => ({
      id: n.id,
      type: n.type,
      content: n.content,
      createdAt: n.created_at,
      order: n.display_order,
    }));

    return {
      id: ideaData.id,
      title: ideaData.title,
      color: ideaData.color || undefined,
      folderId: ideaData.folder_id || undefined,
      notes,
      createdAt: ideaData.created_at,
      updatedAt: ideaData.updated_at,
      tags: ideaData.tags || undefined,
      position: (ideaData.position_x !== null && ideaData.position_y !== null) ? {
        x: ideaData.position_x,
        y: ideaData.position_y,
      } : undefined,
    };
  }

  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('ideas')
      .insert({
        user_id: userId,
        folder_id: idea.folderId || null,
        title: idea.title,
        color: idea.color || null,
        tags: idea.tags || null,
        position_x: idea.position?.x || null,
        position_y: idea.position?.y || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert note contents
    if (idea.notes && idea.notes.length > 0) {
      const { error: notesError } = await supabase
        .from('note_contents')
        .insert(
          idea.notes.map(n => ({
            idea_id: data.id,
            type: n.type,
            content: n.content,
            display_order: n.order,
          }))
        );

      if (notesError) throw notesError;
    }

    return {
      id: data.id,
      title: data.title,
      color: data.color || undefined,
      folderId: data.folder_id || undefined,
      notes: idea.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || undefined,
      position: idea.position,
    };
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.color !== undefined) updateData.color = updates.color || null;
    if (updates.folderId !== undefined) updateData.folder_id = updates.folderId || null;
    if (updates.tags !== undefined) updateData.tags = updates.tags || null;
    if (updates.position !== undefined) {
      updateData.position_x = updates.position?.x || null;
      updateData.position_y = updates.position?.y || null;
    }

    const { data, error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If notes are being updated, replace all note contents
    if (updates.notes !== undefined) {
      // Delete existing notes
      await supabase.from('note_contents').delete().eq('idea_id', id);
      
      // Insert new notes
      if (updates.notes.length > 0) {
        await supabase
          .from('note_contents')
          .insert(
            updates.notes.map(n => ({
              idea_id: id,
              type: n.type,
              content: n.content,
              display_order: n.order,
            }))
          );
      }
    }

    // Fetch updated notes
    const { data: notesData } = await supabase
      .from('note_contents')
      .select('*')
      .eq('idea_id', id)
      .order('display_order');

    const notes: NoteContent[] = (notesData || []).map(n => ({
      id: n.id,
      type: n.type,
      content: n.content,
      createdAt: n.created_at,
      order: n.display_order,
    }));

    return {
      id: data.id,
      title: data.title,
      color: data.color || undefined,
      folderId: data.folder_id || undefined,
      notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      tags: data.tags || undefined,
      position: (data.position_x !== null && data.position_y !== null) ? {
        x: data.position_x,
        y: data.position_y,
      } : undefined,
    };
  }

  async deleteIdea(id: string): Promise<void> {
    // Soft delete
    const { error } = await supabase
      .from('ideas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Idea folder operations
  async getIdeaFolders(): Promise<IdeaFolder[]> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('idea_folders')
      .select('*')
      .eq('user_id', userId)
      .order('name');

    if (error) throw error;

    return data.map(f => ({
      id: f.id,
      name: f.name,
      color: f.color || undefined,
      createdAt: f.created_at,
    }));
  }

  async addIdeaFolder(folder: Omit<IdeaFolder, 'id'>): Promise<IdeaFolder> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('idea_folders')
      .insert({
        user_id: userId,
        name: folder.name,
        color: folder.color || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      color: data.color || undefined,
      createdAt: data.created_at,
    };
  }

  async updateIdeaFolder(id: string, updates: Partial<IdeaFolder>): Promise<IdeaFolder> {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color || null;

    const { data, error } = await supabase
      .from('idea_folders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      color: data.color || undefined,
      createdAt: data.created_at,
    };
  }

  async deleteIdeaFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('idea_folders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Calendar event operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date');

    if (error) throw error;

    return data.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description || undefined,
      date: e.event_date,
      startTime: e.start_time || undefined,
      endTime: e.end_time || undefined,
      type: e.type,
      relatedTaskId: e.related_task_id || undefined,
      relatedSubtaskId: e.related_subtask_id || undefined,
    }));
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: userId,
        title: event.title,
        description: event.description || null,
        event_date: event.date,
        start_time: event.startTime || null,
        end_time: event.endTime || null,
        type: event.type,
        related_task_id: event.relatedTaskId || null,
        related_subtask_id: event.relatedSubtaskId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      date: data.event_date,
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      type: data.type,
      relatedTaskId: data.related_task_id || undefined,
      relatedSubtaskId: data.related_subtask_id || undefined,
    };
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.date !== undefined) updateData.event_date = updates.date;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime || null;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime || null;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.relatedTaskId !== undefined) updateData.related_task_id = updates.relatedTaskId || null;
    if (updates.relatedSubtaskId !== undefined) updateData.related_subtask_id = updates.relatedSubtaskId || null;

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      date: data.event_date,
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      type: data.type,
      relatedTaskId: data.related_task_id || undefined,
      relatedSubtaskId: data.related_subtask_id || undefined,
    };
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    const userId = this.ensureUserId();
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If settings don't exist, return defaults
      if (error.code === 'PGRST116') {
        return {
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
      }
      throw error;
    }

    return {
      theme: data.theme,
      defaultView: data.default_view,
      dateFormat: data.date_format,
      weekStartsOn: data.week_starts_on,
      notifications: {
        email: data.notifications_email,
        desktop: data.notifications_desktop,
        taskReminders: data.notifications_task_reminders,
      },
      trashRetentionDays: data.trash_retention_days,
    };
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const userId = this.ensureUserId();
    const updateData: any = {};
    
    if (updates.theme !== undefined) updateData.theme = updates.theme;
    if (updates.defaultView !== undefined) updateData.default_view = updates.defaultView;
    if (updates.dateFormat !== undefined) updateData.date_format = updates.dateFormat;
    if (updates.weekStartsOn !== undefined) updateData.week_starts_on = updates.weekStartsOn;
    if (updates.notifications?.email !== undefined) updateData.notifications_email = updates.notifications.email;
    if (updates.notifications?.desktop !== undefined) updateData.notifications_desktop = updates.notifications.desktop;
    if (updates.notifications?.taskReminders !== undefined) updateData.notifications_task_reminders = updates.notifications.taskReminders;
    if (updates.trashRetentionDays !== undefined) updateData.trash_retention_days = updates.trashRetentionDays;

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updateData })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      theme: data.theme,
      defaultView: data.default_view,
      dateFormat: data.date_format,
      weekStartsOn: data.week_starts_on,
      notifications: {
        email: data.notifications_email,
        desktop: data.notifications_desktop,
        taskReminders: data.notifications_task_reminders,
      },
      trashRetentionDays: data.trash_retention_days,
    };
  }

  // Trash operations (using soft delete)
  async getTrash(): Promise<TrashItem[]> {
    const userId = this.ensureUserId();
    
    // Get deleted tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null);

    if (tasksError) throw tasksError;

    // Get deleted ideas
    const { data: ideas, error: ideasError } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null);

    if (ideasError) throw ideasError;

    const trashItems: TrashItem[] = [];

    tasks.forEach(t => {
      trashItems.push({
        id: t.id,
        type: 'task',
        item: {
          id: t.id,
          title: t.title,
          description: t.description,
          domainId: t.domain_id,
          state: t.state,
          deadline: t.deadline || undefined,
          subtasks: [],
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          notes: t.notes || undefined,
          proof: t.proof || undefined,
        } as Task,
        deletedAt: t.deleted_at!,
        deletedBy: 'You',
      });
    });

    ideas.forEach(i => {
      trashItems.push({
        id: i.id,
        type: 'idea',
        item: {
          id: i.id,
          title: i.title,
          color: i.color || undefined,
          folderId: i.folder_id || undefined,
          notes: [],
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          tags: i.tags || undefined,
          position: (i.position_x !== null && i.position_y !== null) ? {
            x: i.position_x,
            y: i.position_y,
          } : undefined,
        } as Idea,
        deletedAt: i.deleted_at!,
        deletedBy: 'You',
      });
    });

    return trashItems.sort((a, b) => 
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );
  }

  async addToTrash(item: Omit<TrashItem, 'id'>): Promise<TrashItem> {
    // Handled by soft delete in deleteTask/deleteIdea
    throw new Error('Use deleteTask() or deleteIdea() instead');
  }

  async restoreFromTrash(id: string): Promise<void> {
    // Try to restore as task
    const { error: taskError } = await supabase
      .from('tasks')
      .update({ deleted_at: null })
      .eq('id', id);

    if (!taskError) return;

    // Try to restore as idea
    const { error: ideaError } = await supabase
      .from('ideas')
      .update({ deleted_at: null })
      .eq('id', id);

    if (ideaError) throw ideaError;
  }

  async permanentlyDelete(id: string): Promise<void> {
    // Try to delete as task
    let { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (!taskError) return;

    // Try to delete as idea
    const { error: ideaError } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (ideaError) throw ideaError;
  }

  async emptyTrash(): Promise<void> {
    const userId = this.ensureUserId();
    
    // Delete all soft-deleted tasks
    await supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .not('deleted_at', 'is', null);

    // Delete all soft-deleted ideas
    await supabase
      .from('ideas')
      .delete()
      .eq('user_id', userId)
      .not('deleted_at', 'is', null);
  }

  // Real-time subscriptions
  subscribeToTasks(callback: (tasks: Task[]) => void): () => void {
    const userId = this.ensureUserId();
    
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Fetch updated tasks and call callback
          const tasks = await this.getTasks();
          callback(tasks);
        }
      )
      .subscribe();

    this.channels.push(channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels = this.channels.filter(c => c !== channel);
    };
  }

  subscribeToIdeas(callback: (ideas: Idea[]) => void): () => void {
    const userId = this.ensureUserId();
    
    const channel = supabase
      .channel('ideas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const ideas = await this.getIdeas();
          callback(ideas);
        }
      )
      .subscribe();

    this.channels.push(channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels = this.channels.filter(c => c !== channel);
    };
  }

  subscribeToEvents(callback: (events: CalendarEvent[]) => void): () => void {
    const userId = this.ensureUserId();
    
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const events = await this.getCalendarEvents();
          callback(events);
        }
      )
      .subscribe();

    this.channels.push(channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels = this.channels.filter(c => c !== channel);
    };
  }
}
