import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const scheduleInactivityReminder = async () => {
  /*
  // 1. Cancel existing reminders
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 2. Schedule new reminder for 12 hours from now
  // 12 hours = 12 * 60 * 60 seconds = 43200 seconds
  const triggerSeconds = 12 * 60 * 60;

  console.log(`[NotificationService] Scheduling inactivity reminder for ${triggerSeconds} seconds from now.`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Have you practiced today?",
      body: "One quick practice keeps the pulse alive!",
      sound: true,
      priority: 'high', // Use string for priority
      data: { type: 'reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      repeats: false,
    },
  });
  */
};

export const cancelInactivityReminder = async () => {
  /*
  await Notifications.cancelAllScheduledNotificationsAsync();
  */
};
