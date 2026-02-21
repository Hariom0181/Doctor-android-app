import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import RootNavigator from './src/navigation/RootNavigator';
import { initializeNotifications, listenToNotifications } from './src/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkUserType = async () => {
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);
      
      if (type) {
        setupNotifications();
      }
    };

    checkUserType();
  }, []);

  const setupNotifications = async () => {
    try {
      console.log('🔄 Setting up notifications...');
      
      // REQUEST PERMISSIONS FIRST
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📱 Permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Notification permission denied');
        return;
      }
      
      const token = await initializeNotifications();
      // ... rest of code
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const sendTokenToBackend = async (token, authToken, userType) => {
    try {
      const endpoint = userType === 'patient' 
        ? 'http://192.168.1.103:5000/api/patients/save-push-token'
        : 'http://192.168.1.103:5000/api/doctors/save-push-token';

      console.log('📡 Sending to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pushToken: token }),
      });

      const data = await response.json();
      console.log('📥 Response:', data);

      if (data.success) {
        console.log('✅ Token sent to backend');
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = listenToNotifications((notification) => {
      console.log('📢 Notification:', notification);
    });

    return unsubscribe;
  }, []);

  return <RootNavigator />;
}