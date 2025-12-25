OmniDesk — NoSQL Database Schema (MongoDB)

Design Philosophy: OmniDesk is a personal thinking & execution environment.
This schema prioritizes reversibility, fluid structure, and psychological safety.
Nothing is permanent unless the user decides it should be.

Table of Contents

Users Collection

Domains Collection

Buckets (States) Collection

Nodes Collection

Canvases Collection

Canvas Elements Collection

Time Blocks Collection

Trash Collection

Settings Collection

Relationships & Data Flow

Indexes & Performance

Data Validation Rules

Migration & Versioning

Security Considerations

Scalability Notes

Backup & Export

Summary

1. Users Collection

Collection Name: users

Purpose: Store authentication and minimal identity metadata.
All behavioral preferences live elsewhere.

{
  _id: ObjectId,

  email: String,              // unique, indexed
  username: String,
  passwordHash: String,

  createdAt: Date,
  lastLoginAt: Date,
  isActive: Boolean
}


Indexes:

email (unique)

Comments:

Keep this collection lean

No UI or workflow preferences stored here

OAuth-ready by design

2. Domains Collection

Collection Name: domains

Purpose: User-defined life areas (College, Health, Startup, etc.)
Domains are soft concepts and fully trashable.

{
  _id: ObjectId,
  userId: ObjectId,

  name: String,
  description: String,
  color: String,
  icon: String,
  order: Number,

  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

userId

userId + order

Comments:

Trashing a domain does NOT delete nodes

Nodes referencing a trashed domain fall back to “Unassigned”

Domains are optional, not mandatory

3. Buckets (States) Collection

Collection Name: buckets

Purpose: Mental state groupings (Thinking, Doing, Stuck, Done).
Buckets are not workflows — they are visual and psychological.

{
  _id: ObjectId,
  userId: ObjectId,

  name: String,
  description: String,
  color: String,
  order: Number,
  isFinal: Boolean,

  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

userId

userId + order

Comments:

Buckets can be freely reordered

Trashing a bucket does not delete nodes

Nodes may exist without a bucket

4. Nodes Collection

Collection Name: nodes

Purpose: The core entity of OmniDesk.
Ideas, tasks, subtasks, notes — all are nodes.

{
  _id: ObjectId,
  userId: ObjectId,

  // Identity
  type: "idea" | "task" | "note" | "log",
  title: String,
  content: String,                    // markdown / freeform

  // Classification
  domainId: ObjectId,                 // nullable
  bucketId: ObjectId,                 // nullable

  // Commitment Layer (optional)
  commitment: {
    enabled: Boolean,
    priority: "low" | "medium" | "high",
    deadline: Date,
    completedAt: Date
  },

  // Relationships
  parentId: ObjectId,                 // enables subtasks
  links: [{
    nodeId: ObjectId,
    type: "depends_on" | "related"
  }],

  // Time Projection (optional)
  schedule: {
    start: Date,
    end: Date
  },

  // UI State
  isPinned: Boolean,

  // Lifecycle
  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastTouchedAt: Date
}


Indexes:

userId

userId + bucketId

userId + domainId

userId + commitment.deadline

parentId

Comments:

Subtasks are nodes with parentId

Ideas become tasks by enabling commitment

No rigid hierarchy — graph relationships supported

Nodes are always recoverable via Trash

5. Canvases Collection

Collection Name: canvases

Purpose: Infinite thinking boards for spatial reasoning.

{
  _id: ObjectId,
  userId: ObjectId,

  title: String,

  viewport: {
    x: Number,
    y: Number,
    zoom: Number
  },

  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

userId

Comments:

Canvases are optional

Trashing a canvas does not delete nodes

Canvas is a view, not ownership

6. Canvas Elements Collection

Collection Name: canvasElements

Purpose: Visual representations of nodes on a canvas.

{
  _id: ObjectId,

  canvasId: ObjectId,
  nodeId: ObjectId,                   // links to nodes

  type: "card" | "image" | "connector",

  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    zIndex: Number
  },

  style: Object,

  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

canvasId

nodeId

Comments:

Same node can appear on multiple canvases

Deleting an element never deletes the node

Connectors allow node-to-node relationships

7. Time Blocks Collection

Collection Name: timeBlocks

Purpose: Calendar projections of attention and work.

{
  _id: ObjectId,
  userId: ObjectId,

  nodeId: ObjectId,

  start: Date,
  end: Date,
  type: "planned" | "actual",

  lifecycle: {
    status: "active" | "trashed",
    trashedAt: Date
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

userId + start

nodeId

Comments:

Calendar is a derived view

Time blocks may exist without deadlines

Supports retrospective analysis

8. Trash Collection

Collection Name: trash

Purpose: Universal reversible deletion for all entities.

{
  _id: ObjectId,
  userId: ObjectId,

  entityType:
    "node" |
    "domain" |
    "bucket" |
    "canvas" |
    "canvasElement" |
    "timeBlock" |
    "settings",

  entityId: ObjectId,
  snapshot: Object,                 // full original document

  trashedAt: Date,
  purgeAt: Date,
  restoredAt: Date
}


Indexes:

userId + trashedAt

purgeAt

Comments:

Drag-to-trash always creates a snapshot

Restore = reinsert snapshot + reset lifecycle

Purge = irreversible hard delete

One trash system for everything

9. Settings Collection

Collection Name: settings

Purpose: Behavioral and default configuration.
Even settings are resettable.

{
  _id: ObjectId,
  userId: ObjectId,

  defaults: {
    domainId: ObjectId,
    bucketId: ObjectId
  },

  behavior: {
    softDeadlines: Boolean,
    autoArchive: Boolean,
    allowLooseThoughts: Boolean
  },

  lifecycle: {
    status: "active" | "trashed"
  },

  createdAt: Date,
  updatedAt: Date
}


Indexes:

userId (unique)

Comments:

One settings document per user

Trashing resets to system defaults

No irreversible configuration

Relationships & Data Flow
USER (1)
 ├── DOMAINS (n)
 ├── BUCKETS (n)
 ├── NODES (n)
 │     ├── parent → NODES
 │     ├── linked → NODES
 │     └── projected to → TIME BLOCKS
 ├── CANVASES (n)
 │     └── CANVAS ELEMENTS (n → NODES)
 ├── TIME BLOCKS (n)
 ├── TRASH (n)
 └── SETTINGS (1)

Indexes & Performance
Core Indexes
db.nodes.createIndex({ userId: 1, bucketId: 1 });
db.nodes.createIndex({ userId: 1, domainId: 1 });
db.nodes.createIndex({ userId: 1, "commitment.deadline": 1 });
db.nodes.createIndex({ parentId: 1 });

db.trash.createIndex({ userId: 1, trashedAt: -1 });
db.trash.createIndex({ purgeAt: 1 });

Data Validation Rules
db.createCollection("nodes", {
  validator: {
    $jsonSchema: {
      required: ["userId", "type", "lifecycle"],
      properties: {
        type: { enum: ["idea", "task", "note", "log"] },
        lifecycle: {
          properties: {
            status: { enum: ["active", "trashed"] }
          }
        }
      }
    }
  }
});

Migration & Versioning
{
  schemaVersion: 1
}


Additive changes preferred

Breaking changes via migration scripts

Trash enables safe experimentation

Security Considerations

Every query scoped by userId

Trash prevents accidental loss

No public data surface

Snapshots enable auditability

Scalability Notes

Natural shard key: userId

Node-centric model scales horizontally

Works for 10 → 100k nodes per user

Backup & Export
{
  user,
  domains,
  buckets,
  nodes,
  canvases: [
    { canvas, elements }
  ],
  timeBlocks,
  settings
}

Summary

This schema is:

✅ Unified — one core entity (nodes)
✅ Reversible — everything can be trashed & restored
✅ Mind-first — structure appears only when needed
✅ Safe — no destructive actions by default
✅ Scalable — user-partitioned, index-optimized

OmniDesk is not a task manager.
It’s a place where thinking is allowed to exist safely.