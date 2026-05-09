import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { deleteFromAppStorage } from '../services/fileManager';
import { useNotesStore } from '../stores/notesStore';
import { useRemindersStore } from '../stores/remindersStore';
import type { Attachment, ParentType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const GAP = 12;
const IMAGE_WIDTH = (SCREEN_WIDTH - (GRID_PADDING * 2) - GAP) / 2;
const IMAGE_HEIGHT = IMAGE_WIDTH;

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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
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
    <View className="mt-4 w-full">
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: GAP,
          width: '100%'
        }}
      >
        {attachments.map((attachment) => (
          <View key={attachment.id} style={{ width: IMAGE_WIDTH }} className="relative mb-1">
            {attachment.type === 'image' ? (
              <TouchableOpacity
                onPress={() => setFullscreenImage(attachment.uri)}
                activeOpacity={0.9}
                style={{ height: IMAGE_HEIGHT }}
                className="rounded-xl overflow-hidden bg-surface-2 border border-hairline"
              >
                <Image
                  source={{ uri: attachment.uri }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </TouchableOpacity>
            ) : (
              <View
                style={{ height: IMAGE_HEIGHT }}
                className="rounded-xl bg-surface-2 border border-hairline items-center justify-center px-2"
              >
                <Ionicons
                  name={attachment.type === 'audio' ? 'musical-note' : 'document'}
                  size={32}
                  color="#5e6ad2"
                />
                <Text className="text-xs text-ink-subtle text-center mt-2 font-medium" numberOfLines={2}>
                  {attachment.name}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={() => handleRemove(attachment)}
              className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-6 h-6 items-center justify-center shadow-md border border-white/20 z-10"
            >
              <Ionicons name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Fullscreen Viewer */}
      <Modal
        visible={!!fullscreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}
      >
        <View className="flex-1 bg-black/90">
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <Pressable
            className="flex-1 items-center justify-center"
            onPress={() => setFullscreenImage(null)}
          >
            {fullscreenImage && (
              <Image
                source={{ uri: fullscreenImage }}
                style={{ width: SCREEN_WIDTH, height: '80%' }}
                contentFit="contain"
              />
            )}
          </Pressable>
        </View>
      </Modal>
    </View>
  );
});
