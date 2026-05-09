import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, ThemeMode } from '../types';

interface SettingsState extends AppSettings {
  setTheme: (theme: ThemeMode) => void;
  setHapticFeedback: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      defaultReminderSound: true,
      hapticFeedback: true,
      setTheme: (theme) => set({ theme }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
