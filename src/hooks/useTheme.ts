import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import type { ThemeMode } from '../types';

export function useTheme(): { isDark: boolean; theme: ThemeMode } {
  const systemScheme = useColorScheme();
  const theme = useSettingsStore((s) => s.theme);

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  return { isDark, theme };
}
