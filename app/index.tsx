import { EmptyState } from '@/components/EmptyState';
import { FloatingActionBar } from '@/components/FloatingActionBar';
import { NoteCard } from '@/components/NoteCard';
import { ReminderCard } from '@/components/ReminderCard';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { VoiceRecorderModal } from '@/components/VoiceRecorderModal';
import { useSearch } from '@/hooks/useSearch';
import { parseTranscript } from '@/services/aiParser';
import { scheduleReminder } from '@/services/notifications';
import { requestAllPermissions } from '@/services/permissions';
import { useNotesStore } from '@/stores/notesStore';
import { useRemindersStore } from '@/stores/remindersStore';
import type { Note, Reminder } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateOptionsDialog } from '@/components/CreateOptionsDialog';

export default function MainScreen() {
  const { notes, fetchAll: fetchNotes, isLoading: notesLoading } = useNotesStore();
  const {
    reminders, fetchAll: fetchReminders, markDone, isLoading: remindersLoading,
    create: createReminder, update: updateReminder,
  } = useRemindersStore();
  const { create: createNote } = useNotesStore();
  const { query, setQuery, filteredNotes, filteredReminders } = useSearch(notes, reminders);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isLoading = notesLoading || remindersLoading;

  const loadAll = useCallback(async () => {
    await Promise.all([fetchNotes(), fetchReminders()]);
  }, [fetchNotes, fetchReminders]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    // Request permissions on mount to ensure features work
    requestAllPermissions();
  }, []);

  const activeReminders = filteredReminders
    .filter((r) => !r.isDone)
    .sort((a, b) => a.dueAt - b.dueAt);

  const completedReminders = filteredReminders
    .filter((r) => r.isDone)
    .sort((a, b) => b.updatedAt - a.updatedAt); // Newest completed first

  type SectionData = { title: string; data: (Note | Reminder)[]; type: 'note' | 'reminder' | 'completed' };
  const sections: SectionData[] = [
    ...(activeReminders.length > 0
      ? [{ title: 'Reminders', data: activeReminders as (Note | Reminder)[], type: 'reminder' as const }]
      : []),
    ...(filteredNotes.length > 0
      ? [{ title: 'Notes', data: filteredNotes as (Note | Reminder)[], type: 'note' as const }]
      : []),
    ...(completedReminders.length > 0
      ? [{ title: 'Completed', data: completedReminders as (Note | Reminder)[], type: 'completed' as const }]
      : []),
  ];

  const handleCreateSelect = useCallback((type: 'note' | 'reminder') => {
    if (type === 'note') router.push('/note/new' as any);
    else router.push('/reminder/new' as any);
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
      if (section.type === 'reminder' || section.type === 'completed') {
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

  const hasContent = notes.length > 0 || reminders.length > 0;

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <View className="bg-canvas flex-row items-start justify-between px-6 pt-3 pb-4">
        <View>
          <View className="flex-row items-start justify-center bg-primary/10 w-20 border border-white/5 rounded-lg py-[1px]">
            <Text className="text-xl font-medium text-primary tracking-relaxed">Whisp.</Text>
          </View>

          <View className="flex-row items-start justify-center gap-2">
            <Text className="text-2xl font-medium text-white/70 tracking-relaxed leading-tighter">Make Your Day</Text>
            <View className="flex-row items-start justify-center bg-primary/10 w-30 px-1.5 border border-white/5 rounded-lg py-[1px]">
              <Text className="text-2xl font-medium text-primary tracking-relaxed leading-tighter">Productive</Text>
            </View>
          </View>

        </View>
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
          contentContainerStyle={{ paddingBottom: 90 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAll} tintColor="#5e6ad2" />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <FloatingActionBar onVoicePress={() => setIsVoiceModalOpen(true)} onAddPress={() => setIsCreateModalOpen(true)} />
      <VoiceRecorderModal
        visible={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={handleTranscript}
      />
      <CreateOptionsDialog
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelect={handleCreateSelect}
      />
    </SafeAreaView>
  );
}
