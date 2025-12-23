// MongoDB implementation of data storage
import { getDatabase } from './mongodb';
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
} from '../types';
import { ObjectId } from 'mongodb';

export class MongoDBAdapter implements IDataStorage {
  private userId: string | null = null;

  async initialize(): Promise<void> {
    // In a real implementation, you would get the user ID from authentication
    // For now, we'll use a default user ID
    this.userId = 'default-user';
  }

  private ensureUserId(): string {
    if (!this.userId) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }
    return this.userId;
  }

  private generateId(): string {
    return new ObjectId().toString();
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    const domains = await db
      .collection('domains')
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();

    return domains.map(d => ({
      id: d._id.toString(),
      name: d.name,
      color: d.color,
      description: d.description,
    }));
  }

  async addDomain(domain: Omit<Domain, 'id'>): Promise<Domain> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const result = await db.collection('domains').insertOne({
      user_id: userId,
      name: domain.name,
      color: domain.color,
      description: domain.description,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      name: domain.name,
      color: domain.color,
      description: domain.description,
    };
  }

  async updateDomain(id: string, updates: Partial<Domain>): Promise<Domain> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = { updated_at: new Date() };
    if (updates.name !== undefined) updateDoc.name = updates.name;
    if (updates.color !== undefined) updateDoc.color = updates.color;
    if (updates.description !== undefined) updateDoc.description = updates.description;

    await db.collection('domains').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const domain = await db.collection('domains').findOne({ _id: new ObjectId(id) });
    if (!domain) throw new Error('Domain not found');

    return {
      id: domain._id.toString(),
      name: domain.name,
      color: domain.color,
      description: domain.description,
    };
  }

  async deleteDomain(id: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('domains').deleteOne({ _id: new ObjectId(id) });
  }

  // Task operations
  async getTasks(): Promise<Task[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const tasks = await db
      .collection('tasks')
      .find({ user_id: userId, deleted_at: { $exists: false } })
      .sort({ created_at: -1 })
      .toArray();

    return tasks.map(t => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      domainId: t.domain_id,
      state: t.state,
      deadline: t.deadline,
      subtasks: (t.subtasks || []).map((s: any) => ({
        id: s._id || s.id,
        title: s.title,
        description: s.description,
        state: s.state,
        deadline: s.deadline,
        scheduledTime: s.scheduled_time ? {
          date: s.scheduled_time.date,
          startTime: s.scheduled_time.start_time,
          duration: s.scheduled_time.duration,
        } : undefined,
        proof: s.proof,
        completedAt: s.completed_at,
      })),
      createdAt: t.created_at?.toISOString(),
      updatedAt: t.updated_at?.toISOString(),
      notes: t.notes,
      proof: t.proof,
    }));
  }

  async getTask(id: string): Promise<Task | null> {
    const db = await getDatabase();
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(id),
      deleted_at: { $exists: false }
    });

    if (!task) return null;

    return {
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      domainId: task.domain_id,
      state: task.state,
      deadline: task.deadline,
      subtasks: (task.subtasks || []).map((s: any) => ({
        id: s._id || s.id,
        title: s.title,
        description: s.description,
        state: s.state,
        deadline: s.deadline,
        scheduledTime: s.scheduled_time ? {
          date: s.scheduled_time.date,
          startTime: s.scheduled_time.start_time,
          duration: s.scheduled_time.duration,
        } : undefined,
        proof: s.proof,
        completedAt: s.completed_at,
      })),
      createdAt: task.created_at?.toISOString(),
      updatedAt: task.updated_at?.toISOString(),
      notes: task.notes,
      proof: task.proof,
    };
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'subtasks'>): Promise<Task> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const result = await db.collection('tasks').insertOne({
      user_id: userId,
      domain_id: task.domainId,
      title: task.title,
      description: task.description,
      state: task.state,
      deadline: task.deadline,
      notes: task.notes,
      proof: task.proof,
      subtasks: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      title: task.title,
      description: task.description,
      domainId: task.domainId,
      state: task.state,
      deadline: task.deadline,
      subtasks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: task.notes,
      proof: task.proof,
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = { updated_at: new Date() };
    if (updates.title !== undefined) updateDoc.title = updates.title;
    if (updates.description !== undefined) updateDoc.description = updates.description;
    if (updates.domainId !== undefined) updateDoc.domain_id = updates.domainId;
    if (updates.state !== undefined) updateDoc.state = updates.state;
    if (updates.deadline !== undefined) updateDoc.deadline = updates.deadline;
    if (updates.notes !== undefined) updateDoc.notes = updates.notes;
    if (updates.proof !== undefined) updateDoc.proof = updates.proof;

    await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const task = await this.getTask(id);
    if (!task) throw new Error('Task not found');
    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const db = await getDatabase();
    // Soft delete
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted_at: new Date() } }
    );
  }

  // Subtask operations
  async getSubtasks(taskId: string): Promise<Subtask[]> {
    const task = await this.getTask(taskId);
    return task?.subtasks || [];
  }

  async addSubtask(taskId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
    const db = await getDatabase();
    
    const newSubtask = {
      _id: this.generateId(),
      title: subtask.title,
      description: subtask.description,
      state: subtask.state,
      deadline: subtask.deadline,
      scheduled_time: subtask.scheduledTime ? {
        date: subtask.scheduledTime.date,
        start_time: subtask.scheduledTime.startTime,
        duration: subtask.scheduledTime.duration,
      } : undefined,
      proof: subtask.proof,
      completed_at: subtask.completedAt,
    };

    await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      {
        $push: { subtasks: newSubtask } as any,
        $set: { updated_at: new Date() }
      }
    );

    return {
      id: newSubtask._id,
      title: newSubtask.title,
      description: newSubtask.description,
      state: newSubtask.state,
      deadline: newSubtask.deadline,
      scheduledTime: subtask.scheduledTime,
      proof: newSubtask.proof,
      completedAt: newSubtask.completed_at,
    };
  }

  async updateSubtask(_taskId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {};
    if (updates.title !== undefined) updateDoc['subtasks.$.title'] = updates.title;
    if (updates.description !== undefined) updateDoc['subtasks.$.description'] = updates.description;
    if (updates.state !== undefined) updateDoc['subtasks.$.state'] = updates.state;
    if (updates.deadline !== undefined) updateDoc['subtasks.$.deadline'] = updates.deadline;
    if (updates.scheduledTime !== undefined) {
      updateDoc['subtasks.$.scheduled_time'] = updates.scheduledTime ? {
        date: updates.scheduledTime.date,
        start_time: updates.scheduledTime.startTime,
        duration: updates.scheduledTime.duration,
      } : null;
    }
    if (updates.proof !== undefined) updateDoc['subtasks.$.proof'] = updates.proof;
    if (updates.completedAt !== undefined) updateDoc['subtasks.$.completed_at'] = updates.completedAt;

    await db.collection('tasks').updateOne(
      { 'subtasks._id': subtaskId },
      {
        $set: { ...updateDoc, updated_at: new Date() }
      }
    );

    // Fetch updated subtask
    const task = await db.collection('tasks').findOne({ 'subtasks._id': subtaskId });
    const subtask = task?.subtasks?.find((s: any) => s._id === subtaskId);
    
    if (!subtask) throw new Error('Subtask not found');

    return {
      id: subtask._id,
      title: subtask.title,
      description: subtask.description,
      state: subtask.state,
      deadline: subtask.deadline,
      scheduledTime: subtask.scheduled_time ? {
        date: subtask.scheduled_time.date,
        startTime: subtask.scheduled_time.start_time,
        duration: subtask.scheduled_time.duration,
      } : undefined,
      proof: subtask.proof,
      completedAt: subtask.completed_at,
    };
  }

  async deleteSubtask(taskId: string, subtaskId: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      {
        $pull: { subtasks: { _id: subtaskId } } as any,
        $set: { updated_at: new Date() }
      }
    );
  }

  // Idea operations
  async getIdeas(): Promise<Idea[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const ideas = await db
      .collection('ideas')
      .find({ user_id: userId, deleted_at: { $exists: false } })
      .sort({ created_at: -1 })
      .toArray();

    return ideas.map(i => ({
      id: i._id.toString(),
      title: i.title,
      color: i.color,
      folderId: i.folder_id,
      notes: (i.notes || []).map((n: any) => ({
        id: n._id || n.id,
        type: n.type,
        content: n.content,
        createdAt: n.created_at?.toISOString(),
        order: n.order,
      })),
      createdAt: i.created_at?.toISOString(),
      updatedAt: i.updated_at?.toISOString(),
      tags: i.tags,
      position: i.position,
    }));
  }

  async getIdea(id: string): Promise<Idea | null> {
    const db = await getDatabase();
    const idea = await db.collection('ideas').findOne({
      _id: new ObjectId(id),
      deleted_at: { $exists: false }
    });

    if (!idea) return null;

    return {
      id: idea._id.toString(),
      title: idea.title,
      color: idea.color,
      folderId: idea.folder_id,
      notes: (idea.notes || []).map((n: any) => ({
        id: n._id || n.id,
        type: n.type,
        content: n.content,
        createdAt: n.created_at?.toISOString(),
        order: n.order,
      })),
      createdAt: idea.created_at?.toISOString(),
      updatedAt: idea.updated_at?.toISOString(),
      tags: idea.tags,
      position: idea.position,
    };
  }

  async addIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>): Promise<Idea> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const result = await db.collection('ideas').insertOne({
      user_id: userId,
      folder_id: idea.folderId,
      title: idea.title,
      color: idea.color,
      tags: idea.tags,
      position: idea.position,
      notes: (idea.notes || []).map(n => ({
        _id: this.generateId(),
        type: n.type,
        content: n.content,
        created_at: new Date(),
        order: n.order,
      })),
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      title: idea.title,
      color: idea.color,
      folderId: idea.folderId,
      notes: idea.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: idea.tags,
      position: idea.position,
    };
  }

  async updateIdea(id: string, updates: Partial<Idea>): Promise<Idea> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = { updated_at: new Date() };
    if (updates.title !== undefined) updateDoc.title = updates.title;
    if (updates.color !== undefined) updateDoc.color = updates.color;
    if (updates.folderId !== undefined) updateDoc.folder_id = updates.folderId;
    if (updates.tags !== undefined) updateDoc.tags = updates.tags;
    if (updates.position !== undefined) updateDoc.position = updates.position;
    if (updates.notes !== undefined) {
      updateDoc.notes = updates.notes.map(n => ({
        _id: n.id || this.generateId(),
        type: n.type,
        content: n.content,
        created_at: new Date(),
        order: n.order,
      }));
    }

    await db.collection('ideas').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const idea = await this.getIdea(id);
    if (!idea) throw new Error('Idea not found');
    return idea;
  }

  async deleteIdea(id: string): Promise<void> {
    const db = await getDatabase();
    // Soft delete
    await db.collection('ideas').updateOne(
      { _id: new ObjectId(id) },
      { $set: { deleted_at: new Date() } }
    );
  }

  // Idea folder operations
  async getIdeaFolders(): Promise<IdeaFolder[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const folders = await db
      .collection('idea_folders')
      .find({ user_id: userId })
      .sort({ name: 1 })
      .toArray();

    return folders.map(f => ({
      id: f._id.toString(),
      name: f.name,
      color: f.color,
      createdAt: f.created_at?.toISOString(),
    }));
  }

  async addIdeaFolder(folder: Omit<IdeaFolder, 'id'>): Promise<IdeaFolder> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const result = await db.collection('idea_folders').insertOne({
      user_id: userId,
      name: folder.name,
      color: folder.color,
      created_at: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      name: folder.name,
      color: folder.color,
      createdAt: new Date().toISOString(),
    };
  }

  async updateIdeaFolder(id: string, updates: Partial<IdeaFolder>): Promise<IdeaFolder> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = {};
    if (updates.name !== undefined) updateDoc.name = updates.name;
    if (updates.color !== undefined) updateDoc.color = updates.color;

    await db.collection('idea_folders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const folder = await db.collection('idea_folders').findOne({ _id: new ObjectId(id) });
    if (!folder) throw new Error('Idea folder not found');

    return {
      id: folder._id.toString(),
      name: folder.name,
      color: folder.color,
      createdAt: folder.created_at?.toISOString(),
    };
  }

  async deleteIdeaFolder(id: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('idea_folders').deleteOne({ _id: new ObjectId(id) });
  }

  // Calendar event operations
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const events = await db
      .collection('calendar_events')
      .find({ user_id: userId })
      .sort({ date: 1 })
      .toArray();

    return events.map(e => ({
      id: e._id.toString(),
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.start_time,
      endTime: e.end_time,
      type: e.type,
      relatedTaskId: e.related_task_id,
      relatedSubtaskId: e.related_subtask_id,
    }));
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const result = await db.collection('calendar_events').insertOne({
      user_id: userId,
      title: event.title,
      description: event.description,
      date: event.date,
      start_time: event.startTime,
      end_time: event.endTime,
      type: event.type,
      related_task_id: event.relatedTaskId,
      related_subtask_id: event.relatedSubtaskId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      id: result.insertedId.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      relatedTaskId: event.relatedTaskId,
      relatedSubtaskId: event.relatedSubtaskId,
    };
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = { updated_at: new Date() };
    if (updates.title !== undefined) updateDoc.title = updates.title;
    if (updates.description !== undefined) updateDoc.description = updates.description;
    if (updates.date !== undefined) updateDoc.date = updates.date;
    if (updates.startTime !== undefined) updateDoc.start_time = updates.startTime;
    if (updates.endTime !== undefined) updateDoc.end_time = updates.endTime;
    if (updates.type !== undefined) updateDoc.type = updates.type;
    if (updates.relatedTaskId !== undefined) updateDoc.related_task_id = updates.relatedTaskId;
    if (updates.relatedSubtaskId !== undefined) updateDoc.related_subtask_id = updates.relatedSubtaskId;

    await db.collection('calendar_events').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    const event = await db.collection('calendar_events').findOne({ _id: new ObjectId(id) });
    if (!event) throw new Error('Calendar event not found');

    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.start_time,
      endTime: event.end_time,
      type: event.type,
      relatedTaskId: event.related_task_id,
      relatedSubtaskId: event.related_subtask_id,
    };
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    const db = await getDatabase();
    await db.collection('calendar_events').deleteOne({ _id: new ObjectId(id) });
  }

  // Settings operations
  async getSettings(): Promise<AppSettings> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const settings = await db.collection('user_settings').findOne({ user_id: userId });

    if (!settings) {
      // Return defaults
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

    return {
      theme: settings.theme,
      defaultView: settings.default_view,
      dateFormat: settings.date_format,
      weekStartsOn: settings.week_starts_on,
      notifications: {
        email: settings.notifications_email,
        desktop: settings.notifications_desktop,
        taskReminders: settings.notifications_task_reminders,
      },
      trashRetentionDays: settings.trash_retention_days,
    };
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const updateDoc: Record<string, unknown> = { updated_at: new Date() };
    if (updates.theme !== undefined) updateDoc.theme = updates.theme;
    if (updates.defaultView !== undefined) updateDoc.default_view = updates.defaultView;
    if (updates.dateFormat !== undefined) updateDoc.date_format = updates.dateFormat;
    if (updates.weekStartsOn !== undefined) updateDoc.week_starts_on = updates.weekStartsOn;
    if (updates.notifications?.email !== undefined) updateDoc.notifications_email = updates.notifications.email;
    if (updates.notifications?.desktop !== undefined) updateDoc.notifications_desktop = updates.notifications.desktop;
    if (updates.notifications?.taskReminders !== undefined) updateDoc.notifications_task_reminders = updates.notifications.taskReminders;
    if (updates.trashRetentionDays !== undefined) updateDoc.trash_retention_days = updates.trashRetentionDays;

    await db.collection('user_settings').updateOne(
      { user_id: userId },
      { $set: updateDoc },
      { upsert: true }
    );

    return this.getSettings();
  }

  // Trash operations
  async getTrash(): Promise<TrashItem[]> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    const trashItems: TrashItem[] = [];

    // Get deleted tasks
    const tasks = await db.collection('tasks').find({
      user_id: userId,
      deleted_at: { $exists: true }
    }).toArray();

    tasks.forEach(t => {
      trashItems.push({
        id: t._id.toString(),
        type: 'task',
        item: {
          id: t._id.toString(),
          title: t.title,
          description: t.description,
          domainId: t.domain_id,
          state: t.state,
          deadline: t.deadline,
          subtasks: [],
          createdAt: t.created_at?.toISOString(),
          updatedAt: t.updated_at?.toISOString(),
          notes: t.notes,
          proof: t.proof,
        },
        deletedAt: t.deleted_at?.toISOString(),
        deletedBy: 'You',
      });
    });

    // Get deleted ideas
    const ideas = await db.collection('ideas').find({
      user_id: userId,
      deleted_at: { $exists: true }
    }).toArray();

    ideas.forEach(i => {
      trashItems.push({
        id: i._id.toString(),
        type: 'idea',
        item: {
          id: i._id.toString(),
          title: i.title,
          color: i.color,
          folderId: i.folder_id,
          notes: [],
          createdAt: i.created_at?.toISOString(),
          updatedAt: i.updated_at?.toISOString(),
          tags: i.tags,
          position: i.position,
        },
        deletedAt: i.deleted_at?.toISOString(),
        deletedBy: 'You',
      });
    });

    return trashItems.sort((a, b) => 
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );
  }

  async addToTrash(): Promise<TrashItem> {
    throw new Error('Use deleteTask() or deleteIdea() instead');
  }

  async restoreFromTrash(id: string): Promise<void> {
    const db = await getDatabase();
    
    // Try to restore as task
    const taskResult = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $unset: { deleted_at: '' } }
    );

    if (taskResult.modifiedCount > 0) return;

    // Try to restore as idea
    await db.collection('ideas').updateOne(
      { _id: new ObjectId(id) },
      { $unset: { deleted_at: '' } }
    );
  }

  async permanentlyDelete(id: string): Promise<void> {
    const db = await getDatabase();
    
    // Try to delete as task
    const taskResult = await db.collection('tasks').deleteOne({ _id: new ObjectId(id) });
    if (taskResult.deletedCount > 0) return;

    // Try to delete as idea
    await db.collection('ideas').deleteOne({ _id: new ObjectId(id) });
  }

  async emptyTrash(): Promise<void> {
    const userId = this.ensureUserId();
    const db = await getDatabase();
    
    // Delete all soft-deleted tasks
    await db.collection('tasks').deleteMany({
      user_id: userId,
      deleted_at: { $exists: true }
    });

    // Delete all soft-deleted ideas
    await db.collection('ideas').deleteMany({
      user_id: userId,
      deleted_at: { $exists: true }
    });
  }
}
