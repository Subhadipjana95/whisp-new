import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from '../types';

const REMINDER_CATEGORY_ID = 'REMINDER_CATEGORY';

// Must be called ONCE at app startup before any scheduling
export async function setupNotifications(): Promise<void> {
  // Set handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Register the action category with "Done" button
  await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, [
    {
      identifier: 'MARK_DONE',
      buttonTitle: 'Done',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
    {
      identifier: 'SNOOZE',
      buttonTitle: 'Snooze 10 min',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
        opensAppToForeground: false,
      },
    },
  ]);
}

export async function scheduleReminder(reminder: Pick<Reminder, 'id' | 'title' | 'body' | 'dueAt'>): Promise<string> {
  const dueDate = new Date(reminder.dueAt);

  if (dueDate <= new Date()) {
    throw new Error('Cannot schedule a notification in the past');
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${reminder.title}`,
        body: reminder.body || 'Reminder',
        categoryIdentifier: REMINDER_CATEGORY_ID,
        data: { reminderId: reminder.id, type: 'reminder' },
        ...(Platform.OS === 'android' && {
          channelId: 'reminders',
          color: '#5e6ad2',
          priority: Notifications.AndroidNotificationPriority.MAX,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dueDate,
      },
    });

    console.log(`[Notifications] Scheduled: "${reminder.title}" at ${dueDate.toLocaleString()} (ID: ${notificationId})`);
    return notificationId;
  } catch (error) {
    console.error('[Notifications] Schedule failed:', error);
    throw error;
  }
}

export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    // Notification may have already fired — not an error
    console.warn('[Notifications] Cancel failed (already fired?):', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
