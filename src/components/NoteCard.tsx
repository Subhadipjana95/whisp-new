import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import type { Note } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
}

export const NoteCard = memo(function NoteCard({ note, onPress }: NoteCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Note: ${note.title}`}
      accessibilityHint="Double tap to open note"
      className="bg-surface-1 rounded-lg p-6 mx-4 mb-3 border border-hairline"
    >
      <View className="flex-row items-start justify-between">
        <Text
          className="text-lg font-medium text-ink flex-1 mr-2"
          numberOfLines={1}
        >
          {note.title || 'Untitled'}
        </Text>
        {note.isPinned && (
          <Ionicons name="pin" size={14} color="#5e6ad2" />
        )}
      </View>

      {note.body ? (
        <Text
          className="text-base text-ink-muted mt-2"
          numberOfLines={2}
        >
          {note.body}
        </Text>
      ) : null}

      <View className="flex-row items-center justify-between mt-4">
        <Text className="text-sm text-ink-subtle">
          {format(note.updatedAt, 'MMM d, yyyy')}
        </Text>
        {note.attachments.length > 0 && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="attach" size={14} color="#8a8f98" />
            <Text className="text-sm text-ink-subtle">{note.attachments.length}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});
