import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Added professional icon imports
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

import ActivePatientsCard from '../components/doctorComponents/ActivePatientsCard';
import AppointmentsCard from '../components/doctorComponents/AppointmentsCard';
import PendingAppointmentsCard from '../components/doctorComponents/PendingAppointmentsCard';
import ProfileCard from '../components/doctorComponents/ProfileCard';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';

export default function DoctorDashboard({ navigation }) {
  const insets = useSafeAreaInsets();
  const [doctor, setDoctor] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [patientProfileImage, setPatientProfileImage] = useState(null);
  const [loadingPatientImage, setLoadingPatientImage] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      setDoctor(JSON.parse(userData));
    }
  };

  useEffect(() => {
    if (viewingPatient?.id) {
      loadProfileImagePatients(viewingPatient.id);
    }
  }, [viewingPatient?.id]);

  const loadProfileImagePatients = async (patientId) => {
    try {
      setLoadingPatientImage(true);
      const imageUrl = await patientService.getProfileImage(patientId);
      setPatientProfileImage(imageUrl || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPatientImage(false);
    }
  };

  const handleViewPatient = async (patientId) => {
    try {
      const details = await patientService.getPatientDetails(patientId, 'doctor');
      setViewingPatient(details);
      setShowPatientModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />

      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Welcome back</Text>
          <Text style={styles.doctorName}>Dr. {doctor?.firstName}</Text>
        </View>
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutIcon} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            {/* Replaced emoji with professional Logout icon */}
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileCard doctor={doctor} />
        <ActivePatientsCard onViewAll={handleViewPatient} />
        <AppointmentsCard doctorId={doctor?.id} />
        <PendingAppointmentsCard doctorId={doctor?.id} />

        <TouchableOpacity
          style={styles.viewAllAppointmentsButton}
          onPress={() =>
            navigation.navigate('AppointmentsScreen', { doctorId: doctor?.id })
          }
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            {/* Replaced emoji with professional Calendar icon */}
            <MaterialCommunityIcons name="calendar-clock" size={28} color="#007AFF" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonMainText}>View All Appointments</Text>
              <Text style={styles.buttonSubText}>Manage complete schedule</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#007AFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {showPatientModal && viewingPatient && (
        <Modal visible animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => {
                            setShowPatientModal(false);
                            setViewingPatient(null);
                            setPatientProfileImage(null);
                        }}
                    >
                        {/* Replaced text back button with Icon */}
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Patient Details</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    style={styles.modalScrollView}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {loadingPatientImage ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                        </View>
                    ) : (
                        <>
                            {patientProfileImage ? (
                                <Image
                                    source={{ uri: patientProfileImage }}
                                    style={styles.patientModalImage}
                                />
                            ) : (
                                <View style={[styles.patientModalImage, {backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center'}]}>
                                     <FontAwesome5 name="user" size={40} color="#94A3B8" />
                                </View>
                            )}
                            <View style={styles.patientInfoCard}>
                                <Text style={styles.patientNameModal}>
                                    {viewingPatient?.firstName} {viewingPatient?.lastName}
                                </Text>
                                <Text style={styles.patientId}>ID: {viewingPatient?.id}</Text>
                                <View style={styles.infoGrid}>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>Age</Text>
                                        <Text style={styles.infoValue}>
                                            {calculateAge(viewingPatient?.dateOfBirth)} years
                                        </Text>
                                    </View>
                                    <View style={styles.infoBox}>
                                        <Text style={styles.infoLabel}>Blood Group</Text>
                                        <Text style={styles.infoValue}>
                                            {viewingPatient?.bloodGroup || 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.contactSection}>
                                    <Text style={styles.sectionTitle}>Contact Information</Text>
                                    <View style={styles.contactItem}>
                                        <MaterialCommunityIcons name="email-outline" size={18} color="#007AFF" style={{marginRight: 10}} />
                                        <Text style={styles.contactText}>{viewingPatient?.email}</Text>
                                    </View>
                                    <View style={styles.contactItem}>
                                        <MaterialCommunityIcons name="phone-outline" size={18} color="#007AFF" style={{marginRight: 10}} />
                                        <Text style={styles.contactText}>{viewingPatient?.phone}</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
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
    elevation: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '900',
    marginTop: 2,
  },
  logoutSection: {
    alignItems: 'center',
  },
  logoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewAllAppointmentsButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  buttonContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    gap: 15 
  },
  buttonTextContainer: { flex: 1 },
  buttonMainText: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  buttonSubText: { fontSize: 13, color: '#64748B', marginTop: 2 },
  modalContainer: { flex: 1, backgroundColor: '#F8F9FB' },
  modalHeader: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 15, 
    height: 60,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    elevation: 4 
  },
  modalCloseButton: { 
    width: 44,
    height: 44,
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  modalScrollView: { flex: 1 },
  modalScrollContent: { paddingHorizontal: 20, paddingVertical: 25 },
  patientModalImage: { 
    width: 130, 
    height: 130, 
    borderRadius: 65, 
    alignSelf: 'center', 
    marginBottom: 25, 
    borderWidth: 4, 
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  patientInfoCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 24, 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  patientNameModal: { fontSize: 24, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
  patientId: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 25, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  infoBox: { flex: 1, backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '800', textTransform: 'uppercase' },
  infoValue: { fontSize: 16, color: '#0F172A', fontWeight: '700', marginTop: 4 },
  contactSection: { marginTop: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  contactText: { fontSize: 15, color: '#334155', fontWeight: '500' },
});