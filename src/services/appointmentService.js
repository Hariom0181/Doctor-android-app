  import axios from 'axios';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  // const IP = '192.168.1.103';
  const IP = process.env.EXPO_PUBLIC_API_IP;
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



  export const appointmentService = {
    getTodayAppointments: async (doctorId) => {
      try {
        const response = await axiosInstance.get(`/appointments/doctor/${doctorId}/today`);
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, error: error.response?.data?.message };
      }
    },

    getPendingAppointments: async (doctorId) => {
      try {
        const response = await axiosInstance.get(`/appointments/doctor/${doctorId}/pending`);
        return { success: true, data: response.data.data };
      } catch (error) {
        return { success: false, error: error.response?.data?.message };
      }
    },

    getAllAppointments: async (doctorId, filters = {}) => {
      try {
        const params = new URLSearchParams();
        
        if (filters.status && filters.status !== 'all') {
          params.append('status', filters.status);
        }
        
        if (filters.date) {
          // Format date as YYYY-MM-DD
          const formattedDate = filters.date.includes('T') 
            ? filters.date.split('T')[0] 
            : filters.date;
          params.append('date', formattedDate);
        }

        const queryString = params.toString();
        const url = queryString 
          ? `/appointments/doctor/${doctorId}/all?${queryString}`
          : `/appointments/doctor/${doctorId}/all`;

        const response = await axiosInstance.get(url);
        return { success: true, data: response.data.data };
      } catch (error) {
        console.error('Error:', error);
        return { success: false, error: error.response?.data?.message };
      }
    },

    confirmAppointment: async (appointmentId, doctorNotes = "") => {
      try {
        const response = await axiosInstance.patch(
          `/appointments/${appointmentId}/confirm`,
          { doctorNotes }
        );
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.response?.data?.message };
      }
    },

    rejectAppointment: async (appointmentId, cancellationReason = "") => {
      try {
        const response = await axiosInstance.patch(
          `/appointments/${appointmentId}/reject`,
          { cancellationReason }
        );
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.response?.data?.message };
      }
    },
  };