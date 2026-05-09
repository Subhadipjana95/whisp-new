import React, { memo } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AttachmentOptionsDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'camera' | 'library' | 'file') => void;
}

export const AttachmentOptionsDialog = memo(function AttachmentOptionsDialog({
  visible,
  onClose,
  onSelect,
}: AttachmentOptionsDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/70 items-center justify-end pb-12 px-8"
        onPress={onClose}
      >
        <Pressable className="bg-white dark:bg-neutral-900 rounded-xl px-6 pb-6 pt-4 w-full max-w-sm border border-white/10">
          <View className="flex-row items-center justify-between w-full mb-6">
            <Text className="text-xl font-medium text-gray-900 dark:text-white">Add Attachment</Text>
            <TouchableOpacity onPress={onClose} className='bg-white/10 p-1 rounded-full border border-white/10'>
              <Ionicons name="close" size={24} color="#8a8f98" />
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            <TouchableOpacity
              onPress={() => { onSelect('camera'); onClose(); }}
              className="flex-row items-center gap-3 bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl"
            >
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="camera-outline" size={20} color="#5e6ad2" />
              </View>
              <Text className="text-base font-medium text-gray-900 dark:text-white">Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { onSelect('library'); onClose(); }}
              className="flex-row items-center gap-3 bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl"
            >
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="images-outline" size={20} color="#5e6ad2" />
              </View>
              <Text className="text-base font-medium text-gray-900 dark:text-white">Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { onSelect('file'); onClose(); }}
              className="flex-row items-center gap-3 bg-gray-50 dark:bg-neutral-800 p-4 rounded-xl"
            >
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="document-outline" size={20} color="#5e6ad2" />
              </View>
              <Text className="text-base font-medium text-gray-900 dark:text-white">Choose File</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
