import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import DoctorDashboard from '../screens/DoctorDashboard';
import LoginScreen from '../screens/LoginScreen';
import AllMedicationsScreen from '../screens/AllMedicationsScreen';
import NurseDashboard from '../screens/NurseDashboard';
import PatientDashboard from '../screens/PatientDashboard';


const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        const user = JSON.parse(userData);
        setInitialRoute(`${user.role}-dashboard`);
      } else {
        setInitialRoute('login');
      }
    } catch (error) {
      setInitialRoute('login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Show splash screen here later
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="AllMedications"
          component={AllMedicationsScreen}
          options={{ title: 'All Medications' }}
        />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="patient-dashboard" component={PatientDashboard} />
        <Stack.Screen name="doctor-dashboard" component={DoctorDashboard} />
        <Stack.Screen name="nurse-dashboard" component={NurseDashboard} />
        <Stack.Screen name="AppointmentsScreen" component={AppointmentsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}