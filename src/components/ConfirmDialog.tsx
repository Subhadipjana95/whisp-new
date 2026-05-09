import React, { memo } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = memo(function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center px-8"
        onPress={onCancel}
      >
        <Pressable className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-white/10">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</Text>
          <Text className="text-base leading-snug text-gray-500 dark:text-gray-400 mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-100 dark:bg-neutral-700 rounded-xl py-2.5 items-center"
            >
              <Text className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className={`flex-1 rounded-xl py-2.5 items-center ${
                destructive ? 'bg-red-500' : 'bg-primary'
              }`}
            >
              <Text className="text-lg font-medium text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
});
