import { getDatabase, connectToDatabase, closeDatabaseConnection } from '../config/database';

const DEFAULT_USER_ID = 'default-user';

// Default domains based on the idea.md and implementation.md
const defaultDomains = [
  { name: 'College', color: '#3B82F6', description: 'Academic work and studies' },
  { name: 'Startup', color: '#10B981', description: 'Entrepreneurship and business ventures' },
  { name: 'Health', color: '#EF4444', description: 'Physical and mental wellbeing' },
  { name: 'Personal', color: '#8B5CF6', description: 'Personal projects and hobbies' },
];

// Default kanban columns for tasks
const defaultKanbanColumns = [
  { id: 'gotta-start', label: 'Exploring', color: '#3b82f6', order: 0 },
  { id: 'paused', label: 'Shaping', color: '#8b5cf6', order: 1 },
  { id: 'in-progress', label: 'Doing', color: '#f97316', order: 2 },
  { id: 'completed', label: 'Done', color: '#22c55e', order: 3 },
];

// Default kanban columns for subtasks
const defaultSubtaskKanbanColumns = [
  { id: 'todo', label: 'To Do', color: '#6b7280', order: 0 },
  { id: 'in-progress', label: 'In Progress', color: '#f97316', order: 1 },
  { id: 'completed', label: 'Done', color: '#22c55e', order: 2 },
];

async function seedDatabase() {
  try {
    await connectToDatabase();
    const db = getDatabase();

    console.log('🌱 Starting database seed...');

    // Seed domains
    const domainsCollection = db.collection('domains');
    const existingDomains = await domainsCollection.countDocuments({ user_id: DEFAULT_USER_ID });

    let domainIds: string[] = [];
    if (existingDomains === 0) {
      const domainsToInsert = defaultDomains.map(domain => ({
        ...domain,
        user_id: DEFAULT_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const result = await domainsCollection.insertMany(domainsToInsert);
      domainIds = Object.values(result.insertedIds).map(id => id.toString());
      console.log(`✓ Created ${domainsToInsert.length} default domains`);
    } else {
      console.log(`✓ Domains already exist (${existingDomains} found)`);
      const domains = await domainsCollection.find({ user_id: DEFAULT_USER_ID }).toArray();
      domainIds = domains.map(d => d._id.toString());
    }

    // Create default settings with complete schema
    const settingsCollection = db.collection('user_settings');
    const existingSettings = await settingsCollection.findOne({ user_id: DEFAULT_USER_ID });

    if (!existingSettings) {
      await settingsCollection.insertOne({
        user_id: DEFAULT_USER_ID,
        theme: 'dark',
        default_view: 'dashboard',
        date_format: 'YYYY-MM-DD',
        week_starts_on: 'monday',
        notifications: {
          email: false,
          desktop: true,
          taskReminders: true,
        },
        trash_retention_days: 30,
        kanban_columns: defaultKanbanColumns,
        subtask_kanban_columns: defaultSubtaskKanbanColumns,
        user: {
          name: 'User',
          email: '',
          avatar: '',
        },
        domain_order: domainIds,
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✓ Created default user settings (with kanban columns and user profile)');
    } else {
      // Update existing settings with missing fields
      const updateFields: any = {};
      if (!existingSettings.kanban_columns) {
        updateFields.kanban_columns = defaultKanbanColumns;
      }
      if (!existingSettings.subtask_kanban_columns) {
        updateFields.subtask_kanban_columns = defaultSubtaskKanbanColumns;
      }
      if (!existingSettings.user) {
        updateFields.user = { name: 'User', email: '', avatar: '' };
      }
      if (!existingSettings.domain_order) {
        updateFields.domain_order = domainIds;
      }
      
      if (Object.keys(updateFields).length > 0) {
        updateFields.updated_at = new Date();
        await settingsCollection.updateOne(
          { user_id: DEFAULT_USER_ID },
          { $set: updateFields }
        );
        console.log('✓ Updated existing settings with missing fields');
      } else {
        console.log('✓ User settings already exist and are complete');
      }
    }

    // Create sample idea to demonstrate the system
    const ideasCollection = db.collection('ideas');
    const existingIdeas = await ideasCollection.countDocuments({ user_id: DEFAULT_USER_ID });

    if (existingIdeas === 0) {
      await ideasCollection.insertOne({
        user_id: DEFAULT_USER_ID,
        title: 'Welcome to OmniDesk',
        color: '#FEF3C7',
        notes: [
          {
            id: '1',
            type: 'text',
            content: 'OmniDesk is your personal thinking & execution environment. Start by exploring ideas here, and convert them to tasks when you\'re ready to commit.',
            created_at: new Date(),
            order: 1,
          },
        ],
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✓ Created welcome idea');
    } else {
      console.log(`✓ Ideas already exist (${existingIdeas} found)`);
    }

    console.log('\n✨ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
