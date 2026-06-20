import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system/legacy';

const REMINDER_IMAGE_URL = 'http://gyrusneet.com/api/assets/practice_reminder.png';

export const scheduleInactivityReminder = async (userData?: any) => {
  try {
    // 1. Cancel existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    const now = new Date();
    
    // Check if the user has already attended/submitted a test today (local date)
    let hasAttendedToday = false;
    if (userData?.active?.updatedAt) {
      const lastUpdate = new Date(userData.active.updatedAt);
      if (lastUpdate.toDateString() === now.toDateString()) {
        hasAttendedToday = true;
      }
    }

    // TEMPORARY TEST TRIGGERS (Revert for production)
    // Morning reminder triggers in 10 seconds, evening reminder in 25 seconds
    const morningTrigger = new Date(now.getTime() + 10 * 1000);
    
    let eveningTrigger: Date;
    if (hasAttendedToday) {
      // If user attended a test today, evening reminder is scheduled for tomorrow
      eveningTrigger = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      console.log('[NotificationService] User attended a test today. Suppressing today\'s test evening reminder.');
    } else {
      eveningTrigger = new Date(now.getTime() + 25 * 1000);
    }

    console.log(`[NotificationService] Scheduling reminders:`);
    console.log(`- Morning reminder: ${morningTrigger.toString()}`);
    console.log(`- Evening reminder: ${eveningTrigger.toString()}`);

    let localImageUri: string | null = null;
    try {
      const filename = 'practice_reminder.png';
      const fileUri = FileSystem.cacheDirectory + filename;
      
      // Check if file already exists in cache, if not, download it
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.log(`[NotificationService] Downloading reminder image to local cache...`);
        const downloadResult = await FileSystem.downloadAsync(REMINDER_IMAGE_URL, fileUri);
        localImageUri = downloadResult.uri;
      } else {
        localImageUri = fileUri;
      }
      console.log(`[NotificationService] Local image URI resolved: ${localImageUri}`);
    } catch (downloadErr) {
      console.error('[NotificationService] Failed to download or resolve notification image:', downloadErr);
    }

    const attachments: Notifications.NotificationContentAttachmentIos[] = localImageUri ? [{
      url: localImageUri,
      identifier: 'practice_reminder',
      type: 'public.png'
    }] : [];

    // Schedule morning notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Have you practiced today?",
        body: "One quick practice keeps the pulse alive!",
        sound: true,
        priority: 'high',
        data: { type: 'reminder', slot: 'morning' },
        attachments: attachments,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: morningTrigger,
      },
    });

    // Schedule evening notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Have you practiced today?",
        body: "One quick practice keeps the pulse alive!",
        sound: true,
        priority: 'high',
        data: { type: 'reminder', slot: 'evening' },
        attachments: attachments,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: eveningTrigger,
      },
    });

  } catch (err) {
    console.error('[NotificationService] Failed to schedule inactivity reminder:', err);
  }
};

export const cancelInactivityReminder = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] Cancelled all scheduled notifications.');
  } catch (err) {
    console.error('[NotificationService] Failed to cancel inactivity reminders:', err);
  }
};
