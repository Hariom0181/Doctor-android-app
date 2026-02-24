import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { patientService } from '../../services/patientService';
// Professional Icon Sets
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

export default function MyMedications({ patientId, navigation }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const LIMIT = 1;

  useEffect(() => {
    if (patientId) {
      loadMedications();
    }
  }, [patientId]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientPrescriptions(patientId, 'active');
      setMedications(data || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMedications();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'once': '1x Daily',
      'twice': '2x Daily',
      'thrice': '3x Daily',
      'four_times': '4x Daily',
      'weekly': 'Weekly',
      'as_needed': 'As Needed'
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const activeMedications = medications.filter(med => {
    const end = new Date(med.end_date);
    const today = new Date();
    return end > today;
  });

  const displayedMedications = activeMedications.slice(0, LIMIT);
  const hasMore = activeMedications.length > LIMIT;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="pill" size={20} color="#64748B" />
          <Text style={styles.title}>Active Medications</Text>
        </View>
        {activeMedications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeMedications.length}</Text>
          </View>
        )}
      </View>

      {activeMedications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
             <MaterialCommunityIcons name="medical-bag" size={32} color="#94A3B8" />
          </View>
          <Text style={styles.emptyText}>No Active Medications</Text>
          <Text style={styles.emptySubtext}>Your active prescription list is currently empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={displayedMedications}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
            }
            renderItem={({ item }) => {
              const daysRemaining = getDaysRemaining(item.end_date);
              const isEnding = daysRemaining <= 3 && daysRemaining > 0;
              const isExpired = daysRemaining <= 0;

              return (
                <View style={styles.medicationCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{item.medication_name}</Text>
                      <View style={styles.dosageRow}>
                         <MaterialCommunityIcons name="iv-bag" size={14} color="#64748B" />
                         <Text style={styles.dosage}>{item.dosage}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isExpired && styles.statusExpired,
                        isEnding && styles.statusEnding,
                      ]}
                    >
                      <Text style={[
                        styles.statusText,
                        isExpired && { color: '#B91C1C' },
                        isEnding && { color: '#B45309' }
                      ]}>
                        {isExpired ? 'EXPIRED' : isEnding ? 'ENDING SOON' : 'ACTIVE'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>FREQUENCY</Text>
                      <Text style={styles.detailValue}>
                        {getFrequencyLabel(item.frequency)}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>DURATION</Text>
                      <Text style={styles.detailValue}>{item.duration} Days</Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>STARTED</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(item.start_date)}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>DAYS LEFT</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          isExpired && styles.daysLeftExpired,
                          isEnding && styles.daysLeftEnding,
                        ]}
                      >
                        {daysRemaining} Days
                      </Text>
                    </View>
                  </View>

                  {item.instructions && (
                    <View style={styles.instructionsBox}>
                      <View style={styles.instructionsHeader}>
                        <Feather name="info" size={14} color="#007AFF" />
                        <Text style={styles.instructionsLabel}>PATIENT INSTRUCTIONS</Text>
                      </View>
                      <Text style={styles.instructionsText}>{item.instructions}</Text>
                    </View>
                  )}

                  {item.doctor_name && (
                    <View style={styles.doctorSection}>
                      <View style={styles.doctorInfo}>
                        <View style={styles.doctorAvatar}>
                           <FontAwesome5 name="user-md" size={14} color="#007AFF" />
                        </View>
                        <View>
                           <Text style={styles.doctorLabel}>PRESCRIBING PHYSICIAN</Text>
                           <Text style={styles.doctorName}>{item.doctor_name}</Text>
                           {item.specialization && (
                             <Text style={styles.doctorSpec}>{item.specialization}</Text>
                           )}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            }}
          />

          {hasMore && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllMedications', { patientId })}
              activeOpacity={0.8}
            >
              <Text style={styles.viewAllText}>
                View All Medications ({activeMedications.length})
              </Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderLeftWidth: 6,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dosage: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusEnding: {
    backgroundColor: '#FEF3C7',
  },
  statusExpired: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  detailBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  daysLeftEnding: {
    color: '#D97706',
  },
  daysLeftExpired: {
    color: '#DC2626',
  },
  instructionsBox: {
    backgroundColor: '#EFF6FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  instructionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  instructionsText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
    fontWeight: '500',
  },
  doctorSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  doctorLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  doctorSpec: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    elevation: 2,
  },
  viewAllText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});