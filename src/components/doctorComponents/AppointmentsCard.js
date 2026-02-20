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
import { appointmentService } from '../../services/appointmentService';

export default function AppointmentsCard({ doctorId }) {
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('today');

    useEffect(() => {
        fetchAppointments();
    }, [activeTab]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const result = await appointmentService.getTodayAppointments(doctorId);

            if (result.success) {
                setTodayAppointments(result.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointments();
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return '#10b981';
            case 'pending':
                return '#f59e0b';
            case 'cancelled':
                return '#ef4444';
            default:
                return '#6b7280';
        }
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
                <Text style={styles.title}>Today's Appointments</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'today' && styles.tabActive]}
                    onPress={() => setActiveTab('today')}
                >
                    <Text style={[styles.tabText, activeTab === 'today' && styles.tabTextActive]}>
                        Today
                    </Text>
                </TouchableOpacity>
            </View>

            {todayAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>No appointments today</Text>
                </View>
            ) : (
                <FlatList
                    data={todayAppointments}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.appointmentItem}>
                            <View style={styles.timeSection}>
                                <Text style={styles.timeIcon}>🕒</Text>
                                <Text style={styles.timeText}>
                                    {formatTime(item.appointment_time)}
                                </Text>
                            </View>

                            <View style={styles.detailsSection}>
                                <View style={styles.patientInfo}>
                                    <Text style={styles.detailIcon}>👤</Text>
                                    <Text style={styles.patientName}>{item.patient_name}</Text>
                                </View>
                                <Text style={styles.appointmentType}>
                                    📋 {item.appointment_type}
                                </Text>
                                {item.patient_phone && (
                                    <View style={styles.phoneInfo}>
                                        <Text style={styles.detailIcon}>📞</Text>
                                        <Text style={styles.phoneText}>{item.patient_phone}</Text>
                                    </View>
                                )}
                                {item.patient_blood_group && (
                                    <Text style={styles.bloodGroup}>
                                        🩸 {item.patient_blood_group}
                                    </Text>
                                )}
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(item.status) + '20' }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        { color: getStatusColor(item.status) }
                                    ]}
                                >
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Text>
                            </View>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
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
    refreshText: {
        fontSize: 18,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    tabTextActive: {
        color: '#007AFF',
    },
    appointmentItem: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 6,
        color: '#007AFF',
    },
    detailsSection: {
        flex: 1,
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
    phoneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    phoneText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    bloodGroup: {
        fontSize: 11,
        color: '#999',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
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
      refreshIcon: {
        fontSize: 18,
      },
      emptyIcon: {
        fontSize: 48,
        marginBottom: 10,
      },
      timeIcon: {
        fontSize: 16,
        marginRight: 6,
      },
      detailIcon: {
        fontSize: 14,
        marginRight: 6,
      },
});