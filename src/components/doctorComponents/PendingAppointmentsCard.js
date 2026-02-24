import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { appointmentService } from '../../services/appointmentService';
// Professional Icon Sets
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

export default function PendingAppointmentsCard({ doctorId }) {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingAppointments();
  }, []);

  const fetchPendingAppointments = async () => {
    try {
      setLoading(true);
      const result = await appointmentService.getPendingAppointments(doctorId);

      if (result.success) {
        setPendingAppointments(result.data);
      }
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingAppointments();
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleConfirm = (appointment) => {
    Alert.alert(
      'Confirm Appointment',
      `Confirm appointment with ${appointment.patient_name}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessing(appointment.id);
            try {
              const response = await appointmentService.confirmAppointment(appointment.id);

              if (response.success) {
                setPendingAppointments(prev =>
                  prev.filter(apt => apt.id !== appointment.id)
                );
                Alert.alert('Success', 'Appointment confirmed');
              } else {
                Alert.alert('Error', 'Failed to confirm');
              }

            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setProcessing(null);
            }
          },
        },
      ]
    );
  };


  const handleReject = (appointment) => {
    Alert.alert(
      'Reject Appointment',
      `Reject appointment with ${appointment.patient_name}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Reject',
          onPress: async () => {
            setProcessing(appointment.id);
            try {
              const response = await appointmentService.rejectAppointment(appointment.id);

              if (response.success) {
                setPendingAppointments(prev =>
                  prev.filter(apt => apt.id !== appointment.id)
                );
                Alert.alert('Success', 'Appointment rejected');
              } else {
                Alert.alert('Error', 'Failed to reject');
              }

            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setProcessing(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };


  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
            {/* Added Professional Header Icon */}
            <MaterialCommunityIcons name="clock-alert-outline" size={22} color="#F59E0B" />
            <Text style={styles.title}>Pending Requests</Text>
            {pendingAppointments.length > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pendingAppointments.length}</Text>
                </View>
            )}
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {pendingAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Feather name="check-circle" size={32} color="#10B981" />
          </View>
          <Text style={styles.emptyText}>All Caught Up!</Text>
          <Text style={styles.emptySubtext}>No pending requests at the moment</Text>
        </View>
      ) : (
        <FlatList
          data={pendingAppointments}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.appointmentItem}>
              <View style={styles.dateSection}>
                <MaterialCommunityIcons name="calendar-clock" size={18} color="#D97706" />
                <View style={styles.dateInfo}>
                  <Text style={styles.dateText}>
                    {formatDate(item.appointment_date)}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTime(item.appointment_time)}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsSection}>
                <View style={styles.patientInfo}>
                  <Feather name="user" size={14} color="#64748B" />
                  <Text style={styles.patientName}>{item.patient_name}</Text>
                </View>

                <Text style={styles.appointmentType}>
                  {item.appointment_type}
                </Text>

                {item.patient_email && (
                  <Text style={styles.email}>{item.patient_email}</Text>
                )}

                {item.reason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>Reason for visit:</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                  </View>
                )}
              </View>

              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={() => handleConfirm(item)}
                  disabled={processing === item.id}
                >
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(item)}
                  disabled={processing === item.id}
                >
                  <Feather name="x" size={16} color="#fff" />
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  loadingCenter: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9, // Refined gap for better icon/text proximity
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  appointmentItem: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 4,
  },
  dateInfo: {
    marginLeft: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  timeText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: 14,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  appointmentType: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  email: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  reasonBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reasonText: {
    fontSize: 13,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 18,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});