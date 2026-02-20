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
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Pending Requests</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>

        {pendingAppointments.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingAppointments.length}</Text>
          </View>
        )}
      </View>

      {pendingAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✅</Text>
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
                <Text>📅</Text>
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
                  <Text>👤</Text>
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
                    <Text style={styles.reasonLabel}>Reason:</Text>
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
                  <Text>✅</Text>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  onPress={() => handleReject(item)}
                  disabled={processing === item.id}
                >
                  <Text>❌</Text>
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
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentItem: {
    borderWidth: 1,
    borderColor: '#fcd34d',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInfo: {
    marginLeft: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },
  timeText: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
  },
  detailsSection: {
    marginBottom: 10,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 6,
  },
  appointmentType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 6,
  },
  reasonBox: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  reasonText: {
    fontSize: 12,
    color: '#78350f',
    marginTop: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});