import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default(''),
  body: text('body').notNull().default(''),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  updatedAtIdx: index('notes_updated_at_idx').on(table.updatedAt),
}));

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  title: text('title').notNull().default(''),
  body: text('body').notNull().default(''),
  dueAt: integer('due_at').notNull(),
  isDone: integer('is_done', { mode: 'boolean' }).notNull().default(false),
  notificationId: text('notification_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => ({
  dueAtIdx: index('reminders_due_at_idx').on(table.dueAt),
  isDoneIdx: index('reminders_is_done_idx').on(table.isDone),
}));

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').notNull(),
  parentType: text('parent_type', { enum: ['note', 'reminder'] }).notNull(),
  type: text('type', { enum: ['image', 'audio', 'file'] }).notNull(),
  uri: text('uri').notNull(),
  name: text('name').notNull().default(''),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  createdAt: integer('created_at').notNull(),
}, (table) => ({
  parentIdx: index('attachments_parent_idx').on(table.parentId, table.parentType),
}));
