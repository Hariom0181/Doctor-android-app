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
    // console.log('Token being sent:', token?.substring(0, 20) + '...');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export const doctorService = {
  getLinkedPatients: async () => {
    try {
      const response = await axiosInstance.get('/doctors/linked-patients');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  requestMetric: async (patientId, metricType, deviceId) => {
    try {
      const response = await axiosInstance.post('/health-metrics-iot/request-metric', {
        patient_id: patientId,
        metric_type: metricType,
        device_id: deviceId,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.error };
    }
  },

  getMetricStatus: async (requestId) => {
    try {
      const response = await axiosInstance.get(`/health-metrics-iot/request/${requestId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'No reading found' };
    }
  },
  getProfileImageById: async (doctorId) => {
    try {
      const response = await axiosInstance.get(
        `/doctors/profile-image/${doctorId}`
      );

      if (response.data.success) {
        return response.data.profileImagePath;
      }

      return null;
    } catch (error) {
      console.log("Image API Error:", error.response?.data);
      return null;
    }
  },
};