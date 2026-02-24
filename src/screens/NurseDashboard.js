import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { nurseService } from '../services/nurseService';

export default function NurseDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [nurse, setNurse] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNurseData();
  }, []);

  useEffect(() => {
    if (nurse?.id) {
      loadAssignedPatients();
    }
  }, [nurse?.id]);

  const loadNurseData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setNurse(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading nurse data:', error);
    }
  };

  const loadAssignedPatients = async () => {
    try {
      setLoading(true);
      const data = await nurseService.getAssignedPatients();
      setPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignedPatients();
  };

  const handleLogout = async () => {
    await authService.logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'login' }],
    });
  };

  const handlePatientTap = (patient) => {
    navigation.navigate('NursePatientDetail', { patient });
  };

  const renderPatientCard = ({ item }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => handlePatientTap(item)}
      activeOpacity={0.8}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.patientEmail}>{item.email}</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ACTIVE</Text>
        </View>
      </View>

      <View style={styles.patientDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>BLOOD GROUP</Text>
          <Text style={styles.detailValue}>{item.bloodGroup || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>CONTACT</Text>
          <Text style={styles.detailValue}>{item.phone || 'N/A'}</Text>
        </View>
      </View>

      {item.allergies && (
        <View style={styles.allergiesBox}>
          <Text style={styles.allergiesLabel}>⚠️ KNOWN ALLERGIES</Text>
          <Text style={styles.allergiesText} numberOfLines={2}>{item.allergies}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.medicationBtn]}
          onPress={() => navigation.navigate('NurseLogMedication', { patient: item })}
        >
          <Text style={styles.medicationBtnText}>💊 Log Meds</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.notesBtn]}
          onPress={() => navigation.navigate('NurseAddNote', { patient: item })}
        >
          <Text style={styles.notesBtnText}>📝 Add Note</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoTitle}>Nurse Profile</Text>
          <View style={styles.hospitalBadge}>
            <Text style={styles.hospitalText}>{nurse?.currentHospital || 'Staff'}</Text>
          </View>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoGrid}>
          <View style={styles.infoGridItem}>
            <Text style={styles.infoLabel}>QUALIFICATION</Text>
            <Text style={styles.infoValue}>{nurse?.qualification || 'N/A'}</Text>
          </View>
          <View style={styles.infoGridItem}>
            <Text style={styles.infoLabel}>LICENSE NO.</Text>
            <Text style={styles.infoValue}>{nurse?.licenseNumber || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assigned Patients</Text>
        {patients.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{patients.length}</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>No Active Assignments</Text>
      <Text style={styles.emptySubtext}>You are currently up to date.</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('NursePatientsList')}
      >
        <View style={[styles.actionIconCircle, {backgroundColor: '#EBF5FF'}]}>
          <Text style={{fontSize: 20}}>👥</Text>
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Patient Records</Text>
          <Text style={styles.actionCardSubtitle}>Access detailed medical history</Text>
        </View>
        <Text style={styles.actionCardArrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionCard}
        onPress={() => navigation.navigate('NurseActivityLog')}
      >
        <View style={[styles.actionIconCircle, {backgroundColor: '#F0FDF4'}]}>
          <Text style={{fontSize: 20}}>📊</Text>
        </View>
        <View style={styles.actionCardContent}>
          <Text style={styles.actionCardTitle}>Activity Log</Text>
          <Text style={styles.actionCardSubtitle}>Review your shift history</Text>
        </View>
        <Text style={styles.actionCardArrow}>→</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0056b3" />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerWelcome}>Welcome back,</Text>
          <Text style={styles.nurseName}>Nurse {nurse?.firstName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutLabel}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={patients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPatientCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FC' },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerContent: { flex: 1 },
  headerWelcome: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  nurseName: { fontSize: 24, color: '#fff', fontWeight: '800', marginTop: 2 },
  logoutBtn: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 8, borderRadius: 12 },
  logoutIcon: { fontSize: 18 },
  logoutLabel: { color: '#fff', fontSize: 9, fontWeight: '800', marginTop: 2 },

  listContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Profile Section
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 15,
  },
  infoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoTitle: { fontSize: 16, fontWeight: '800', color: '#1A1C1E' },
  hospitalBadge: { backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  hospitalText: { fontSize: 11, fontWeight: '700', color: '#007AFF' },
  infoDivider: { height: 1, backgroundColor: '#F0F2F5', marginVertical: 15 },
  infoGrid: { flexDirection: 'row' },
  infoGridItem: { flex: 1 },
  infoLabel: { fontSize: 10, color: '#8E949A', fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, color: '#1A1C1E', fontWeight: '700', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1C1E', flex: 1 },
  badge: { backgroundColor: '#007AFF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  // Patient Cards
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderLeftWidth: 6,
    borderLeftColor: '#10B981',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  patientHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  patientName: { fontSize: 18, fontWeight: '800', color: '#1A1C1E' },
  patientEmail: { fontSize: 13, color: '#667085', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', color: '#047857' },
  patientDetails: { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, marginBottom: 12 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 9, color: '#8E949A', fontWeight: '800' },
  detailValue: { fontSize: 14, color: '#1A1C1E', fontWeight: '700', marginTop: 2 },
  allergiesBox: { backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#F59E0B' },
  allergiesLabel: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  allergiesText: { fontSize: 13, color: '#B45309', marginTop: 4, fontWeight: '500' },

  actionButtons: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  medicationBtn: { backgroundColor: '#007AFF' },
  notesBtn: { backgroundColor: '#F2F4F7' },
  medicationBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  notesBtnText: { color: '#344054', fontSize: 13, fontWeight: '700' },

  // Footer Actions
  section: { marginTop: 10 },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  actionIconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionCardContent: { flex: 1 },
  actionCardTitle: { fontSize: 15, fontWeight: '700', color: '#1A1C1E' },
  actionCardSubtitle: { fontSize: 12, color: '#667085', marginTop: 2 },
  actionCardArrow: { fontSize: 18, color: '#D0D5DD', fontWeight: 'bold' },

  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyText: { fontSize: 17, fontWeight: '700', color: '#1A1C1E' },
  emptySubtext: { fontSize: 14, color: '#667085', marginTop: 5 },
});