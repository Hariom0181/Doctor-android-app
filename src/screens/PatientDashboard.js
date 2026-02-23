import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import this
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

// Components
import MyMedications from '../components/patientComponents/myMedication';
import NextCheckup from '../components/patientComponents/nextCheckup';
import ProfileCard from '../components/patientComponents/patient_ProfileCard';
import MyDoctor from '../components/patientComponents/myDoctor';

export default function PatientDashboard({ navigation }) {
  const insets = useSafeAreaInsets(); // Hook to handle the notch/status bar area
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
      if (patient?.id) await loadProfileImage();
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
      {/* Professional Header: 
        1. Set to 'light-content' because the background is blue 
      */}
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Sticky Header Section:
        Placed OUTSIDE the ScrollView so it remains fixed.
        PaddingTop is dynamically set using insets.top.
      */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.patientName}>Pt. {patient?.firstName || 'User'}</Text>
        </View>
        
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutIcon} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIconText}>🚪</Text>
          </TouchableOpacity>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
            styles.scrollContent, 
            { paddingBottom: insets.bottom + 20 } // Space for bottom home indicator
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF" // Added for iOS consistency
          />
        }
      >
        {patient && (
          <>
            <ProfileCard patient={patient} profileImage={profileImage} />
            <MyDoctor />
            <NextCheckup patientId={patient?.id} />
            <MyMedications patientId={patient?.id} navigation={navigation} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Slightly cleaner background grey
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingBottom: 20, // Bottom padding to give space below the name
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24, // Subtle curve for modern look
    borderBottomRightRadius: 24,
    // Professional Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10, // Ensures header stays above content
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)', // Slightly more readable
    fontWeight: '500',
  },
  patientName: {
    fontSize: 22, // Increased size
    color: '#fff',
    fontWeight: '800', // Heavy weight for "Pro" feel
    marginTop: 2,
  },
  logoutSection: {
    alignItems: 'center',
    marginLeft: 15,
  },
  logoutIcon: {
    width: 44, // Slightly larger touch target (Apple standard)
    height: 44,
    borderRadius: 12, // Modern squircle look
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutIconText: {
    fontSize: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase', // Professional touch
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20, // Padding between the curved header and first card
  },
});