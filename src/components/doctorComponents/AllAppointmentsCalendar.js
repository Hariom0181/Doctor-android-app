import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { appointmentService } from '../../services/appointmentService';

export default function AllAppointmentsCalendar({ doctorId }) {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [stats, setStats] = useState({
        completed: 0,
        cancelled: 0,
        pending: 0,
        confirmed: 0,
    });

    useEffect(() => {
        if (doctorId) {
            fetchAllAppointments();
        }
    }, [doctorId]);

    const fetchAllAppointments = async () => {
        try {
            setLoading(true);
            const result = await appointmentService.getAllAppointments(doctorId);

            if (result.success) {
                setAppointments(result.data);
                calculateStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        setStats({
            completed: data.filter(a => a.status === 'completed').length,
            cancelled: data.filter(a => a.status === 'cancelled').length,
            pending: data.filter(a => a.status === 'pending').length,
            confirmed: data.filter(a => a.status === 'confirmed').length,
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'cancelled': return '#ef4444';
            case 'pending': return '#f59e0b';
            case 'confirmed': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const appDate = app.appointment_date.split('T')[0];

        const matchStatus =
            statusFilter === 'all' || app.status === statusFilter;

        const matchDate =
            !selectedDate || appDate === selectedDate;

        return matchStatus && matchDate;
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <FlatList
            data={filteredAppointments}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.container}
            ListHeaderComponent={
                <>
                    <Text style={styles.title}>
                        <MaterialCommunityIcons name="calendar-month" size={22} color="#007AFF" />
                        {'  '}All Appointments
                    </Text>

                    {/* ===== Stats Section ===== */}
                    <View style={styles.statsContainer}>
                        <StatBox
                            icon="check-circle"
                            color="#10b981"
                            value={stats.completed}
                            label="Completed"
                        />
                        <StatBox
                            icon="close-circle"
                            color="#ef4444"
                            value={stats.cancelled}
                            label="Cancelled"
                        />
                        <StatBox
                            icon="clock-outline"
                            color="#f59e0b"
                            value={stats.pending}
                            label="Pending"
                        />
                    </View>

                    {/* ===== Status Filter ===== */}
                    <View style={styles.filterContainer}>
                        {['all', 'completed', 'pending', 'cancelled', 'confirmed'].map(status => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterButton,
                                    statusFilter === status && styles.filterButtonActive
                                ]}
                                onPress={() => setStatusFilter(status)}
                            >
                                <Text
                                    style={[
                                        styles.filterButtonText,
                                        statusFilter === status && styles.filterButtonTextActive
                                    ]}
                                >
                                    {status.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ===== Date Picker ===== */}
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <MaterialCommunityIcons name="calendar" size={18} color="#333" />
                        <Text style={styles.dateText}>
                            {selectedDate
                                ? formatDate(selectedDate)
                                : ' Select Date (All Dates)'}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (date) {
                                    setSelectedDate(date.toISOString().split('T')[0]);
                                }
                            }}
                        />
                    )}
                </>
            }
            renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommunityIcons
                                name="clock-outline"
                                size={16}
                                color="#007AFF"
                            />
                            <Text style={styles.timeText}>
                                {' '}{formatTime(item.appointment_time)}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.statusBadge,
                                { backgroundColor: getStatusColor(item.status) + '30' }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    { color: getStatusColor(item.status) }
                                ]}
                            >
                                {item.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <MaterialCommunityIcons name="account" size={16} color="#333" />
                        <Text style={styles.patientName}>
                            {' '}{item.patient_name}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="file-document-outline" size={16} color="#666" />
                        <Text style={styles.appointmentType}>
                            {' '}{item.appointment_type}
                        </Text>
                    </View>

                    {item.reason && (
                        <Text style={styles.reason}>
                            Reason: {item.reason}
                        </Text>
                    )}
                </View>
            )}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No appointments found
                    </Text>
                </View>
            }
        />
    );
}

/* ===== Small Reusable Stat Component ===== */
const StatBox = ({ icon, color, value, label }) => (
    <View style={styles.statBox}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.statNumber, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

/* ===== Styles ===== */
const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        color: '#1a1a1a',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    filterContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8,
        marginBottom: 8,
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    dateInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    dateText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#333',
    },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        fontWeight: '600',
        color: '#007AFF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    patientName: {
        fontSize: 14,
        fontWeight: '600',
    },
    appointmentType: {
        fontSize: 12,
        color: '#666',
    },
    reason: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        fontStyle: 'italic',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
    },
});
