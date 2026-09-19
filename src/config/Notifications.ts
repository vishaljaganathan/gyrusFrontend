import Constants from 'expo-constants';

let Notifications: any = {};

if (Constants.appOwnership !== 'expo') {
  Notifications = require('expo-notifications');
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
    AndroidImportance: { MAX: 5 },
    SchedulableTriggerInputTypes: { DATE: 'date' },
  };
}

export default Notifications;
