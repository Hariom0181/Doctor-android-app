import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { patientService } from '../services/patientService';

export default function AllMedicationsScreen({ route }) {
  const { patientId } = route.params;
  const insets = useSafeAreaInsets();

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const fetchMedications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientPrescriptions(patientId, 'active');
      setMedications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load medications:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  };

  /* ---------------- Utility Functions ---------------- */

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - today.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  };

  const getStatus = (daysRemaining) => {
    if (daysRemaining <= 0) {
      return { 
        label: 'Expired', 
        container: styles.statusExpired, 
        text: styles.textExpired,
        color: '#B71C1C' // Dark Red
      };
    }
    if (daysRemaining <= 3) {
      return { 
        label: 'Ending Soon', 
        container: styles.statusEnding, 
        text: styles.textEnding,
        color: '#E65100' // Dark Orange
      };
    }
    return { 
      label: 'Active', 
      container: styles.statusActive, 
      text: styles.textActive,
      color: '#1B5E20' // Dark Green
    };
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  const getFrequencyLabel = (frequency) => {
    const map = {
      once: '1x Daily',
      twice: '2x Daily',
      thrice: '3x Daily',
      four_times: '4x Daily',
      weekly: 'Weekly',
      as_needed: 'As Needed',
    };
    return map[frequency] || frequency || 'N/A';
  };

  /* ---------------- Sub-Components ---------------- */

  // Added a 'valueStyle' prop to allow color coding
  const Detail = ({ label, value, valueStyle }) => (
    <View style={styles.detailBox}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerTitleContainer}>
      <Text style={styles.mainTitle}>Medications</Text>
      <Text style={styles.subtitle}>Current active prescriptions</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const daysRemaining = calculateDaysRemaining(item.end_date);
    const status = getStatus(daysRemaining);

    return (
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.medicationName}>{item.medication_name}</Text>
            <Text style={styles.dosage}>{item.dosage}</Text>
          </View>
          <View style={[styles.statusBadge, status.container]}>
            <Text style={[styles.statusText, status.text]}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.grid}>
          <Detail label="Frequency" value={getFrequencyLabel(item.frequency)} />
          <Detail label="Duration" value={`${item.duration || 0} days`} />
          <Detail label="Started" value={formatDate(item.start_date)} />
          {/* Apply the dynamic status color here */}
          <Detail 
            label="Days Left" 
            value={`${daysRemaining} days`} 
            valueStyle={{ color: status.color }} 
          />
        </View>

        {item.instructions && (
          <View style={styles.instructionsBox}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.instructionsText}>{item.instructions}</Text>
          </View>
        )}

        {item.doctor_name && (
          <View style={styles.doctorBox}>
            <Text style={styles.sectionSubtitle}>Prescribed by</Text>
            <Text style={styles.doctorName}>Dr. {item.doctor_name}</Text>
            {item.specialization && (
              <Text style={styles.doctorSpec}>{item.specialization}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  /* ---------------- Main Render ---------------- */

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={[styles.mainContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <FlatList
        data={medications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
        ListEmptyComponent={
          <View style={styles.emptyCenter}>
            <Text style={styles.emptyText}>No active medications found.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCenter: {
    marginTop: 100,
    alignItems: 'center',
  },
  headerTitleContainer: {
    paddingVertical: 20,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#717171',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  dosage: {
    fontSize: 14,
    color: '#636366',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusEnding: { backgroundColor: '#FFF3E0' },
  statusExpired: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  textActive: { color: '#2E7D32' },
  textEnding: { color: '#EF6C00' },
  textExpired: { color: '#C62828' },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailBox: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 4,
  },
  instructionsBox: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 12,
    marginTop: 5,
  },
  instructionsText: {
    fontSize: 13,
    color: '#3A3A3C',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  doctorBox: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 1,
  },
  doctorSpec: {
    fontSize: 12,
    color: '#636366',
  },
});