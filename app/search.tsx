import { EmptyState } from '@/components/EmptyState';
import { NoteCard } from '@/components/NoteCard';
import { ReminderCard } from '@/components/ReminderCard';
import { SearchBar } from '@/components/SearchBar';
import { useSearch } from '@/hooks/useSearch';
import { useNotesStore } from '@/stores/notesStore';
import { useRemindersStore } from '@/stores/remindersStore';
import type { Note, Reminder } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const { notes, fetchAll: fetchNotes } = useNotesStore();
  const { reminders, fetchAll: fetchReminders, markDone } = useRemindersStore();
  const { query, setQuery, filteredNotes, filteredReminders } = useSearch(notes, reminders);

  useEffect(() => {
    fetchNotes();
    fetchReminders();
  }, [fetchNotes, fetchReminders]);

  const activeReminders = filteredReminders
    .filter((r) => !r.isDone)
    .sort((a, b) => a.dueAt - b.dueAt);

  const completedReminders = filteredReminders
    .filter((r) => r.isDone)
    .sort((a, b) => b.updatedAt - a.updatedAt);

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

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center px-4 pt-6">
        <TouchableOpacity onPress={() => router.back()} className="mr-1 mb-1">
          <Ionicons name="arrow-back" size={26} color="#5a5a5a" />
        </TouchableOpacity>
        <View className="flex-1 mt-1.5">
           <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
        </View>
      </View>

      {query.length === 0 ? (
        <View className="flex-1 justify-center">
          <EmptyState 
            icon="search-outline" 
            title="Search your thoughts" 
            subtitle="Find notes and reminders instantly" 
          />
        </View>
      ) : sections.length === 0 ? (
        <View className="flex-1 justify-center">
          <EmptyState 
            icon="search-outline" 
            title="No results found" 
            subtitle={`No matches for "${query}"`} 
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text className="text-sm font-medium text-ink-subtle tracking-wide px-6 py-3">
              {section.title}
            </Text>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
