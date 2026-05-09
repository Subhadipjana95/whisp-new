import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ThemeMode } from '@/types';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const {
    theme, hapticFeedback,
    setTheme, setHapticFeedback,
  } = useSettingsStore();



  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-3 mt-2">Appearance</Text>
        <View className="bg-surface-1 border border-hairline rounded-md overflow-hidden mb-6">
          <Text className="text-base font-medium text-ink px-4 pt-4 pb-3">Theme</Text>
          <View className="flex-row px-4 pb-4 gap-3">
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setTheme(option.value)}
                className={`flex-1 items-center py-3 rounded-md border-2 ${
                  theme === option.value ? 'border-primary bg-primary/10' : 'border-surface-2'
                }`}
              >
                <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={20} color={theme === option.value ? '#5e6ad2' : '#8a8f98'} />
                <Text className={`text-xs font-medium mt-1 ${theme === option.value ? 'text-primary' : 'text-ink-subtle'}`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text className="text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-3">Accessibility</Text>
        <View className="bg-surface-1 border border-hairline rounded-md mb-6">
          <View className="flex-row items-center justify-between px-4 py-4">
            <View>
              <Text className="text-base font-medium text-ink">Haptic Feedback</Text>
              <Text className="text-sm text-ink-subtle mt-0.5">Vibrate on interactions</Text>
            </View>
            <Switch value={hapticFeedback} onValueChange={setHapticFeedback}
              trackColor={{ false: '#26292f', true: '#5e6ad2' }} thumbColor={'#f7f8f8'} />
          </View>
        </View>

        <View className="bg-surface-2 border border-hairline rounded-md p-4 mb-4 flex-row gap-3">
          <Ionicons name="information-circle-outline" size={18} color="#8a8f98" />
          <Text className="text-sm text-ink-subtle flex-1">
            NoteVoice is powered by Groq AI for instant transcription and smart parsing. No API configuration required.
          </Text>
        </View>



        <Text className="text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-3">About</Text>
        <View className="bg-surface-1 border border-hairline rounded-md p-4">
          <Text className="text-base font-medium text-ink">Whisp</Text>
          <Text className="text-sm text-ink-subtle mt-0.5">Version 1.0.0</Text>
        </View>
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
