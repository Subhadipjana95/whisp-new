import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../stores/settingsStore';

interface FloatingActionBarProps {
  onVoicePress: () => void;
  onAddPress: () => void;
}

export const FloatingActionBar = memo(function FloatingActionBar({
  onVoicePress,
  onAddPress,
}: FloatingActionBarProps) {
  const insets = useSafeAreaInsets();
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);

  const handlePress = (fn: () => void) => () => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    fn();
  };

  return (
    <View
      style={{ paddingBottom: insets.bottom + 12 }}
      className="flex-row items-center justify-center gap-4 px-6 pt-4 bg-canvas border-t border-hairline"
    >
      {/* Voice Button */}
      <TouchableOpacity
        onPress={handlePress(onVoicePress)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Start voice recording"
        className="flex-1 items-center justify-center bg-primary rounded-md py-3 flex-row gap-2"
      >
        <Ionicons name="mic" size={20} color="#f7f8f8" />
        <Text className="text-ink font-medium text-sm">Voice</Text>
      </TouchableOpacity>

      {/* Add Button */}
      <TouchableOpacity
        onPress={handlePress(onAddPress)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new note or reminder"
        className="flex-1 items-center justify-center bg-surface-1 border border-hairline rounded-md py-3 flex-row gap-2"
      >
        <Ionicons name="add" size={20} color="#f7f8f8" />
        <Text className="text-ink font-medium text-sm">New</Text>
      </TouchableOpacity>
    </View>
  );
});
