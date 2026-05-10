import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

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
    <Modal transparent animationType="none" visible={visible} onRequestClose={onCancel}>
      <Animated.View
        entering={FadeIn.duration(150)}
        className="flex-1 bg-black/60 items-center justify-center px-8"
      >
        <Pressable className="absolute inset-0" onPress={onCancel} />
        <Animated.View 
          entering={FadeInDown.duration(200).springify().damping(20).mass(0.5)}
          className="bg-white dark:bg-neutral-900 rounded-xl p-6 w-full max-w-sm border border-white/10"
        >
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
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});
