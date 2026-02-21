import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IP = "192.168.1.107";
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
    getLinkedDoctors: async () => {
      try {
        const response = await axiosInstance.get('/patients/linked-doctors');
        return response.data;
      } catch (error) {
        return { success: false };
      }
    },

    getPatientPrescriptions: async (patientId, status = null) => {
      try {
        let endpoint = `${API_BASE_URL}/prescriptions/patient/${patientId}`;
        
        if (status) {
          endpoint += `?status=${status}`;
        }
    
        const response = await axiosInstance.get(endpoint);
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
      }
    },

    getNextCheckup: async (patientId) => {
      try {
        const response = await axiosInstance.get(
          `${API_BASE_URL}/patients/${patientId}/next-checkup`
        );
        return response.data.data;
      } catch (error) {
        console.error('Error fetching next checkup:', error);
        return null;
      }
    },
  };