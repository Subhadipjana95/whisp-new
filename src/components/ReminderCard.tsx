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
    ? 'text-ink-muted'
    : isOverdue
    ? 'text-red-500'
    : isDueToday
    ? 'text-ink-muted'
    : 'text-ink-subtle';

  const iconColor = isOverdue ? '#ef4444' : reminder.isDone ? '#d0d6e0' : '#8a8f98';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Reminder: ${reminder.title}${reminder.isDone ? ' (Completed)' : ''}`}
      accessibilityHint="Double tap to open reminder"
      className={`bg-surface-1 rounded-3xl px-4 py-6 mx-4 mb-3 border ${
        reminder.isDone
          ? 'border-hairline opacity-70'
          : 'border-white/10'
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
            className={` font-medium ${
              reminder.isDone
                ? 'text-xl text-ink-muted line-through'
                : 'text-white/70 text-2xl'
            }`}
            numberOfLines={1}
          >
            {reminder.title || 'Untitled reminder'}
          </Text>

          {reminder.body ? (
            <Text
              className="text-base text-ink-muted mt-2 leading-tight"
              numberOfLines={2}
            >
              {reminder.body}
            </Text>
          ) : null}

          <View className="flex-row items-center mt-4 gap-2">
            <View className="flex-row items-center gap-1.5 bg-primary/10 px-3 py-[4px] rounded-full border border-white/10">
              <Ionicons name="calendar-outline" size={12} color={iconColor} />
              <Text className={`text-xs font-medium ${timeColor}`}>
                {format(dueDate, 'MMM d, yyyy')}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 bg-primary/10 px-3 py-[4px] rounded-full border border-white/10">
              <Ionicons name="time-outline" size={12} color={iconColor} />
              <Text className={`text-xs font-medium ${timeColor}`}>
                {format(dueDate, 'h:mm a')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});
