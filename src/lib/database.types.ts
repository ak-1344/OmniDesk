// Auto-generated types for Supabase schema
// This file should ideally be generated using: npx supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      domains: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          domain_id: string
          title: string
          description: string
          state: 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed'
          deadline: string | null
          notes: string | null
          proof: string[] | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          domain_id: string
          title: string
          description?: string
          state?: 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed'
          deadline?: string | null
          notes?: string | null
          proof?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          domain_id?: string
          title?: string
          description?: string
          state?: 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed'
          deadline?: string | null
          notes?: string | null
          proof?: string[] | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          description: string | null
          state: 'todo' | 'in-progress' | 'completed'
          deadline: string | null
          scheduled_date: string | null
          scheduled_start_time: string | null
          scheduled_duration: number | null
          proof: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          description?: string | null
          state?: 'todo' | 'in-progress' | 'completed'
          deadline?: string | null
          scheduled_date?: string | null
          scheduled_start_time?: string | null
          scheduled_duration?: number | null
          proof?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          description?: string | null
          state?: 'todo' | 'in-progress' | 'completed'
          deadline?: string | null
          scheduled_date?: string | null
          scheduled_start_time?: string | null
          scheduled_duration?: number | null
          proof?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      idea_folders: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          color: string | null
          tags: string[] | null
          position_x: number | null
          position_y: number | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title: string
          color?: string | null
          tags?: string[] | null
          position_x?: number | null
          position_y?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          color?: string | null
          tags?: string[] | null
          position_x?: number | null
          position_y?: number | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      note_contents: {
        Row: {
          id: string
          idea_id: string
          type: 'text' | 'image' | 'whiteboard'
          content: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          idea_id: string
          type?: 'text' | 'image' | 'whiteboard'
          content: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          idea_id?: string
          type?: 'text' | 'image' | 'whiteboard'
          content?: string
          display_order?: number
          created_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          event_date: string
          start_time: string | null
          end_time: string | null
          type: 'task-deadline' | 'subtask-scheduled' | 'personal-event'
          related_task_id: string | null
          related_subtask_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          event_date: string
          start_time?: string | null
          end_time?: string | null
          type: 'task-deadline' | 'subtask-scheduled' | 'personal-event'
          related_task_id?: string | null
          related_subtask_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          event_date?: string
          start_time?: string | null
          end_time?: string | null
          type?: 'task-deadline' | 'subtask-scheduled' | 'personal-event'
          related_task_id?: string | null
          related_subtask_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          user_id: string
          theme: 'light' | 'dark' | 'auto'
          default_view: 'dashboard' | 'tasks' | 'calendar'
          date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          week_starts_on: 'sunday' | 'monday'
          notifications_email: boolean
          notifications_desktop: boolean
          notifications_task_reminders: boolean
          trash_retention_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          theme?: 'light' | 'dark' | 'auto'
          default_view?: 'dashboard' | 'tasks' | 'calendar'
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          week_starts_on?: 'sunday' | 'monday'
          notifications_email?: boolean
          notifications_desktop?: boolean
          notifications_task_reminders?: boolean
          trash_retention_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          theme?: 'light' | 'dark' | 'auto'
          default_view?: 'dashboard' | 'tasks' | 'calendar'
          date_format?: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
          week_starts_on?: 'sunday' | 'monday'
          notifications_email?: boolean
          notifications_desktop?: boolean
          notifications_task_reminders?: boolean
          trash_retention_days?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_task_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_tasks: number
          completed_tasks: number
          in_progress_tasks: number
          paused_tasks: number
          overdue_tasks: number
        }[]
      }
      get_domain_stats: {
        Args: { user_uuid: string }
        Returns: {
          domain_id: string
          domain_name: string
          domain_color: string
          task_count: number
          completed_count: number
          in_progress_count: number
        }[]
      }
    }
    Enums: {
      task_state: 'gotta-start' | 'in-progress' | 'nearly-done' | 'paused' | 'completed'
      subtask_state: 'todo' | 'in-progress' | 'completed'
      event_type: 'task-deadline' | 'subtask-scheduled' | 'personal-event'
      note_content_type: 'text' | 'image' | 'whiteboard'
      theme_type: 'light' | 'dark' | 'auto'
      default_view_type: 'dashboard' | 'tasks' | 'calendar'
      date_format_type: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
      week_start_type: 'sunday' | 'monday'
    }
  }
}
