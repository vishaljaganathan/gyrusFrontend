import Constants from 'expo-constants';

export const AndroidImportance = {
  UNKNOWN: 0,
  UNSPECIFIED: 1,
  NONE: 2,
  MIN: 3,
  LOW: 4,
  DEFAULT: 5,
  HIGH: 6,
  MAX: 7,
};

let Notifications: any = {};

if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require('expo-notifications');
    if (!Notifications.AndroidImportance) {
      Notifications.AndroidImportance = AndroidImportance;
    }
  } catch (err) {
    console.warn("Failed to require expo-notifications:", err);
  }
} else {
  console.warn("Running in Expo Go: Mocking expo-notifications to prevent crashes.");
  Notifications = {
    setNotificationHandler: () => {},
    cancelAllScheduledNotificationsAsync: async () => {},
    scheduleNotificationAsync: async () => {},
    dismissAllNotificationsAsync: async () => {},
    addNotificationReceivedListener: () => ({ remove: () => {} }),
    addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
    setNotificationChannelAsync: async () => {},
    getPermissionsAsync: async () => ({ status: 'granted' }),
    requestPermissionsAsync: async () => ({ status: 'granted' }),
    getDevicePushTokenAsync: async () => ({ data: 'dummy-token' }),
    AndroidImportance,
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
}

export default Notifications;

