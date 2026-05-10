import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { runMigrations } from '@/db';
import { setupNotifications, scheduleReminder, cancelNotification } from '@/services/notifications';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRemindersStore } from '@/stores/remindersStore';
import { useColorScheme } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  const theme = useSettingsStore((s) => s.theme);
  const systemScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  useEffect(() => {
    runMigrations().catch(console.error);
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await setupNotifications();
      } catch (err) {
        console.error('[RootLayout] setupNotifications failed:', err);
      }
    };
    init();

    const actionSub = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data as { reminderId?: string };
      const reminderId = data?.reminderId;
      if (!reminderId) return;

      if (actionIdentifier === 'MARK_DONE') {
        await useRemindersStore.getState().markDone(reminderId);
        await Notifications.dismissNotificationAsync(notification.request.identifier);
      } else if (actionIdentifier === 'SNOOZE') {
        const reminders = useRemindersStore.getState().reminders;
        const reminder = reminders.find((r) => r.id === reminderId);
        if (reminder) {
          if (reminder.notificationId) await cancelNotification(reminder.notificationId);
          const newId = await scheduleReminder({
            ...reminder,
            dueAt: Date.now() + 10 * 60 * 1000,
          });
          await useRemindersStore.getState().update(reminderId, { notificationId: newId });
          await Notifications.dismissNotificationAsync(notification.request.identifier);
        }
      } else if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        router.push(`/reminder/${reminderId}` as any);
      }
    });

    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notification] Received in foreground:', notification.request.identifier);
    });

    return () => {
      actionSub.remove();
      foregroundSub.remove();
    };
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#010102' }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#010102' },
            headerTintColor: '#f7f8f8',
            contentStyle: { backgroundColor: '#010102' },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'NoteVoice', headerShown: false }} />
          <Stack.Screen name="note/[id]" options={{ title: 'Note', presentation: 'card' }} />
          <Stack.Screen name="reminder/[id]" options={{ title: 'Reminder', presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
