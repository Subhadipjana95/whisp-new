import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', 'rgba(1, 1, 2, 0.4)', '#010102']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={{ marginBottom: insets.bottom + 12 }}
        className="w-4/5 mx-auto rounded-xl flex-row items-center justify-center gap-3 p-2 bg-canvas/80 border border-white/10 shadow-2xl"
      >
        {/* Voice Button */}
        <TouchableOpacity
          onPress={handlePress(onVoicePress)}
          activeOpacity={0.8}
          className="flex-1 items-center justify-center bg-primary rounded-md py-3 flex-row gap-2"
        >
          <Ionicons name="mic" size={20} color="#f7f8f8" />
          <Text className="text-ink font-medium text-sm">Voice</Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          onPress={handlePress(onAddPress)}
          activeOpacity={0.8}
          className="flex-1 items-center justify-center bg-surface-1 border border-hairline rounded-md py-3 flex-row gap-2"
        >
          <Ionicons name="add" size={20} color="#f7f8f8" />
          <Text className="text-ink font-medium text-sm">New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30, // Space for the gradient fade
  },
});
