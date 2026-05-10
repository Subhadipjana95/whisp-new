import React, { memo } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CreateOptionsDialogProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'note' | 'reminder') => void;
}

export const CreateOptionsDialog = memo(function CreateOptionsDialog({
  visible,
  onClose,
  onSelect,
}: CreateOptionsDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/70 items-center justify-end pb-20 px-4"
        onPress={onClose}
      >
        <Pressable className="bg-white dark:bg-surface-1 rounded-3xl px-6 pb-6 pt-4 w-full max-w-sm border border-white/10">
          <View className="flex-row items-center justify-between w-full mb-6">
            <Text className="text-xl font-medium text-gray-900 dark:text-white mb-4">Create New</Text>
            <TouchableOpacity onPress={onClose} className='bg-white/10 p-1 rounded-full border border-white/10'>
              <Ionicons name="close" size={24} color="#8a8f98" />
            </TouchableOpacity>
          </View>

          <View className="gap-2">
            <TouchableOpacity
              onPress={() => { onSelect('note'); onClose(); }}
              className="flex-row items-center gap-3 bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl"
            >
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="document-text-outline" size={20} color="#5e6ad2" />
              </View>
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">Note</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Capture a thought or info</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { onSelect('reminder'); onClose(); }}
              className="flex-row items-center gap-3 bg-gray-50 dark:bg-neutral-800 p-4 rounded-2xl"
            >
              <View className="bg-primary/10 p-2 rounded-full">
                <Ionicons name="alarm-outline" size={20} color="#5e6ad2" />
              </View>
              <View>
                <Text className="text-base font-medium text-gray-900 dark:text-white">Reminder</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">Set a task with a deadline</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
