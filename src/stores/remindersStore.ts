import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { reminders, attachments } from '../db/schema';
import type { Reminder, Attachment } from '../types';
import uuid from 'react-native-uuid';
import { cancelNotification } from '../services/notifications';

interface RemindersState {
  reminders: Reminder[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Pick<Reminder, 'title' | 'body' | 'dueAt'>) => Promise<Reminder>;
  update: (id: string, data: Partial<Pick<Reminder, 'title' | 'body' | 'dueAt' | 'notificationId'>>) => Promise<void>;
  markDone: (id: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  addAttachment: (attachment: Omit<Attachment, 'createdAt'>) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
}

export const useRemindersStore = create<RemindersState>((set, get) => ({
  reminders: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawReminders = await db
        .select()
        .from(reminders)
        .orderBy(desc(reminders.dueAt));

      const rawAttachments = await db.select().from(attachments);

      const remindersWithAttachments: Reminder[] = rawReminders.map((r) => ({
        ...r,
        isDone: Boolean(r.isDone),
        notificationId: r.notificationId ?? null,
        attachments: rawAttachments
          .filter((a) => a.parentId === r.id && a.parentType === 'reminder')
          .map((a) => ({
            ...a,
            type: a.type as Attachment['type'],
            parentType: 'reminder' as const,
          })),
      }));

      set({ reminders: remindersWithAttachments, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      console.error('[RemindersStore.fetchAll]', error);
    }
  },

  create: async (data) => {
    const now = Date.now();
    const newReminder: Reminder = {
      id: uuid.v4() as string,
      title: data.title,
      body: data.body,
      dueAt: data.dueAt,
      isDone: false,
      notificationId: null,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(reminders).values({
      ...newReminder,
      notificationId: null,
    });

    set((state) => ({ reminders: [newReminder, ...state.reminders] }));
    return newReminder;
  },

  update: async (id, data) => {
    const now = Date.now();
    await db
      .update(reminders)
      .set({ ...data, updatedAt: now })
      .where(eq(reminders.id, id));

    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: now } : r
      ),
    }));
  },

  markDone: async (id) => {
    const now = Date.now();
    const reminder = get().reminders.find((r) => r.id === id);
    if (reminder?.notificationId) {
      await cancelNotification(reminder.notificationId);
    }

    await db
      .update(reminders)
      .set({ isDone: true, updatedAt: now, notificationId: null })
      .where(eq(reminders.id, id));

    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, isDone: true, updatedAt: now, notificationId: null } : r
      ),
    }));
  },

  delete: async (id) => {
    const reminder = get().reminders.find((r) => r.id === id);
    if (reminder?.notificationId) {
      await cancelNotification(reminder.notificationId);
    }
    await db.delete(attachments).where(eq(attachments.parentId, id));
    await db.delete(reminders).where(eq(reminders.id, id));
    set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
  },

  addAttachment: async (attachment) => {
    const record = { ...attachment, createdAt: Date.now() };
    await db.insert(attachments).values({
      ...record,
      parentType: record.parentType as 'note' | 'reminder',
      type: record.type as 'image' | 'audio' | 'file',
    });
    await get().fetchAll();
  },

  removeAttachment: async (attachmentId) => {
    await db.delete(attachments).where(eq(attachments.id, attachmentId));
    await get().fetchAll();
  },
}));
