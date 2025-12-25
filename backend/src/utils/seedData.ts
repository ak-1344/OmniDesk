import { getDatabase, connectToDatabase, closeDatabaseConnection } from '../config/database';

const DEFAULT_USER_ID = 'default-user';

// Default domains based on the idea.md and implementation.md
const defaultDomains = [
  { name: 'College', color: '#3B82F6', description: 'Academic work and studies' },
  { name: 'Startup', color: '#10B981', description: 'Entrepreneurship and business ventures' },
  { name: 'Health', color: '#EF4444', description: 'Physical and mental wellbeing' },
  { name: 'Personal', color: '#8B5CF6', description: 'Personal projects and hobbies' },
];

// Default task states (buckets) - based on mental states, not rigid workflows
const defaultTaskStates = [
  { name: 'Gotta Start', color: '#FCD34D', description: 'Things I need to begin', order: 1, isFinal: false },
  { name: 'In Progress', color: '#60A5FA', description: 'Currently working on', order: 2, isFinal: false },
  { name: 'Nearly Done', color: '#34D399', description: 'Almost finished', order: 3, isFinal: false },
  { name: 'Paused', color: '#F59E0B', description: 'On hold for now', order: 4, isFinal: false },
  { name: 'Completed', color: '#10B981', description: 'Finished and done', order: 5, isFinal: true },
];

async function seedDatabase() {
  try {
    await connectToDatabase();
    const db = getDatabase();

    console.log('🌱 Starting database seed...');

    // Seed domains
    const domainsCollection = db.collection('domains');
    const existingDomains = await domainsCollection.countDocuments({ user_id: DEFAULT_USER_ID });

    if (existingDomains === 0) {
      const domainsToInsert = defaultDomains.map(domain => ({
        ...domain,
        user_id: DEFAULT_USER_ID,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await domainsCollection.insertMany(domainsToInsert);
      console.log(`✓ Created ${domainsToInsert.length} default domains`);
    } else {
      console.log(`✓ Domains already exist (${existingDomains} found)`);
    }

    // Seed task states (buckets)
    const bucketsCollection = db.collection('buckets');
    const existingBuckets = await bucketsCollection.countDocuments({ user_id: DEFAULT_USER_ID });

    if (existingBuckets === 0) {
      const bucketsToInsert = defaultTaskStates.map(state => ({
        ...state,
        user_id: DEFAULT_USER_ID,
        lifecycle: { status: 'active' },
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await bucketsCollection.insertMany(bucketsToInsert);
      console.log(`✓ Created ${bucketsToInsert.length} default task states`);
    } else {
      console.log(`✓ Task states already exist (${existingBuckets} found)`);
    }

    // Create default settings
    const settingsCollection = db.collection('user_settings');
    const existingSettings = await settingsCollection.findOne({ user_id: DEFAULT_USER_ID });

    if (!existingSettings) {
      await settingsCollection.insertOne({
        user_id: DEFAULT_USER_ID,
        defaults: {
          domainId: null,
          bucketId: null,
        },
        behavior: {
          softDeadlines: true,
          autoArchive: false,
          allowLooseThoughts: true,
        },
        theme: 'dark',
        defaultView: 'dashboard',
        dateFormat: 'YYYY-MM-DD',
        weekStartsOn: 'monday',
        notifications: {
          email: false,
          desktop: true,
          taskReminders: true,
        },
        trashRetentionDays: 30,
        lifecycle: { status: 'active' },
        created_at: new Date(),
        updated_at: new Date(),
      });
      console.log('✓ Created default user settings');
    } else {
      console.log('✓ User settings already exist');
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
