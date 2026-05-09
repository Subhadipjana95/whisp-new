import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState = memo(function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Ionicons name={icon} size={56} color="#d1d5db" />
      <Text className="text-lg font-semibold text-gray-400 dark:text-gray-500 mt-4 text-center">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-gray-400 dark:text-gray-600 mt-1 text-center">
          {subtitle}
        </Text>
      )}
    </View>
  );
});
