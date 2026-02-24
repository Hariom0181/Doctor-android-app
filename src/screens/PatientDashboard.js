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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

// Professional Icons
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

// Components
import MyMedications from '../components/patientComponents/myMedication';
import NextCheckup from '../components/patientComponents/nextCheckup';
import ProfileCard from '../components/patientComponents/patient_ProfileCard';
import MyDoctor from '../components/patientComponents/myDoctor';

export default function PatientDashboard({ navigation }) {
  const insets = useSafeAreaInsets();
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
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      
      {/* Sticky Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View style={styles.greetingRow}>
             <Feather name="sun" size={14} color="rgba(255,255,255,0.8)" />
             <Text style={styles.headerTitle}> WELCOME BACK</Text>
          </View>
          <Text style={styles.patientName}>Pt. {patient?.firstName || 'User'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconCircle}>
            <MaterialCommunityIcons name="logout-variant" size={20} color="#fff" />
          </View>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
            styles.scrollContent, 
            { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {patient && (
          <View style={styles.contentWrapper}>
            <ProfileCard patient={patient} profileImage={profileImage} />
            
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>Medical Overview</Text>
               <View style={styles.divider} />
            </View>

            <MyDoctor />
            <NextCheckup patientId={patient?.id} />
            <MyMedications patientId={patient?.id} navigation={navigation} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Classic Slate 100 for a clean backdrop
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // Professional depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  patientName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  contentWrapper: {
    gap: 16, // Consistent spacing between cards
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
});