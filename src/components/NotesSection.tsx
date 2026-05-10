import React, { memo } from 'react';
import { View, Text, SectionList, RefreshControl } from 'react-native';
import { NoteCard } from './NoteCard';
import type { Note } from '../types';
import { router } from 'expo-router';

interface NotesSectionProps {
  notes: Note[];
  isLoading: boolean;
  onRefresh: () => void;
  screenWidth: number;
}

export const NotesSection = memo(function NotesSection({
  notes,
  isLoading,
  onRefresh,
  screenWidth,
}: NotesSectionProps) {
  return (
    <View style={{ width: screenWidth }}>
      <SectionList
        sections={(notes.length > 0 ? [{ title: 'Notes', data: notes, type: 'note' }] : []) as any}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NoteCard note={item as Note} onPress={() => router.push(`/note/${item.id}` as any)} />
        )}
        renderSectionHeader={({ section }) => (
          <Text className="text-sm font-medium text-ink-subtle tracking-wide px-6 py-3">
            {section.title}
          </Text>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#5e6ad2" />}
      />
    </View>
  );
});
