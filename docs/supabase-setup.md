# Supabase Setup Guide

## Overview

This guide walks you through setting up Supabase as the backend for OmniDesk, including database schema creation, Row Level Security policies, and client integration.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Git and basic command line knowledge

---

## Step 1: Create Supabase Project

1. **Sign up/Login to Supabase:**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Create a new account or sign in

2. **Create a new project:**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - Name: `omni-desk` (or your preference)
     - Database Password: (generate a strong password and save it)
     - Region: (choose closest to your users)
   - Click "Create new project"
   - Wait for provisioning (2-3 minutes)

3. **Get your project credentials:**
   - Go to Settings → API
   - Copy the following:
     - Project URL: `https://xxxxx.supabase.co`
     - `anon` public key (safe to use in browser)
   - Save these for later use

---

## Step 2: Database Schema Setup

### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to the **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the complete SQL schema from `docs/database-schema.sql`
4. Click "Run" to execute

### Option B: Using Supabase CLI (Advanced)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Run migrations:**
   ```bash
   supabase db push
   ```

---

## Step 3: Enable Authentication

### Configure Auth Providers

1. **Go to Authentication → Providers** in Supabase dashboard

2. **Enable Email provider:**
   - Enable "Email" provider
   - Configure email templates (optional)
   - Set "Confirm email" as needed

3. **Optional: Enable OAuth providers:**
   - Google, GitHub, etc.
   - Follow provider-specific setup instructions

### Configure Auth Settings

1. **Go to Authentication → Settings**

2. **Configure site URL:**
   - Development: `http://localhost:5173`
   - Production: Your deployed URL

3. **Add redirect URLs:**
   - `http://localhost:5173/auth/callback`
   - `https://your-domain.com/auth/callback`

4. **Set session settings:**
   - JWT expiry: 3600 (1 hour recommended)
   - Refresh token rotation: Enabled

---

## Step 4: Configure Row Level Security

All RLS policies are included in the database schema, but verify they're enabled:

1. **Go to Authentication → Policies**

2. **Verify policies exist for each table:**
   - domains
   - tasks
   - subtasks
   - ideas
   - idea_folders
   - note_contents
   - calendar_events
   - user_settings

3. **Each table should have policies for:**
   - SELECT: Users can view their own data
   - INSERT: Users can create their own data
   - UPDATE: Users can update their own data
   - DELETE: Users can delete their own data

### Testing RLS Policies

```sql
-- Test as authenticated user
SELECT * FROM tasks WHERE user_id = auth.uid();

-- Should return only user's tasks
```

---

## Step 5: Enable Real-time Features

1. **Go to Database → Replication**

2. **Enable real-time for tables:**
   - Navigate to each table
   - Click the table name
   - Enable "Real-time" toggle

3. **Recommended real-time enabled tables:**
   - `tasks` - for live task updates
   - `subtasks` - for subtask changes
   - `ideas` - for idea collaboration (future)
   - `calendar_events` - for calendar sync

---

## Step 6: Configure Storage (Optional)

For file uploads (task proof, idea images):

1. **Go to Storage in Supabase dashboard**

2. **Create buckets:**
   - `task-proof`: For task completion proof
   - `idea-images`: For idea attachments

3. **Set bucket policies:**
   ```sql
   -- Allow authenticated users to upload to their folder
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'task-proof' 
     AND (storage.foldername(name))[1] = auth.uid()::text
   );

   -- Allow users to read their own files
   CREATE POLICY "Users can read own files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'task-proof'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

---

## Step 7: Local Development Setup

### Install Dependencies

```bash
cd OmniDesk
npm install @supabase/supabase-js
```

### Create Environment File

Create `.env.local` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Storage Configuration
VITE_STORAGE_BACKEND=supabase
VITE_ENABLE_OFFLINE_MODE=true
VITE_SYNC_INTERVAL_MS=30000
```

**Important:** Add `.env.local` to `.gitignore`:
```gitignore
.env.local
.env.*.local
```

### Initialize Supabase Client

The Supabase client is initialized in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Step 8: Database Indexes (Performance)

Verify these indexes exist (included in schema):

```sql
-- Check existing indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Critical indexes for performance:**
- `idx_tasks_user_domain` on `tasks(user_id, domain_id)`
- `idx_tasks_user_state` on `tasks(user_id, state)`
- `idx_tasks_deadline` on `tasks(deadline)` where deadline IS NOT NULL
- `idx_subtasks_task` on `subtasks(task_id)`
- `idx_calendar_events_date` on `calendar_events(user_id, date)`

---

## Step 9: Test the Integration

### Test Database Connection

Run this in SQL Editor:

```sql
-- Test user creation
SELECT auth.uid(); -- Should return NULL (not authenticated)

-- Test table access
SELECT count(*) FROM domains; -- Should work
```

### Test from Application

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Sign up a test user:**
   - Navigate to signup page
   - Create test account
   - Verify email (if enabled)

3. **Test CRUD operations:**
   - Create a domain
   - Create a task
   - Add subtasks
   - Verify data persists after refresh

### Verify Real-time Updates

1. Open app in two browser windows
2. Create/update a task in one window
3. Verify it appears in the other window immediately

---

## Step 10: Migrate Existing Data (Optional)

If you have existing LocalStorage data:

### Export LocalStorage Data

```javascript
// Run in browser console
const exportData = () => {
  const state = JSON.parse(localStorage.getItem('omniDesk_state'));
  const trash = JSON.parse(localStorage.getItem('omniDesk_trash'));
  
  const backup = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    state,
    trash
  };
  
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omni-desk-backup-${Date.now()}.json`;
  a.click();
};

exportData();
```

### Import to Supabase

Use the migration utility (if available) or manually import:

```typescript
// In your app's migration component
async function migrateData(backup: any) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Import domains
  for (const domain of backup.state.domains) {
    await supabase.from('domains').insert({
      id: domain.id,
      user_id: user.id,
      name: domain.name,
      color: domain.color,
      description: domain.description
    });
  }
  
  // Import tasks, ideas, etc.
  // ...
}
```

---

## Monitoring and Maintenance

### Database Monitoring

1. **Go to Database → Tables** in Supabase dashboard
2. Monitor:
   - Row counts
   - Table sizes
   - Index usage

### Performance Monitoring

1. **Go to Database → Query Performance**
2. Review:
   - Slow queries
   - Most frequent queries
   - Index hit rates

### Backup Strategy

1. **Automatic backups:**
   - Enabled by default on paid plans
   - Daily backups for 7 days

2. **Manual backups:**
   ```bash
   # Using Supabase CLI
   supabase db dump -f backup.sql
   ```

3. **Point-in-time recovery:**
   - Available on Pro plan
   - Restore to any point in last 7 days

---

## Security Best Practices

### 1. Environment Variables

- Never commit `.env.local` to Git
- Use different keys for development/production
- Rotate keys periodically

### 2. Row Level Security

- Always keep RLS enabled
- Test policies thoroughly
- Review policies regularly

### 3. API Keys

- Use `anon` key for client-side
- Keep `service_role` key secret (server-side only)
- Never expose service role key in frontend

### 4. Authentication

- Implement password strength requirements
- Enable email verification
- Consider MFA for sensitive operations
- Set appropriate session timeouts

### 5. Input Validation

- Validate all inputs client-side
- Use database constraints
- Sanitize user content
- Implement rate limiting

---

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to Supabase

**Solutions:**
1. Verify `.env.local` file exists and has correct values
2. Check Supabase project status in dashboard
3. Verify no CORS issues (check browser console)
4. Test with curl:
   ```bash
   curl https://your-project.supabase.co/rest/v1/
   ```

### Authentication Issues

**Problem:** User cannot sign in

**Solutions:**
1. Check email confirmation settings
2. Verify redirect URLs configured
3. Check browser cookies enabled
4. Review auth logs in Supabase dashboard

### RLS Policy Issues

**Problem:** Cannot read/write data

**Solutions:**
1. Verify user is authenticated: `supabase.auth.getUser()`
2. Check RLS policies in dashboard
3. Test queries in SQL editor with RLS disabled:
   ```sql
   SET ROLE authenticator;
   SELECT * FROM tasks;
   ```
4. Review policy definitions

### Real-time Not Working

**Problem:** Changes not syncing in real-time

**Solutions:**
1. Verify real-time enabled for table
2. Check subscription in code:
   ```typescript
   const channel = supabase
     .channel('tasks-changes')
     .on('postgres_changes', 
       { event: '*', schema: 'public', table: 'tasks' },
       (payload) => console.log('Change received!', payload)
     )
     .subscribe()
   ```
3. Monitor real-time connections in dashboard
4. Check browser console for WebSocket errors

### Performance Issues

**Problem:** Slow queries

**Solutions:**
1. Add appropriate indexes
2. Use `EXPLAIN ANALYZE` to debug queries
3. Implement pagination
4. Cache frequently accessed data
5. Use Supabase CDN for static assets

---

## Advanced Configuration

### Custom Domain

1. **Go to Settings → Custom Domains**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Configure DNS records as shown
4. Update VITE_SUPABASE_URL in `.env.local`

### Database Functions

Create custom database functions for complex operations:

```sql
-- Example: Get task statistics
CREATE OR REPLACE FUNCTION get_task_stats(user_uuid UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT,
  overdue_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE state = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE state = 'in-progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE deadline < NOW() AND state != 'completed') as overdue_tasks
  FROM tasks
  WHERE user_id = user_uuid AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Database Triggers

Automatically update timestamps:

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Scaling Considerations

### Database Optimization

1. **Connection Pooling:**
   - Configured automatically by Supabase
   - Use `pgBouncer` for high-traffic apps

2. **Partitioning:**
   - Consider partitioning large tables by date
   - Example: Partition `calendar_events` by month

3. **Archiving:**
   - Move old completed tasks to archive table
   - Implement data retention policies

### Monitoring

1. **Set up alerts:**
   - Database CPU usage > 80%
   - Connection pool exhaustion
   - Slow query detection

2. **Log aggregation:**
   - Use Supabase logs
   - Export to external service (Datadog, etc.)

---

## Cost Optimization

### Free Tier Limits

- 500MB database space
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users

### Optimization Tips

1. **Database:**
   - Regular VACUUM operations
   - Archive old data
   - Optimize queries

2. **Storage:**
   - Compress images before upload
   - Delete unused files
   - Use CDN for static assets

3. **Bandwidth:**
   - Implement caching
   - Use pagination
   - Compress API responses

---

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)
- [OmniDesk Repository](https://github.com/ak-1344/OmniDesk)

---

## Next Steps

After completing this setup:

1. Review the [Data Configuration Guide](./data-configuration.md)
2. Explore the [Database Schema Documentation](./database-schema.sql)
3. Test all CRUD operations
4. Implement error handling
5. Set up monitoring and alerts
6. Deploy to production

For production deployment, see [Deployment Guide](./deployment.md) (coming soon).
