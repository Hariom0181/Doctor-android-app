import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { patientService } from '../services/patientService';
import ProfileCard from '../components/doctorComponents/ProfileCard';
import ActivePatientsCard from '../components/doctorComponents/ActivePatientsCard';
import AppointmentsCard from '../components/doctorComponents/AppointmentsCard';
import PendingAppointmentsCard from '../components/doctorComponents/PendingAppointmentsCard';

export default function DoctorDashboard({ navigation }) {
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
            {/* PROFESSIONAL HEADER */}
            {/* PROFESSIONAL HEADER */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Welcome back</Text>
                    <Text style={styles.doctorName}>Dr. {doctor?.firstName}</Text>
                </View>
                <View style={styles.logoutSection}>
                    <TouchableOpacity style={styles.logoutIcon} onPress={handleLogout}>
                        <Text style={styles.logoutIconText}>🚪</Text>
                    </TouchableOpacity>
                    <Text style={styles.logoutText}>Logout</Text>
                </View>
            </View>

            {/* MAIN CONTENT SCROLL */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ProfileCard doctor={doctor} />
                <ActivePatientsCard onViewAll={handleViewPatient} />
                <AppointmentsCard doctorId={doctor?.id} />
                <PendingAppointmentsCard doctorId={doctor?.id} />

                {/* VIEW ALL APPOINTMENTS BUTTON */}
                <TouchableOpacity
                    style={styles.viewAllAppointmentsButton}
                    onPress={() =>
                        navigation.navigate('AppointmentsScreen', { doctorId: doctor?.id })
                    }
                    activeOpacity={0.8}
                >
                    <View style={styles.buttonContent}>
                        <Text style={styles.buttonIcon}>📅</Text>
                        <View style={styles.buttonTextContainer}>
                            <Text style={styles.buttonMainText}>View All Appointments</Text>
                            <Text style={styles.buttonSubText}>Manage complete schedule</Text>
                        </View>
                        <Text style={styles.buttonArrow}>→</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* PATIENT MODAL */}
            {showPatientModal && viewingPatient && (
                <Modal visible animationType="slide">
                    <View style={styles.modalContainer}>
                        {/* MODAL HEADER */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => {
                                    setShowPatientModal(false);
                                    setViewingPatient(null);
                                    setPatientProfileImage(null);
                                }}
                            >
                                <Text style={styles.modalCloseText}>← Back</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Patient Details</Text>
                            <View style={{ width: 60 }} />
                        </View>

                        {/* MODAL CONTENT */}
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
                                    {/* PATIENT IMAGE */}
                                    {patientProfileImage && (
                                        <Image
                                            source={{ uri: patientProfileImage }}
                                            style={styles.patientModalImage}
                                        />
                                    )}

                                    {/* PATIENT INFO CARD */}
                                    <View style={styles.patientInfoCard}>
                                        <Text style={styles.patientNameModal}>
                                            {viewingPatient?.firstName} {viewingPatient?.lastName}
                                        </Text>
                                        <Text style={styles.patientId}>ID: {viewingPatient?.id}</Text>

                                        {/* INFO GRID */}
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
                                                    {viewingPatient?.bloodGroup}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* CONTACT INFO */}
                                        <View style={styles.contactSection}>
                                            <Text style={styles.sectionTitle}>Contact Information</Text>
                                            <View style={styles.contactItem}>
                                                <Text style={styles.contactIcon}>📅</Text>
                                                <Text style={styles.contactText}>
                                                    DOB: {viewingPatient?.dateOfBirth
                                                        ? new Date(viewingPatient.dateOfBirth).toLocaleDateString()
                                                        : 'N/A'}
                                                </Text>
                                            </View>
                                            <View style={styles.contactItem}>
                                                <Text style={styles.contactIcon}>📧</Text>
                                                <Text style={styles.contactText}>{viewingPatient?.email}</Text>
                                            </View>
                                            <View style={styles.contactItem}>
                                                <Text style={styles.contactIcon}>📞</Text>
                                                <Text style={styles.contactText}>{viewingPatient?.phone}</Text>
                                            </View>
                                        </View>
                                        {/* MEDICAL INFO */}
                                        <View style={styles.medicalSection}>
                                            <Text style={styles.sectionTitle}>Medical Information</Text>
                                            <View style={styles.medicalBox}>
                                                <Text style={styles.medicalLabel}>Allergies</Text>
                                                <Text style={styles.medicalValue}>
                                                    {viewingPatient?.allergies || 'None reported'}
                                                </Text>
                                            </View>
                                            <View style={styles.medicalBox}>
                                                <Text style={styles.medicalLabel}>Medical History</Text>
                                                <Text style={styles.medicalValue}>
                                                    {viewingPatient?.medicalHistory || 'No history recorded'}
                                                </Text>
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
        backgroundColor: '#f5f5f5',
        paddingTop: 30,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    doctorName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '700',
        marginTop: 2,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 20,
    },
    viewAllAppointmentsButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        marginBottom: 15,
      },
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
    modalContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 30,
    },
    modalHeader: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
    },
    modalCloseButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    modalScrollView: {
        flex: 1,
    },
    modalScrollContent: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingBottom: 20,
    },
    patientModalImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    patientInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        elevation: 2,
    },
    patientNameModal: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    patientId: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 15,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '700',
        marginTop: 4,
    },
    contactSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    contactIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    contactText: {
        fontSize: 13,
        color: '#333',
    },
    medicalSection: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 8,
    },
    medicalBox: {
        marginBottom: 12,
    },
    medicalLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
        marginBottom: 4,
    },
    medicalValue: {
        fontSize: 13,
        color: '#333',
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
});