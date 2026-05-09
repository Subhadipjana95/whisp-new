import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/stores/notesStore';
import { useRemindersStore } from '@/stores/remindersStore';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/NoteCard';
import { ReminderCard } from '@/components/ReminderCard';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VoiceRecorderModal } from '@/components/VoiceRecorderModal';
import { useSearch } from '@/hooks/useSearch';
import { parseTranscript } from '@/services/aiParser';
import { scheduleReminder } from '@/services/notifications';
import { requestAllPermissions } from '@/services/permissions';
import type { Note, Reminder } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MainScreen() {
  const { notes, fetchAll: fetchNotes, isLoading: notesLoading } = useNotesStore();
  const {
    reminders, fetchAll: fetchReminders, markDone, isLoading: remindersLoading,
    create: createReminder, update: updateReminder,
  } = useRemindersStore();
  const { create: createNote } = useNotesStore();
  const { query, setQuery, filteredNotes, filteredReminders } = useSearch(notes, reminders);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const isLoading = notesLoading || remindersLoading;

  const loadAll = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchReminders()]);
  }, [fetchNotes, fetchReminders]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    AsyncStorage.getItem('permissions_requested').then((requested) => {
      if (!requested) {
        requestAllPermissions().then(() => {
          AsyncStorage.setItem('permissions_requested', 'true');
        });
      }
    });
  }, []);

  const activeReminders = filteredReminders
    .filter((r) => !r.isDone)
    .sort((a, b) => a.dueAt - b.dueAt);

  type SectionData = { title: string; data: (Note | Reminder)[]; type: 'note' | 'reminder' };
  const sections: SectionData[] = [
    ...(activeReminders.length > 0
      ? [{ title: 'Reminders', data: activeReminders as (Note | Reminder)[], type: 'reminder' as const }]
      : []),
    ...(filteredNotes.length > 0
      ? [{ title: 'Notes', data: filteredNotes as (Note | Reminder)[], type: 'note' as const }]
      : []),
  ];

  const handleAddPress = useCallback(() => {
    Alert.alert('Create', 'What would you like to create?', [
      { text: 'Note', onPress: () => router.push('/note/new' as any) },
      { text: 'Reminder', onPress: () => router.push('/reminder/new' as any) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, []);

  const handleTranscript = useCallback(async (transcript: string) => {
    try {
      const parsed = await parseTranscript(transcript);
      if (parsed.type === 'reminder' && parsed.dueAt) {
        const dueAt = new Date(parsed.dueAt).getTime();
        if (dueAt > Date.now()) {
          const reminder = await createReminder({ title: parsed.title, body: parsed.body, dueAt });
          try {
            const notifId = await scheduleReminder({ ...reminder, dueAt });
            await updateReminder(reminder.id, { notificationId: notifId });
          } catch { /* notification scheduling is best-effort */ }
          router.push(`/reminder/${reminder.id}` as any);
          return;
        }
      }
      const note = await createNote({ title: parsed.title, body: parsed.body });
      router.push(`/note/${note.id}` as any);
    } catch (error) {
      Alert.alert('Conversion Failed',
        error instanceof Error ? error.message : 'Failed to process your voice note.');
      console.error('[MainScreen.handleTranscript]', error);
    }
  }, [createNote, createReminder, updateReminder]);

  const renderItem = useCallback(
    ({ item, section }: { item: Note | Reminder; section: SectionData }) => {
      if (section.type === 'reminder') {
        const reminder = item as Reminder;
        return (
          <ReminderCard
            reminder={reminder}
            onPress={() => router.push(`/reminder/${reminder.id}` as any)}
            onMarkDone={() => markDone(reminder.id)}
          />
        );
      }
      const note = item as Note;
      return <NoteCard note={note} onPress={() => router.push(`/note/${note.id}` as any)} />;
    },
    [markDone]
  );

  const hasContent = notes.length > 0 || reminders.filter((r) => !r.isDone).length > 0;

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row items-center justify-between px-6 pt-6 pb-4">
        <Text className="text-3xl font-bold text-ink tracking-tight">Whisp</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#8a8f98" />
        </TouchableOpacity>
      </View>
      <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
      {isLoading && !hasContent ? (
        <SkeletonLoader count={4} />
      ) : !hasContent ? (
        <EmptyState icon="document-text-outline" title="No notes yet" subtitle="Tap Voice or New to get started" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text className="text-xs font-semibold text-ink-subtle uppercase tracking-widest px-6 py-3">
              {section.title}
            </Text>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} tintColor="#5e6ad2" />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <FloatingActionBar onVoicePress={() => setIsVoiceModalOpen(true)} onAddPress={handleAddPress} />
      <VoiceRecorderModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={handleTranscript}
      />
    </SafeAreaView>
  );
}
