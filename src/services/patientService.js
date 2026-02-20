import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = '192.168.1.103';
const API_BASE_URL = `http://${IP}:5000/api`;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

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

export const patientService = {
    getProfileImage: async (patientId) => {
      try {
        const response = await axiosInstance.get(`/patients/${patientId}/profile-image`);
        
        if (response.data.success && response.data.profileImagePath) {
          return response.data.profileImagePath;
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile image:', error);
        return null;
      }
    },
  
    getPatientDetails: async (patientId, role) => {
      try {
        // Doctor views patient - need doctor auth
        const response = await axiosInstance.get(`/patients/${patientId}/details`);
        
        if (response.data.success) {
          return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch patient details');
      } catch (error) {
        if (error.response?.status === 403) {
          throw new Error('Access denied. Patient not linked to your account.');
        }
        throw error;
      }
    },
  };