import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format, isPast, isToday } from 'date-fns';
import type { Reminder } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface ReminderCardProps {
  reminder: Reminder;
  onPress: () => void;
  onMarkDone: () => void;
}

export const ReminderCard = memo(function ReminderCard({
  reminder,
  onPress,
  onMarkDone,
}: ReminderCardProps) {
  const dueDate = new Date(reminder.dueAt);
  const isOverdue = isPast(dueDate) && !reminder.isDone;
  const isDueToday = isToday(dueDate);

  const timeColor = reminder.isDone
    ? 'text-ink-tertiary'
    : isOverdue
    ? 'text-red-500'
    : isDueToday
    ? 'text-ink-muted'
    : 'text-ink-subtle';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Reminder: ${reminder.title}${reminder.isDone ? ' (Completed)' : ''}`}
      accessibilityHint="Double tap to open reminder"
      className={`bg-surface-1 rounded-lg p-6 mx-4 mb-3 border ${
        reminder.isDone
          ? 'border-hairline opacity-50'
          : 'border-hairline'
      }`}
    >
      <View className="flex-row items-start">
        <TouchableOpacity
          onPress={onMarkDone}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mr-3 mt-0.5"
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark ${reminder.title} as done`}
          accessibilityState={{ checked: reminder.isDone }}
        >
          <Ionicons
            name={reminder.isDone ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={reminder.isDone ? '#27a66f' : '#5e6ad2'}
          />
        </TouchableOpacity>

        <View className="flex-1">
          <Text
            className={`text-lg font-medium ${
              reminder.isDone
                ? ' text-ink-muted line-through opacity-80'
                : 'text-ink'
            }`}
            numberOfLines={1}
          >
            {reminder.title || 'Untitled reminder'}
          </Text>

          {reminder.body ? (
            <Text
              className="text-base text-ink-muted mt-2"
              numberOfLines={2}
            >
              {reminder.body}
            </Text>
          ) : null}

          <View className="flex-row items-center mt-4 gap-1">
            <Ionicons name="alarm-outline" size={14} color={isOverdue ? '#ef4444' : '#8a8f98'} />
            <Text className={`text-sm ${timeColor}`}>
              {format(dueDate, 'MMM d, yyyy · h:mm a')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
