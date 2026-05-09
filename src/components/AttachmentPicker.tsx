import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { copyToAppStorage } from '../services/fileManager';
import { useNotesStore } from '../stores/notesStore';
import { useRemindersStore } from '../stores/remindersStore';
import type { ParentType } from '../types';
import { MAX_ATTACHMENT_SIZE_BYTES } from '../constants';
import uuid from 'react-native-uuid';

interface AttachmentPickerProps {
  parentId: string;
  parentType: ParentType;
}

export const AttachmentPicker = memo(function AttachmentPicker({
  parentId,
  parentType,
}: AttachmentPickerProps) {
  const addNoteAttachment = useNotesStore((s) => s.addAttachment);
  const addReminderAttachment = useRemindersStore((s) => s.addAttachment);
  const addAttachment = parentType === 'note' ? addNoteAttachment : addReminderAttachment;

  const pickImage = useCallback(
    async (source: 'camera' | 'library') => {
      try {
        const result =
          source === 'camera'
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                allowsEditing: true,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.85,
                allowsMultipleSelection: false,
              });

        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          if (asset.fileSize && asset.fileSize > MAX_ATTACHMENT_SIZE_BYTES) {
            Alert.alert('File Too Large', 'Attachments must be under 50MB.');
            return;
          }
          const { uri, name } = await copyToAppStorage(asset.uri, 'image', asset.fileName ?? undefined);
          await addAttachment({
            id: uuid.v4() as string,
            parentId,
            parentType,
            type: 'image',
            uri,
            name,
            mimeType: asset.mimeType ?? 'image/jpeg',
            sizeBytes: asset.fileSize ?? null,
          });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
        console.error('[AttachmentPicker.pickImage]', error);
      }
    },
    [parentId, parentType, addAttachment]
  );

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.size && asset.size > MAX_ATTACHMENT_SIZE_BYTES) {
          Alert.alert('File Too Large', 'Attachments must be under 50MB.');
          return;
        }
        const { uri, name } = await copyToAppStorage(asset.uri, 'file', asset.name);
        await addAttachment({
          id: uuid.v4() as string,
          parentId,
          parentType,
          type: 'file',
          uri,
          name,
          mimeType: asset.mimeType ?? 'application/octet-stream',
          sizeBytes: asset.size ?? null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file. Please try again.');
      console.error('[AttachmentPicker.pickFile]', error);
    }
  }, [parentId, parentType, addAttachment]);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library', 'Choose File'],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickImage('camera');
          else if (index === 2) pickImage('library');
          else if (index === 3) pickFile();
        }
      );
    } else {
      Alert.alert('Add Attachment', 'Choose attachment type:', [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Library', onPress: () => pickImage('library') },
        { text: 'Choose File', onPress: pickFile },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [pickImage, pickFile]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="flex-row items-center gap-2 py-3 border-t border-hairline mt-4"
    >
      <Ionicons name="attach" size={20} color="#5e6ad2" />
      <Text className="text-base text-primary font-medium">Add Attachment</Text>
    </TouchableOpacity>
  );
});
