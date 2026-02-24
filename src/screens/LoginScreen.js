import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import LoginForm from '../components/LoginForm';
import { authService } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

const handleLogin = async (email, password, role) => {
  console.log("HANDLE LOGIN CALLED", email, role); 
  setLoading(true);
  try {
    const result = await authService.login(email, password, role);

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: `${role}-dashboard` }],
      });
    } else {
      Alert.alert('Login Failed', result.message || result.error);
    }
  } catch (error) {
    console.log('❌ Error:', error);
    Alert.alert('Error', error.message || 'Something went wrong');
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