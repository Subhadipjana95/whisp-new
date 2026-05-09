import { Paths, File, Directory } from 'expo-file-system';
import uuid from 'react-native-uuid';
import type { AttachmentType } from '../types';

const ATTACHMENTS_DIR_NAME = 'attachments';

function getAttachmentsDir(): Directory {
  return new Directory(Paths.document, ATTACHMENTS_DIR_NAME);
}

export async function ensureAttachmentsDir(): Promise<void> {
  const dir = getAttachmentsDir();
  if (!dir.exists) {
    dir.create();
  }
}

/**
 * Copies a file from a temporary URI (picker result) to permanent app storage.
 * Returns the new permanent URI.
 */
export async function copyToAppStorage(
  tempUri: string,
  type: AttachmentType,
  originalName?: string
): Promise<{ uri: string; name: string }> {
  ensureAttachmentsDir();

  const ext = getExtension(tempUri, type, originalName);
  const filename = `${uuid.v4()}.${ext}`;

  const sourceFile = new File(tempUri);
  const destFile = new File(getAttachmentsDir(), filename);
  sourceFile.copy(destFile);

  const name = originalName ?? filename;
  return { uri: destFile.uri, name };
}

export async function deleteFromAppStorage(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('[FileManager] Delete failed:', error);
  }
}

function getExtension(uri: string, type: AttachmentType, originalName?: string): string {
  if (originalName) {
    const parts = originalName.split('.');
    if (parts.length > 1) return parts[parts.length - 1].toLowerCase();
  }
  const uriParts = uri.split('.');
  if (uriParts.length > 1) return uriParts[uriParts.length - 1].toLowerCase().split('?')[0];
  if (type === 'image') return 'jpg';
  if (type === 'audio') return 'm4a';
  return 'bin';
}
