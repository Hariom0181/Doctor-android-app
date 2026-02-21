import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginForm from '../components/LoginForm';
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (email, password, role) => {
    console.log("HANDLE LOGIN CALLED", email, role); 
    setLoading(true);
    try {
      const result = await authService.login(email, password, role);
      const endpoint = role === 'doctor' 
        ? '/doctors/login'
        : role === 'nurse'
        ? '/nurses/login'
        : '/patients/login';
      console.log("ENDPOINT:", endpoint);

      if (result.success) {
        // Save userType
        await AsyncStorage.setItem('userType', role);
        console.log('✅ UserType saved:', role);
        
        navigation.reset({
          index: 0,
          routes: [{ name: `${role}-dashboard` }],
        });
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm onSubmit={handleLogin} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});