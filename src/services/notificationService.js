import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializeNotifications = async () => {
    try {
      console.log('📞 Getting Expo push token...');
      const token = await Notifications.getDevicePushTokenAsync();
      console.log('🎫 Token data:', token);
      console.log('🎫 Token string:', token.data);
      console.log('🎫 Token type:', typeof token.data);
      return token.data;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

export const listenToNotifications = (callback) => {
  // Listen for notifications when app is in foreground
  const subscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      if (callback) callback(notification);
    }
  );

  // Listen for notification responses (when user taps notification)
  const responseSubscription = 
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      if (callback) callback(response);
    });

  return () => {
    subscription.remove();
    responseSubscription.remove();
  };
};