import React, { useEffect, useState, useRef, useContext } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { ThemeContext } from '../service/authContext';
import InAppNotification from './InAppNotification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosInstance } from '../config/indeceptor';
import GlobalNotificationModal from './GlobalNotificationModal';
import PracticeReminderModal from './PracticeReminderModal';
import { scheduleInactivityReminder } from '../service/NotificationService';

// Configure how notifications are handled when the app is foregrounded
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
*/

const NotificationHandler = () => {
  const { userData, setNotificationRefreshTrigger, setUnreadNotificationCount, notificationRefreshTrigger } = useContext(ThemeContext);
  const [notification, setNotification] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

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
      
      /*
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log("[NotificationHandler] Token:", token);
          axiosInstance.put('authentication/user', {
            notificationId: {
                token: token,
                platform: Platform.OS
            }
          }).catch(err => {
            console.error("[NotificationHandler] Failed to update token in backend:", err);
          });
        }
      });
      */

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [userData?._id, lastSeenId, notificationRefreshTrigger]);

  useEffect(() => {
    // Force cancel all previously scheduled push notifications that might still exist on the device.
    Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});

    /*
    // Listen for notifications that arrive while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("[NotificationHandler] Received in foreground:", notification);
      
      const data = notification.request.content.data;
      if (data?.type === 'reminder') {
        setShowPracticeModal(true);
      } else {
        setNotification(notification);
        setNotificationRefreshTrigger(prev => prev + 1);
        setShowModal(true);
      }
    });

    // Listen for user interaction with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log("[NotificationHandler] User interacted:", data);
      
      if (data?.type === 'reminder') {
        setShowPracticeModal(true);
      } else {
        setNotification(response.notification);
        setShowModal(true);
      }
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
    */
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
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
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
    } catch (e) {
      console.error("[NotificationHandler] Error getting token:", e);
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
