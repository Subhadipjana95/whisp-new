import React, { memo } from 'react';
import { View, Text, SectionList, RefreshControl } from 'react-native';
import { ReminderCard } from './ReminderCard';
import type { Reminder } from '../types';
import { router } from 'expo-router';

interface RemindersSectionProps {
  activeReminders: Reminder[];
  completedReminders: Reminder[];
  isLoading: boolean;
  onRefresh: () => void;
  onMarkDone: (id: string) => void;
  screenWidth: number;
}

export const RemindersSection = memo(function RemindersSection({
  activeReminders,
  completedReminders,
  isLoading,
  onRefresh,
  onMarkDone,
  screenWidth,
}: RemindersSectionProps) {
  const sections = [
    ...(activeReminders.length > 0 ? [{ title: 'Upcoming', data: activeReminders, type: 'reminder' }] : []),
    ...(completedReminders.length > 0 ? [{ title: 'Completed', data: completedReminders, type: 'completed' }] : []),
  ];

  return (
    <View style={{ width: screenWidth }}>
      <SectionList
        sections={sections as any}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item as Reminder}
            onPress={() => router.push(`/reminder/${item.id}` as any)}
            onMarkDone={() => onMarkDone(item.id)}
          />
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
