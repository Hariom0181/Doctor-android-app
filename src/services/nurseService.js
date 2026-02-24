import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const IP = process.env.EXPO_PUBLIC_API_IP;
const API_BASE_URL = `http://${IP}:5000/api`;

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

export const nurseService = {
  register: async (firstName, lastName, email, phone, qualification, licenseNumber, currentHospital, password, confirmPassword) => {
    try {
      const response = await axiosInstance.post('/nurses/register', {
        firstName, lastName, email, phone, qualification,
        licenseNumber, currentHospital, password, confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Registration failed' };
    }
  },

  login: async (email, password) => {
    try {
      console.log('🔐 Nurse login attempt:', email);
      const response = await axiosInstance.post('/nurses/login', { email, password });
      console.log('📡 Login response:', response.data);

      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.nurse));
        await AsyncStorage.setItem('userType', 'nurse');
        console.log('✅ Login successful, data stored');
      }
      return response.data;
    } catch (error) {
      console.log('❌ Login error:', error.response?.data || error.message);
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  },

  savePushToken: async (pushToken) => {
    try {
      const response = await axiosInstance.post('/nurses/save-push-token', { pushToken });
      return response.data;
    } catch (error) {
      console.error('Error saving push token:', error);
      throw error;
    }
  },

  // ── PATIENTS ──────────────────────────────────────────
  getAssignedPatients: async () => {
    try {
      const response = await axiosInstance.get('/nurses/assigned-patients');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      return [];
    }
  },

  // ── PRESCRIPTIONS ─────────────────────────────────────
  // ── PRESCRIPTIONS ─────────────────────────────────────
// ── PRESCRIPTIONS ─────────────────────────────────────
getPatientPrescriptions: async (patientId) => {
  try {
    const response = await axiosInstance.get(
      `/nurses/patient/${patientId}/prescriptions`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return [];
  }
},

  // ── MEDICATION LOGS ───────────────────────────────────
  logMedication: async (prescriptionId, patientId, medicationName, dosage, notes) => {
    try {
      const response = await axiosInstance.post('/nurses/medication-logs', {
        prescriptionId,
        patientId,
        medicationName,
        dosage,
        notes,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to log medication' };
    }
  },

  getMedicationLogs: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/nurses/patient/${patientId}/medication-logs`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching medication logs:', error);
      return [];
    }
  },

  // ── NOTES ─────────────────────────────────────────────
  addNote: async (patientId, observation, observationType = 'general', severity = 'normal') => {
    try {
      const response = await axiosInstance.post('/nurses/notes', {
        patientId, observation, observationType, severity,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to add note' };
    }
  },

  getPatientNotes: async (patientId) => {
    try {
      const response = await axiosInstance.get(`/nurses/patient/${patientId}/notes`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching patient notes:', error);
      return [];
    }
  },

  // ── ACTIVITY LOG ──────────────────────────────────────
  // Returns combined medication logs + notes across ALL assigned patients
  getActivityLog: async () => {
    try {
      const response = await axiosInstance.get('/nurses/activity-log');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching activity log:', error);
      return [];
    }
  },
};