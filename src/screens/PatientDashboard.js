import React from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientService } from '../services/patientService';
import { useState, useEffect } from 'react';
import MyMedications from '../components/patientComponents/myMedication';
import NextCheckup from '../components/patientComponents/nextCheckup';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import ProfileCard from '../components/patientComponents/patient_ProfileCard';
import MyDoctor from '../components/patientComponents/myDoctor';

export default function PatientDashboard({ navigation }) {
  const [profileImage, setProfileImage] = useState(null);
  const [patient, setPatient] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPatientData();
      if (patient?.id) {
        await loadProfileImage();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
      >
        {patient && (
          <>
            <ProfileCard patient={patient} profileImage={profileImage} />
            <MyDoctor />
            <NextCheckup patientId={patient?.id} />
            <MyMedications patientId={patient?.id} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 30,
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
  patientName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    marginTop: 2,
  },
  logoutSection: {
    alignItems: 'center',
    gap: 4,
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
  logoutText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
});