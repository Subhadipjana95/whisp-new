import React, { useState, useCallback, useLayoutEffect } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useNotesStore } from '@/stores/notesStore';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AttachmentPicker } from '@/components/AttachmentPicker';
import { AttachmentPreview } from '@/components/AttachmentPreview';

const sanitize = (text: string) => text.replace(/^\n+/, '').replace(/\n{3,}/g, '\n\n');

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { notes, create, update, delete: deleteNote } = useNotesStore();
  const existingNote = notes.find((n) => n.id === id);
  const isNew = id === 'new';

  const [title, setTitle] = useState(existingNote?.title ?? '');
  const [body, setBody] = useState(existingNote?.body ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleTitleChange = useCallback((text: string) => { setTitle(sanitize(text)); setIsDirty(true); }, []);
  const handleBodyChange = useCallback((text: string) => { setBody(sanitize(text)); setIsDirty(true); }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty && !isNew) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const note = await create({ title: title.trim() || 'Untitled', body });
        router.replace(`/note/${note.id}` as any);
      } else if (existingNote) {
        await update(existingNote.id, { title: title.trim() || 'Untitled', body });
      }
      setIsDirty(false);
    } catch (error) {
      console.error('[NoteScreen.handleSave]', error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, isNew, title, body, create, update, existingNote]);

  const handleDelete = useCallback(async () => {
    if (!existingNote) return;
    await deleteNote(existingNote.id);
    router.back();
  }, [existingNote, deleteNote]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16 }}>
          {!isNew && existingNote && (
            <AttachmentPicker parentId={existingNote.id} parentType="note" mode="minimal" />
          )}
          {!isNew && (
            <TouchableOpacity onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setShowDeleteDialog(true);
            }} className='bg-neutral-400 dark:bg-neutral-800 px-2 py-2 rounded-lg border border-white/5'>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
          {isDirty && (
            <TouchableOpacity onPress={handleSave} disabled={isSaving} className='bg-neutral-400 dark:bg-neutral-800 px-2 py-2 rounded-lg border border-white/5'>
              <Text style={{ color: '#5e6ad2', fontWeight: '600', fontSize: 16 }}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, isNew, isDirty, isSaving, handleSave]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['bottom']}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView className="flex-1 px-4" keyboardDismissMode="interactive" showsVerticalScrollIndicator={false}>
          <TextInput
            className="text-4xl font-medium text-white/70"
            value={title} onChangeText={handleTitleChange}
            placeholder="Title" placeholderTextColor="#8a8f98" multiline returnKeyType="next"
          />
          {existingNote && (
            <Text className="text-xs text-ink-subtle mb-4 ml-2 -mt-2">
              {format(existingNote.updatedAt, 'MMM d, yyyy · h:mm a')}
            </Text>
          )}
          <TextInput
            className="text-lg text-ink-subtle leading-relaxed min-h-[300px] bg-surface-1 rounded-xl px-6 py-3 border border-white/5 mb-12"
            value={body} onChangeText={handleBodyChange}
            placeholder="Start writing your note..." placeholderTextColor="#8a8f98"
            multiline textAlignVertical="top"
          />
          {existingNote && (
            <AttachmentPreview attachments={existingNote.attachments} parentId={existingNote.id} parentType="note" />
          )}
          <View className="h-4" />
        </ScrollView>
      </KeyboardAvoidingView>
      <ConfirmDialog
        visible={showDeleteDialog} title="Delete Note"
        message="This note will be permanently deleted. This action cannot be undone."
        confirmText="Delete" destructive onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </SafeAreaView>
  );
}
