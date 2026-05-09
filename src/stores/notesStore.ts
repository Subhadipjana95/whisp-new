import { create } from 'zustand';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { notes, attachments } from '../db/schema';
import type { Note, Attachment } from '../types';
import uuid from 'react-native-uuid';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Pick<Note, 'title' | 'body'>) => Promise<Note>;
  update: (id: string, data: Partial<Pick<Note, 'title' | 'body' | 'isPinned'>>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  addAttachment: (attachment: Omit<Attachment, 'createdAt'>) => Promise<void>;
  removeAttachment: (attachmentId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const rawNotes = await db
        .select()
        .from(notes)
        .orderBy(desc(notes.updatedAt));

      const rawAttachments = await db.select().from(attachments);

      const notesWithAttachments: Note[] = rawNotes.map((n) => ({
        ...n,
        isPinned: Boolean(n.isPinned),
        attachments: rawAttachments
          .filter((a) => a.parentId === n.id && a.parentType === 'note')
          .map((a) => ({
            ...a,
            type: a.type as Attachment['type'],
            parentType: 'note' as const,
          })),
      }));

      set({ notes: notesWithAttachments, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      set({ error: message, isLoading: false });
      console.error('[NotesStore.fetchAll]', error);
    }
  },

  create: async (data) => {
    const now = Date.now();
    const newNote: Note = {
      id: uuid.v4() as string,
      title: data.title,
      body: data.body,
      isPinned: false,
      attachments: [],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(notes).values({
      id: newNote.id,
      title: newNote.title,
      body: newNote.body,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });

    set((state) => ({ notes: [newNote, ...state.notes] }));
    return newNote;
  },

  update: async (id, data) => {
    const now = Date.now();
    await db
      .update(notes)
      .set({ ...data, updatedAt: now })
      .where(eq(notes.id, id));

    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...data, updatedAt: now } : n
      ),
    }));
  },

  delete: async (id) => {
    await db.delete(attachments).where(eq(attachments.parentId, id));
    await db.delete(notes).where(eq(notes.id, id));
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
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
