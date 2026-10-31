import React, { useEffect, useState, useRef, useContext } from 'react';
import { Platform, AppState } from 'react-native';
import Notifications from '../config/Notifications';
import Constants from 'expo-constants';
import { ThemeContext } from '../service/authContext';
import InAppNotification from './InAppNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../config/indeceptor';
import GlobalNotificationModal from './GlobalNotificationModal';
import PracticeReminderModal from './PracticeReminderModal';

// Helper to identify if a notification is a practice/inactivity reminder
export const isReminderNotification = (notification: any): boolean => {
  if (!notification) return false;
  const content = notification?.request?.content;
  const data = content?.data;

  // 1. Check data payload type
  if (data?.type === 'reminder') return true;
  if (typeof data === 'string' && data.includes('"type":"reminder"')) return true;

  // 2. Check title and body for reminder indicators
  const title = (content?.title || '').toLowerCase();
  const body = (content?.body || '').toLowerCase();

  if (
    title.includes('reminder') ||
    title.includes('practice today') ||
    title.includes('keep your pulse alive') ||
    (title.includes('good morning') && body.includes('practice')) ||
    title.includes('daily test reminder') ||
    title.includes('study time reminder') ||
    body.includes('streak alive') ||
    body.includes('quick practice')
  ) {
    return true;
  }

  return false;
};

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async (notification: any) => {
    // If the user is already inside the app, do NOT show reminder notifications
    if (isReminderNotification(notification)) {
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

const NotificationHandler = () => {
  const { userData, setNotificationRefreshTrigger, setUnreadNotificationCount, notificationRefreshTrigger } = useContext(ThemeContext);
  const [notification, setNotification] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  const checkNewNotifications = async () => {
    if (!userData?._id) return;
    try {
      const std = userData?.std || 'all';
      const [individualRes, groupRes, broadcastRes] = await Promise.all([
        axiosInstance.get(`notifications/individual/${userData._id}`),
        axiosInstance.get(`notifications/group/${std}?userId=${userData._id}`),
        axiosInstance.get(`notifications/broadcast?userId=${userData._id}`)
      ]);

      const individual = (individualRes.data || []).map((n: any) => ({ ...n, origin: 'individual' }));
      const group = (groupRes.data || []).map((n: any) => ({ ...n, origin: 'group' }));
      const broadcast = (broadcastRes.data || []).map((n: any) => ({ ...n, origin: 'broadcast' }));

      const all = [...individual, ...group, ...broadcast].sort((a, b) => {
        const dateA = new Date(a.sentAt || a.createdAt).getTime();
        const dateB = new Date(b.sentAt || b.createdAt).getTime();
        return dateB - dateA;
      });

      if (all.length > 0) {
        const latest = all[0];
        const latestId = latest._id;

        // Calculate unread count
        try {
          const savedReadIds = await AsyncStorage.getItem('readNotificationIds');
          const readIds = savedReadIds ? JSON.parse(savedReadIds) : [];
          const unread = all.filter((n: any) => !readIds.includes(n._id));
          setUnreadNotificationCount(unread.length);
        } catch (e) {
          console.error("[NotificationHandler] Error calculating unread count:", e);
        }

        // If we have a lastSeenId and the new latestId is different, it's a new notification
        if (lastSeenId && latestId !== lastSeenId) {
          console.log("[NotificationHandler] New notification detected via polling:", latest.header);
          setNotification(latest);
          setShowNotification(true);
          setNotificationRefreshTrigger(prev => prev + 1);
        }
        
        // Update the lastSeenId
        setLastSeenId(latestId);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error("[NotificationHandler] Polling error:", error);
    }
  };

  useEffect(() => {
    if (userData?._id) {
      // Initial check to set the baseline lastSeenId
      checkNewNotifications();
      
      // Ensure inactivity reminder is scheduled
      // scheduleInactivityReminder();
      
      // Set up 15-second polling interval
      const intervalId = setInterval(checkNewNotifications, 15000);
      
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log("[NotificationHandler] Native Push Token:", token);
          axiosInstance.put('authentication/push-token', {
            pushToken: token
          }).catch(err => {
            console.error("[NotificationHandler] Failed to update push token in backend:", err);
          });
        }
      }).catch(err => {
        console.warn("[NotificationHandler] Push notification registration error:", err);
      });

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [userData?._id, lastSeenId, notificationRefreshTrigger]);

  useEffect(() => {
    // Dismiss all active notifications from the tray on startup/mount
    Notifications.dismissAllNotificationsAsync().catch(() => {});

    // Force cancel all previously scheduled push notifications that might still exist on the device.
    Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

    // When the app resumes/becomes active, clear any lingering reminder notifications from the tray
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        Notifications.dismissAllNotificationsAsync().catch(() => {});
        Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
    });

    // Listen for notifications that arrive while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log("[NotificationHandler] Received in foreground:", notification);
      
      if (isReminderNotification(notification)) {
        // User is already inside the app - suppress reminder completely
        console.log("[NotificationHandler] User is inside the app; completely suppressing reminder push notification");
        const identifier = notification?.request?.identifier;
        if (identifier) {
          Notifications.dismissNotificationAsync(identifier).catch(() => {});
        }
        return;
      }

      setNotification(notification);
      setNotificationRefreshTrigger(prev => prev + 1);
      setShowModal(true);
    });

    // Listen for user interaction with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      console.log("[NotificationHandler] User interacted:", data);
      
      // Dismiss all remaining notifications from the notification tray
      Notifications.dismissAllNotificationsAsync().catch((err: any) => {
        console.error("[NotificationHandler] Failed to dismiss notifications:", err);
      });
      
      if (isReminderNotification(response.notification)) {
        // Do not show the modal inside the app when clicked
        console.log("[NotificationHandler] Practice reminder clicked");
      } else {
        setNotification(response.notification);
        setShowModal(true);
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
      appStateSub.remove();
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    // Expo Go no longer supports push notifications as of SDK 53.
    // Return early to avoid the "warnOfExpoGoPushUsage" red screen crash.
    if (Constants.appOwnership === 'expo') {
      console.warn('Push notifications are not supported in Expo Go.');
      return null;
    }

    let token;
    if (Platform.OS === 'android') {
      try {
        const importanceValue = Notifications?.AndroidImportance?.MAX ?? 5;
        if (typeof Notifications?.setNotificationChannelAsync === 'function') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: importanceValue,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          }).catch(async (e: any) => {
            console.warn('[NotificationHandler] primary setNotificationChannelAsync failed, trying fallback:', e);
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: 5,
            }).catch((innerErr: any) => {
              console.warn('[NotificationHandler] setNotificationChannelAsync fallback skipped:', innerErr);
            });
          });
        }
      } catch (channelErr) {
        console.warn('[NotificationHandler] setNotificationChannelAsync skipped:', channelErr);
      }
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    try {
      token = (await Notifications.getDevicePushTokenAsync()).data;
    } catch (e) {
      console.error("[NotificationHandler] Error getting native token:", e);
    }

    return token;
  }

  return (
    <>
      <InAppNotification 
        isVisible={showNotification}
        notification={notification}
        onClose={() => setShowNotification(false)}
        onPress={() => setShowModal(true)}
      />
      <GlobalNotificationModal 
        isVisible={showModal}
        notification={notification}
        onClose={() => setShowModal(false)}
      />
      <PracticeReminderModal 
        isVisible={showPracticeModal}
        onClose={() => setShowPracticeModal(false)}
      />
    </>
  );
};

export default NotificationHandler;
