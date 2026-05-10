import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HomeTabToggleProps {
  activeTab: 'notes' | 'reminders';
  onTabChange: (tab: 'notes' | 'reminders') => void;
}

export const HomeTabToggle = memo(function HomeTabToggle({
  activeTab,
  onTabChange,
}: HomeTabToggleProps) {
  return (
    <View className="px-4 mb-4 mt-2">
      <View className="bg-surface-1/50 p-1.5 rounded-[28px] flex-row border border-white/10">
        <TouchableOpacity
          onPress={() => onTabChange('notes')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-3xl gap-2 ${
            activeTab === 'notes' ? 'bg-primary' : ''
          }`}
        >
          <Ionicons name="document-text" size={18} color={activeTab === 'notes' ? '#fff' : '#8a8f98'} />
          <Text className={`font-medium ${activeTab === 'notes' ? 'text-white' : 'text-ink-subtle'}`}>
            Notes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onTabChange('reminders')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-3xl gap-2 ${
            activeTab === 'reminders' ? 'bg-primary' : ''
          }`}
        >
          <Ionicons name="alarm" size={18} color={activeTab === 'reminders' ? '#fff' : '#8a8f98'} />
          <Text className={`font-medium ${activeTab === 'reminders' ? 'text-white' : 'text-ink-subtle'}`}>
            Reminders
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
