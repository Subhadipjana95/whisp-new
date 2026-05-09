import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, ThemeMode } from '../types';

interface SettingsState extends AppSettings {
  setTheme: (theme: ThemeMode) => void;
  setOpenAiApiKey: (key: string) => void;
  setAnthropicApiKey: (key: string) => void;
  setHapticFeedback: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      openAiApiKey: '',
      anthropicApiKey: '',
      defaultReminderSound: true,
      hapticFeedback: true,
      setTheme: (theme) => set({ theme }),
      setOpenAiApiKey: (key) => set({ openAiApiKey: key }),
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
