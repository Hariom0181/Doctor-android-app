import React from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientService } from '../services/patientService';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import ProfileCard from '../components/patientComponents/patient_ProfileCard';
import MyDoctor from '../components/patientComponents/myDoctor';

export default function PatientDashboard({ navigation }) {

  const [profileImage, setProfileImage] = useState(null);
  const [patient, setPatient] = useState(null);


  const loadPatientData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      setPatient(JSON.parse(userData));
    }
  };

  useEffect(() => {
    loadPatientData();
  }, []);

  useEffect(() => {
    if (patient?.id) {
      loadProfileImage();
    }
  }, [patient?.id]);

  const loadProfileImage = async () => {
    const imageUrl = await patientService.getProfileImage(patient.id);
    setProfileImage(imageUrl);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.patientName}>Pt. {patient?.firstName}</Text>
        </View>
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
            <Text style={styles.logoutIconText}>🚪</Text>
          </TouchableOpacity>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* here the patients-dashboard cards will come */}
        {patient && (
          <>
            <ProfileCard patient={patient} profileImage={profileImage} />
            <MyDoctor />
          </>
        )}

      </ScrollView>



    </View>
  );
}

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  buttonIcon: {
    fontSize: 28,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  buttonSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonArrow: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconText: {
    fontSize: 20,
  },
  logoutSection: {
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  patientName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});