import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { patientService } from '../../services/patientService';

export default function NextCheckup({ patientId }) {
  const [checkup, setCheckup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    if (patientId) {
      loadCheckup();
    }
  }, [patientId]);

  const loadCheckup = async () => {
    try {
      setLoading(true);
      const data = await patientService.getNextCheckup(patientId);
      setCheckup(data);
    } catch (error) {
      console.error('Error loading checkup:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    loadCheckup();
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining < 0) return '#ef4444'; // Overdue
    if (daysRemaining === 0) return '#f59e0b'; // Today
    if (daysRemaining <= 3) return '#f59e0b'; // Soon
    return '#10b981'; // OK
  };

  const getUrgencyLabel = (daysRemaining) => {
    if (daysRemaining < 0) return '⚠️ Overdue';
    if (daysRemaining === 0) return '🔴 Today';
    if (daysRemaining === 1) return '🟠 Tomorrow';
    if (daysRemaining <= 3) return '🟠 This Week';
    return '✅ Scheduled';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!checkup) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No Checkup Scheduled</Text>
            <Text style={styles.emptySubtext}>Contact your doctor to book an appointment</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const daysRemaining = checkup.daysRemaining || 0;
  const urgencyColor = getUrgencyColor(daysRemaining);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Next Checkup</Text>
        </View>

        <View style={[styles.mainCard, { borderLeftColor: urgencyColor }]}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: urgencyColor }]}>
            <Text style={styles.statusText}>{getUrgencyLabel(daysRemaining)}</Text>
          </View>

          {/* Date Section */}
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>📅 Date</Text>
            <Text style={styles.dateValue}>{formatDate(checkup.date)}</Text>
          </View>

          {/* Days Remaining */}
          <View style={styles.daysSection}>
            <View style={[styles.daysBox, { backgroundColor: urgencyColor }]}>
              <Text style={styles.daysNumber}>{Math.abs(daysRemaining)}</Text>
              <Text style={styles.daysLabel}>
                {daysRemaining < 0 ? 'Days Overdue' : 'Days Left'}
              </Text>
            </View>
          </View>

          {/* Divider */}
          {/* <View style={styles.divider} /> */}

          {/* Doctor Info - Simple */}
          {/* <View style={styles.doctorSimpleSection}>
            <Text style={styles.doctorLabel}>👨‍⚕️ Doctor</Text>
            <Text style={styles.doctorNameOnly}>{checkup.doctorName}</Text>
            {checkup.specialization && (
              <Text style={styles.doctorSpec}>{checkup.specialization}</Text>
            )}
          </View> */}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    elevation: 4,
    borderLeftWidth: 5,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  dateSection: {
    marginBottom: 14,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  daysSection: {
    marginBottom: 14,
  },
  daysBox: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  daysLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 14,
  },
  doctorSimpleSection: {
    marginTop: 8,
  },
  doctorLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
  },
  doctorNameOnly: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  doctorSpec: {
    fontSize: 12,
    color: '#999',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});