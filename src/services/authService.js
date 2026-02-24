import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const IP = process.env.EXPO_PUBLIC_API_IP;
const API_BASE_URL = `http://${IP}:5000/api`;
console.log("API IP:", IP);
console.log("BASE URL:", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password, role) => {
  try {
    const endpoint = role === 'doctor' 
      ? '/doctors/login'
      : role === 'nurse'
      ? '/nurses/login'
      : '/patients/login';

    const response = await axiosInstance.post(endpoint, {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      
      // Store user data WITH role
      const userData = {
        ...(response.data.nurse || response.data.doctor || response.data.patient),
        role: role  // ADD THIS LINE
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', role);
    }

    return response.data;
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
},

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userData');
    return { success: true };
  },

  getToken: async () => {
    return await AsyncStorage.getItem('token');
  },

  getUserData: async () => {
    const data = await AsyncStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  },
};