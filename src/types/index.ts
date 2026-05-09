// src/types/index.ts

export type AttachmentType = 'image' | 'audio' | 'file';
export type ParentType = 'note' | 'reminder';
export type ThemeMode = 'light' | 'dark' | 'system';
export type ParsedEntityType = 'note' | 'reminder';

export interface Attachment {
  id: string;
  parentId: string;
  parentType: ParentType;
  type: AttachmentType;
  uri: string;          // absolute path in app's document directory
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: number;    // Unix timestamp ms
}

export interface Note {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  title: string;
  body: string;
  dueAt: number;              // Unix timestamp ms
  isDone: boolean;
  notificationId: string | null;
  attachments: Attachment[];
  createdAt: number;
  updatedAt: number;
}

export interface ParsedTranscriptResult {
  type: ParsedEntityType;
  title: string;
  body: string;
  dueAt: string | null;       // ISO 8601 or null
}

export interface AppSettings {
  theme: ThemeMode;
  openAiApiKey: string;
  anthropicApiKey: string;
  defaultReminderSound: boolean;
  hapticFeedback: boolean;
}
