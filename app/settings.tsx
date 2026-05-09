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
    theme, openAiApiKey, anthropicApiKey, hapticFeedback,
    setTheme, setOpenAiApiKey, setAnthropicApiKey, setHapticFeedback,
  } = useSettingsStore();

  const [openAiInput, setOpenAiInput] = useState(openAiApiKey ? '••••••••••••' : '');
  const [anthropicInput, setAnthropicInput] = useState(anthropicApiKey ? '••••••••••••' : '');
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  const handleSaveOpenAi = useCallback(() => {
    if (openAiInput.startsWith('sk-') && openAiInput.length > 10) {
      setOpenAiApiKey(openAiInput);
      Alert.alert('Saved', 'OpenAI API key saved successfully.');
    } else {
      Alert.alert('Invalid Key', 'Please enter a valid OpenAI API key starting with "sk-".');
    }
  }, [openAiInput, setOpenAiApiKey]);

  const handleSaveAnthropic = useCallback(() => {
    if (anthropicInput.startsWith('sk-ant-') && anthropicInput.length > 10) {
      setAnthropicApiKey(anthropicInput);
      Alert.alert('Saved', 'Anthropic API key saved successfully.');
    } else {
      Alert.alert('Invalid Key', 'Please enter a valid Anthropic API key starting with "sk-ant-".');
    }
  }, [anthropicInput, setAnthropicApiKey]);

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

        <Text className="text-xs font-semibold text-ink-subtle uppercase tracking-widest mb-3">API Configuration</Text>
        <View className="bg-surface-2 border border-hairline rounded-md p-4 mb-4 flex-row gap-3">
          <Ionicons name="information-circle-outline" size={18} color="#8a8f98" />
          <Text className="text-sm text-ink-subtle flex-1">
            API keys are stored securely on your device only and never transmitted to NoteVoice servers.
          </Text>
        </View>

        <View className="bg-surface-1 border border-hairline rounded-md mb-4 overflow-hidden">
          <Text className="text-base font-medium text-ink px-4 pt-4">OpenAI API Key</Text>
          <Text className="text-xs text-ink-subtle px-4 mt-1">Used for voice transcription (Whisper)</Text>
          <View className="flex-row items-center gap-2 px-4 pt-3 pb-4">
            <TextInput
              className="flex-1 bg-surface-2 border border-hairline rounded-md px-3 py-3 text-sm text-ink"
              value={openAiInput} onChangeText={setOpenAiInput}
              onFocus={() => { if (!showOpenAi) setOpenAiInput(''); setShowOpenAi(true); }}
              placeholder="sk-..." placeholderTextColor="#8a8f98" secureTextEntry={!showOpenAi} autoCapitalize="none" autoCorrect={false}
            />
            <TouchableOpacity onPress={handleSaveOpenAi} className="bg-primary rounded-md px-4 py-3">
              <Text className="text-ink font-medium text-sm">Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-surface-1 border border-hairline rounded-md mb-6 overflow-hidden">
          <Text className="text-base font-medium text-ink px-4 pt-4">Anthropic API Key</Text>
          <Text className="text-xs text-ink-subtle px-4 mt-1">Used for AI parsing (Claude)</Text>
          <View className="flex-row items-center gap-2 px-4 pt-3 pb-4">
            <TextInput
              className="flex-1 bg-surface-2 border border-hairline rounded-md px-3 py-3 text-sm text-ink"
              value={anthropicInput} onChangeText={setAnthropicInput}
              onFocus={() => { if (!showAnthropic) setAnthropicInput(''); setShowAnthropic(true); }}
              placeholder="sk-ant-..." placeholderTextColor="#8a8f98" secureTextEntry={!showAnthropic} autoCapitalize="none" autoCorrect={false}
            />
            <TouchableOpacity onPress={handleSaveAnthropic} className="bg-primary rounded-md px-4 py-3">
              <Text className="text-ink font-medium text-sm">Save</Text>
            </TouchableOpacity>
          </View>
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
