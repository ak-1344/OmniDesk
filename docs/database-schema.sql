-- OmniDesk Supabase Database Schema
-- Version: 1.0.0
-- This file contains the complete database schema for OmniDesk
-- Execute this in your Supabase SQL Editor to set up the database

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================

-- Task state enumeration
CREATE TYPE task_state AS ENUM (
  'gotta-start',
  'in-progress',
  'nearly-done',
  'paused',
  'completed'
);

-- Subtask state enumeration
CREATE TYPE subtask_state AS ENUM (
  'todo',
  'in-progress',
  'completed'
);

-- Calendar event type enumeration
CREATE TYPE event_type AS ENUM (
  'task-deadline',
  'subtask-scheduled',
  'personal-event'
);

-- Note content type enumeration
CREATE TYPE note_content_type AS ENUM (
  'text',
  'image',
  'whiteboard'
);

-- Theme type enumeration
CREATE TYPE theme_type AS ENUM (
  'light',
  'dark',
  'auto'
);

-- Default view type enumeration
CREATE TYPE default_view_type AS ENUM (
  'dashboard',
  'tasks',
  'calendar'
);

-- Date format type enumeration
CREATE TYPE date_format_type AS ENUM (
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  'YYYY-MM-DD'
);

-- Week start type enumeration
CREATE TYPE week_start_type AS ENUM (
  'sunday',
  'monday'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Domains Table
-- ----------------------------------------------------------------------------
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Hex color code (#RRGGBB)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT domains_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT domains_color_format CHECK (color ~* '^#[0-9A-F]{6}$'),
  CONSTRAINT domains_user_name_unique UNIQUE (user_id, name)
);

-- ----------------------------------------------------------------------------
-- Tasks Table
-- ----------------------------------------------------------------------------
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT '',
  state task_state NOT NULL DEFAULT 'gotta-start',
  deadline TIMESTAMPTZ,
  notes TEXT,
  proof TEXT[], -- Array of URLs or file paths
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Constraints
  CONSTRAINT tasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

-- ----------------------------------------------------------------------------
-- Subtasks Table
-- ----------------------------------------------------------------------------
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  state subtask_state NOT NULL DEFAULT 'todo',
  deadline TIMESTAMPTZ,
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_duration INTEGER, -- Duration in minutes
  proof TEXT, -- URL or file path
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT subtasks_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT subtasks_duration_positive CHECK (scheduled_duration IS NULL OR scheduled_duration > 0),
  CONSTRAINT subtasks_scheduling_complete CHECK (
    (scheduled_date IS NULL AND scheduled_start_time IS NULL AND scheduled_duration IS NULL) OR
    (scheduled_date IS NOT NULL AND scheduled_start_time IS NOT NULL AND scheduled_duration IS NOT NULL)
  )
);

-- ----------------------------------------------------------------------------
-- Idea Folders Table
-- ----------------------------------------------------------------------------
CREATE TABLE idea_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7), -- Hex color code (#RRGGBB)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT idea_folders_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT idea_folders_color_format CHECK (color IS NULL OR color ~* '^#[0-9A-F]{6}$'),
  CONSTRAINT idea_folders_user_name_unique UNIQUE (user_id, name)
);

-- ----------------------------------------------------------------------------
-- Ideas Table
-- ----------------------------------------------------------------------------
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES idea_folders(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  color VARCHAR(7), -- Sticky note color
  tags TEXT[], -- Array of tag strings
  position_x INTEGER,
  position_y INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Constraints
  CONSTRAINT ideas_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT ideas_color_format CHECK (color IS NULL OR color ~* '^#[0-9A-F]{6}$')
);

-- ----------------------------------------------------------------------------
-- Note Contents Table (for Ideas)
-- ----------------------------------------------------------------------------
CREATE TABLE note_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  type note_content_type NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT note_contents_order_non_negative CHECK (display_order >= 0),
  CONSTRAINT note_contents_idea_order_unique UNIQUE (idea_id, display_order)
);

-- ----------------------------------------------------------------------------
-- Calendar Events Table
-- ----------------------------------------------------------------------------
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  type event_type NOT NULL,
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_subtask_id UUID REFERENCES subtasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT calendar_events_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT calendar_events_time_valid CHECK (
    start_time IS NULL OR end_time IS NULL OR end_time > start_time
  ),
  CONSTRAINT calendar_events_task_deadline_ref CHECK (
    type != 'task-deadline' OR related_task_id IS NOT NULL
  ),
  CONSTRAINT calendar_events_subtask_ref CHECK (
    type != 'subtask-scheduled' OR related_subtask_id IS NOT NULL
  )
);

-- ----------------------------------------------------------------------------
-- User Settings Table
-- ----------------------------------------------------------------------------
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme theme_type DEFAULT 'dark',
  default_view default_view_type DEFAULT 'dashboard',
  date_format date_format_type DEFAULT 'YYYY-MM-DD',
  week_starts_on week_start_type DEFAULT 'monday',
  notifications_email BOOLEAN DEFAULT true,
  notifications_desktop BOOLEAN DEFAULT true,
  notifications_task_reminders BOOLEAN DEFAULT true,
  trash_retention_days INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_settings_retention_days_valid CHECK (
    trash_retention_days > 0 AND trash_retention_days <= 365
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Domains indexes
CREATE INDEX idx_domains_user_id ON domains(user_id);
CREATE INDEX idx_domains_user_name ON domains(user_id, name);

-- Tasks indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_domain_id ON tasks(domain_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_user_domain ON tasks(user_id, domain_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_user_state ON tasks(user_id, state) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_tasks_deleted ON tasks(user_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- Subtasks indexes
CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_task_state ON subtasks(task_id, state);
CREATE INDEX idx_subtasks_scheduled ON subtasks(scheduled_date) WHERE scheduled_date IS NOT NULL;

-- Ideas indexes
CREATE INDEX idx_ideas_user_id ON ideas(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ideas_folder_id ON ideas(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ideas_deleted ON ideas(user_id, deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_ideas_tags ON ideas USING GIN(tags) WHERE deleted_at IS NULL;

-- Idea folders indexes
CREATE INDEX idx_idea_folders_user_id ON idea_folders(user_id);

-- Note contents indexes
CREATE INDEX idx_note_contents_idea_id ON note_contents(idea_id);
CREATE INDEX idx_note_contents_idea_order ON note_contents(idea_id, display_order);

-- Calendar events indexes
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON calendar_events(user_id, event_date);
CREATE INDEX idx_calendar_events_task_id ON calendar_events(related_task_id) WHERE related_task_id IS NOT NULL;
CREATE INDEX idx_calendar_events_subtask_id ON calendar_events(related_subtask_id) WHERE related_subtask_id IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Domains Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own domains"
  ON domains FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own domains"
  ON domains FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domains"
  ON domains FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domains"
  ON domains FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Tasks Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Subtasks Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view subtasks of their tasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create subtasks for their tasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subtasks of their tasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subtasks of their tasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = subtasks.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Idea Folders Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own idea folders"
  ON idea_folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own idea folders"
  ON idea_folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own idea folders"
  ON idea_folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own idea folders"
  ON idea_folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Ideas Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
  ON ideas FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Note Contents Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view note contents of their ideas"
  ON note_contents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = note_contents.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create note contents for their ideas"
  ON note_contents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = note_contents.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update note contents of their ideas"
  ON note_contents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = note_contents.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete note contents of their ideas"
  ON note_contents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = note_contents.idea_id
      AND ideas.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- Calendar Events Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- User Settings Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at
  BEFORE UPDATE ON subtasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- Function to create default domains for new users
CREATE OR REPLACE FUNCTION create_default_domains()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO domains (user_id, name, color, description) VALUES
    (NEW.id, 'College', '#667eea', 'Academic work and studies'),
    (NEW.id, 'Personal', '#48bb78', 'Personal projects and growth'),
    (NEW.id, 'Work', '#ed8936', 'Professional work'),
    (NEW.id, 'Health', '#f56565', 'Health and fitness')
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default domains on user signup
CREATE TRIGGER on_auth_user_created_domains
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_domains();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get task statistics for a user
CREATE OR REPLACE FUNCTION get_task_stats(user_uuid UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT,
  paused_tasks BIGINT,
  overdue_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE state = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE state = 'in-progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE state = 'paused') as paused_tasks,
    COUNT(*) FILTER (WHERE deadline < NOW() AND state != 'completed') as overdue_tasks
  FROM tasks
  WHERE user_id = user_uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete old trash items
CREATE OR REPLACE FUNCTION cleanup_old_trash()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  retention_days INTEGER;
BEGIN
  FOR user_record IN SELECT user_id, trash_retention_days FROM user_settings LOOP
    retention_days := user_record.trash_retention_days;
    
    -- Delete old tasks
    DELETE FROM tasks
    WHERE user_id = user_record.user_id
      AND deleted_at IS NOT NULL
      AND deleted_at < (NOW() - (retention_days || ' days')::INTERVAL);
    
    -- Delete old ideas
    DELETE FROM ideas
    WHERE user_id = user_record.user_id
      AND deleted_at IS NOT NULL
      AND deleted_at < (NOW() - (retention_days || ' days')::INTERVAL);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get domain statistics
CREATE OR REPLACE FUNCTION get_domain_stats(user_uuid UUID)
RETURNS TABLE (
  domain_id UUID,
  domain_name VARCHAR,
  domain_color VARCHAR,
  task_count BIGINT,
  completed_count BIGINT,
  in_progress_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as domain_id,
    d.name as domain_name,
    d.color as domain_color,
    COUNT(t.id) as task_count,
    COUNT(t.id) FILTER (WHERE t.state = 'completed') as completed_count,
    COUNT(t.id) FILTER (WHERE t.state = 'in-progress') as in_progress_count
  FROM domains d
  LEFT JOIN tasks t ON d.id = t.domain_id AND t.deleted_at IS NULL
  WHERE d.user_id = user_uuid
  GROUP BY d.id, d.name, d.color
  ORDER BY d.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SCHEDULED JOBS (Optional - Requires pg_cron extension)
-- ============================================================================

-- To enable automatic trash cleanup, install pg_cron and run:
-- SELECT cron.schedule('cleanup-trash', '0 2 * * *', 'SELECT cleanup_old_trash()');
-- This runs daily at 2 AM

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE domains IS 'Top-level categories for organizing tasks (e.g., College, Work, Personal)';
COMMENT ON TABLE tasks IS 'Core task management entity with support for states, deadlines, and subtasks';
COMMENT ON TABLE subtasks IS 'Granular breakdown of tasks with individual tracking and scheduling';
COMMENT ON TABLE idea_folders IS 'Folders for organizing ideas';
COMMENT ON TABLE ideas IS 'Notion-inspired idea capture with flexible content types';
COMMENT ON TABLE note_contents IS 'Content pieces for ideas (text, images, whiteboard)';
COMMENT ON TABLE calendar_events IS 'Events linked to tasks, subtasks, or standalone personal events';
COMMENT ON TABLE user_settings IS 'User preferences and application configuration';

-- ============================================================================
-- INITIAL DATA VALIDATION
-- ============================================================================

-- Verify schema creation
DO $$
BEGIN
  RAISE NOTICE 'Schema created successfully!';
  RAISE NOTICE 'Tables: domains, tasks, subtasks, idea_folders, ideas, note_contents, calendar_events, user_settings';
  RAISE NOTICE 'RLS policies: Enabled on all tables';
  RAISE NOTICE 'Triggers: Auto-update timestamps, default user settings, default domains';
  RAISE NOTICE 'Next steps: Configure authentication providers in Supabase dashboard';
END $$;
