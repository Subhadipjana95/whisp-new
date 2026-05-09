import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { deleteFromAppStorage } from '../services/fileManager';
import { useNotesStore } from '../stores/notesStore';
import { useRemindersStore } from '../stores/remindersStore';
import type { Attachment, ParentType } from '../types';

interface AttachmentPreviewProps {
  attachments: Attachment[];
  parentId: string;
  parentType: ParentType;
}

export const AttachmentPreview = memo(function AttachmentPreview({
  attachments,
  parentId,
  parentType,
}: AttachmentPreviewProps) {
  const removeNoteAttachment = useNotesStore((s) => s.removeAttachment);
  const removeReminderAttachment = useRemindersStore((s) => s.removeAttachment);
  const removeAttachment = parentType === 'note' ? removeNoteAttachment : removeReminderAttachment;

  const handleRemove = useCallback(
    (attachment: Attachment) => {
      Alert.alert('Remove Attachment', `Remove "${attachment.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteFromAppStorage(attachment.uri);
            await removeAttachment(attachment.id);
          },
        },
      ]);
    },
    [removeAttachment]
  );

  if (attachments.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4 -mx-2"
      contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
    >
      {attachments.map((attachment) => (
        <View key={attachment.id} className="relative">
          {attachment.type === 'image' ? (
            <View className="w-24 h-24 rounded-md overflow-hidden bg-surface-2 border border-hairline">
              <Image
                source={{ uri: attachment.uri }}
                style={{ width: 96, height: 96 }}
                contentFit="cover"
              />
            </View>
          ) : (
            <View className="w-24 h-24 rounded-md bg-surface-2 border border-hairline items-center justify-center px-2">
              <Ionicons
                name={attachment.type === 'audio' ? 'musical-note' : 'document'}
                size={28}
                color="#5e6ad2"
              />
              <Text className="text-xs text-ink-subtle text-center mt-1" numberOfLines={2}>
                {attachment.name}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => handleRemove(attachment)}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
          >
            <Ionicons name="close" size={14} color="white" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
});
