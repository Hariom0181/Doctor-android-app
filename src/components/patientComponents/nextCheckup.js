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
// Professional Icons
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

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
    if (daysRemaining < 0) return 'OVERDUE';
    if (daysRemaining === 0) return 'DUE TODAY';
    if (daysRemaining === 1) return 'DUE TOMORROW';
    if (daysRemaining <= 3) return 'DUE THIS WEEK';
    return 'SCHEDULED';
  };

  const getUrgencyIcon = (daysRemaining) => {
    if (daysRemaining < 0) return 'alert-circle-outline';
    if (daysRemaining === 0) return 'clock-alert-outline';
    return 'calendar-check-outline';
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        <View style={styles.container}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
                <Feather name="calendar" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyText}>No Checkup Scheduled</Text>
            <Text style={styles.emptySubtext}>Contact your doctor to book your next health assessment</Text>
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
      }
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="clipboard-pulse-outline" size={20} color="#64748B" />
          <Text style={styles.title}>Next Checkup</Text>
        </View>

        <View style={[styles.mainCard, { borderLeftColor: urgencyColor }]}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: urgencyColor + '15' }]}>
            <MaterialCommunityIcons name={getUrgencyIcon(daysRemaining)} size={14} color={urgencyColor} />
            <Text style={[styles.statusText, { color: urgencyColor }]}>{getUrgencyLabel(daysRemaining)}</Text>
          </View>

          <View style={styles.cardContent}>
            {/* Date Section */}
            <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>APPOINTMENT DATE</Text>
                <Text style={styles.dateValue}>{formatDate(checkup.date)}</Text>
            </View>

            {/* Days Remaining Box */}
            <View style={[styles.daysBox, { backgroundColor: urgencyColor }]}>
              <Text style={styles.daysNumber}>{Math.abs(daysRemaining)}</Text>
              <Text style={styles.daysLabel}>
                {daysRemaining < 0 ? 'DAYS OVERDUE' : 'DAYS TO GO'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderLeftWidth: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flex: 1,
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 22,
  },
  daysBox: {
    borderRadius: 12,
    width: 85,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  daysNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  daysLabel: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 4,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});