import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeHeaderProps {
  onSearchPress: () => void;
  onSettingsPress: () => void;
}

export const HomeHeader = memo(function HomeHeader({
  onSearchPress,
  onSettingsPress,
}: HomeHeaderProps) {
  return (
    <View className="bg-canvas flex-row items-start justify-between px-4 pt-3 pb-4">
      <View className="flex-row items-start justify-center">
        <Text className="text-3xl font-medium text-primary tracking-relaxed">Whisp.</Text>
      </View>
      <View className="flex-row items-center gap-6">
        <TouchableOpacity onPress={onSearchPress}>
          <Ionicons name="search-outline" size={28} color="#8a8f98" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress}>
          <Ionicons name="settings-outline" size={28} color="#8a8f98" />
        </TouchableOpacity>
      </View>
    </View>
  );
});
