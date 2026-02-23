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

  const displayedMedications = medications.slice(0, LIMIT);
  const hasMore = medications.length > LIMIT;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💊 Active Medications</Text>
        {medications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{medications.length}</Text>
          </View>
        )}
      </View>

      {medications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏥</Text>
          <Text style={styles.emptyText}>No Active Medications</Text>
          <Text style={styles.emptySubtext}>You don't have any active prescriptions</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={displayedMedications}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
                      <Text style={styles.dosage}>💉 {item.dosage}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        isExpired && styles.statusExpired,
                        isEnding && styles.statusEnding,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {isExpired ? 'Expired' : isEnding ? 'Ending Soon' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Frequency</Text>
                      <Text style={styles.detailValue}>
                        {getFrequencyLabel(item.frequency)}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>{item.duration} days</Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Started</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(item.start_date)}
                      </Text>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailLabel}>Days Left</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          isExpired && styles.daysLeftExpired,
                          isEnding && styles.daysLeftEnding,
                        ]}
                      >
                        {daysRemaining} days
                      </Text>
                    </View>
                  </View>

                  {item.instructions && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.instructionsBox}>
                        <Text style={styles.instructionsLabel}>📋 Instructions</Text>
                        <Text style={styles.instructionsText}>{item.instructions}</Text>
                      </View>
                    </>
                  )}

                  {item.doctor_name && (
                    <View style={styles.doctorSection}>
                      <Text style={styles.doctorLabel}>Prescribed by</Text>
                      <Text style={styles.doctorName}>👨‍⚕️ {item.doctor_name}</Text>
                      {item.specialization && (
                        <Text style={styles.doctorSpec}>{item.specialization}</Text>
                      )}
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
            >
              <Text style={styles.viewAllText}>
                View All Medications ({medications.length})
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusEnding: {
    backgroundColor: '#fff3cd',
  },
  statusExpired: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#155724',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailBox: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  daysLeftEnding: {
    color: '#ff9800',
  },
  daysLeftExpired: {
    color: '#f44336',
  },
  instructionsBox: {
    backgroundColor: '#f0f7ff',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
  },
  doctorSection: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  doctorLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  doctorSpec: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});