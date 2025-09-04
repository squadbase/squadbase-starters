import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  instructions: text('instructions'),
  memoryMode: text('memory_mode', { enum: ['project-only', 'default'] }).default('default').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
}));

export const threads = pgTable('threads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at').defaultNow().notNull(),
}, (table) => ({
  lastMessageIdx: index('last_message_idx').on(table.lastMessageAt),
  projectIdx: index('project_idx').on(table.projectId),
}));

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull().references(() => threads.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  threadIdx: index('thread_idx').on(table.threadId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;