import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { appointmentService } from '../services/appointmentService';

export default function AppointmentsScreen({ navigation, route }) {
    const doctorId = route.params?.doctorId;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        completed: 0,
        cancelled: 0,
        pending: 0,
        confirmed: 0,
    });

    useEffect(() => {
        fetchAppointmentsWithFilters();
    }, []);

    useEffect(() => {
        fetchAppointmentsWithFilters();
    }, [statusFilter, selectedDate]);

    const fetchAppointmentsWithFilters = async () => {
        try {
            setLoading(true);
            const filters = {};

            if (statusFilter && statusFilter !== 'all') {
                filters.status = statusFilter;
            }

            if (selectedDate) {
                filters.date = selectedDate;
            }

            const result = await appointmentService.getAllAppointments(doctorId, filters);

            if (result.success) {
                setAppointments(result.data);
                calculateStats(result.data);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointmentsWithFilters();
    };

    const handleDateSelect = (day) => {
        setSelectedDate(day.dateString);
        setShowCalendar(false);
    };

    const getMarkedDates = () => {
        const marked = {};

        appointments.forEach(apt => {
            const date = apt.appointment_date.split('T')[0];
            if (!marked[date]) {
                marked[date] = {
                    marked: true,
                    dotColor: getStatusColor(apt.status),
                    dots: [{ color: getStatusColor(apt.status) }]
                };
            }
        });

        if (selectedDate) {
            marked[selectedDate] = {
                ...marked[selectedDate],
                selected: true,
                selectedColor: '#007AFF',
                selectedTextColor: '#fff',
            };
        }

        return marked;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Appointments</Text>
                    <View style={{ width: 60 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Appointments</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* MAIN CONTENT */}
            <FlatList
                data={appointments}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListHeaderComponent={
                    <>
                        {/* STATS SECTION */}
                        <View style={styles.statsSection}>
                            <StatBox value={stats.completed} label="Completed" color="#10b981" />
                            <StatBox value={stats.cancelled} label="Cancelled" color="#ef4444" />
                            <StatBox value={stats.pending} label="Pending" color="#f59e0b" />
                            <StatBox value={stats.confirmed} label="Confirmed" color="#3b82f6" />
                        </View>

                        {/* STATUS FILTER */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterLabel}>Filter by Status:</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.filterScroll}
                            >
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
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* CALENDAR SECTION */}
                        <View style={styles.calendarSection}>
                            <TouchableOpacity
                                style={styles.calendarButton}
                                onPress={() => setShowCalendar(!showCalendar)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.calendarButtonContent}>
                                    <Text style={styles.calendarButtonIcon}>📆</Text>
                                    <View style={styles.calendarButtonTextContainer}>
                                        <Text style={styles.calendarButtonLabel}>Select Date</Text>
                                        <Text style={styles.calendarButtonValue}>
                                            {selectedDate ? formatDate(selectedDate) : 'All Appointments'}
                                        </Text>
                                    </View>
                                    <Text style={styles.calendarDropdownIcon}>
                                        {showCalendar ? '▲' : '▼'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {showCalendar && (
                                <View style={styles.calendarContainer}>
                                    <Calendar
                                        onDayPress={handleDateSelect}
                                        markedDates={getMarkedDates()}
                                        theme={{
                                            backgroundColor: '#ffffff',
                                            calendarBackground: '#ffffff',
                                            textSectionTitleColor: '#333',
                                            selectedDayBackgroundColor: '#007AFF',
                                            selectedDayTextColor: '#ffffff',
                                            todayTextColor: '#007AFF',
                                            todayBackgroundColor: '#f0f9ff',
                                            dayTextColor: '#333',
                                            textDisabledColor: '#d9d9d9',
                                            dotColor: '#007AFF',
                                            selectedDotColor: '#ffffff',
                                            monthTextColor: '#333',
                                            textMonthFontWeight: '700',
                                            textDayFontSize: 14,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 12,
                                            arrowColor: '#007AFF',
                                        }}
                                    />
                                </View>
                            )}

                            {selectedDate && (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setSelectedDate(null)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.clearButtonIcon}>✕</Text>
                                    <Text style={styles.clearButtonText}>Clear Date Filter</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* RESULT COUNT */}
                        <View style={styles.resultSection}>
                            <Text style={styles.resultText}>
                                📍 {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.appointmentCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.cardTime}>🕒 {formatTime(item.appointment_time)}</Text>
                                <Text style={styles.cardDate}>{formatDate(item.appointment_date)}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(item.status) + '20' }
                                ]}
                            >
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardDivider} />
                        <View style={styles.cardBody}>
                            <Text style={styles.patientName}>👤 {item.patient_name}</Text>
                            <Text style={styles.appointmentType}>📋 {item.appointment_type}</Text>

                            {item.reason && (
                                <View style={styles.reasonBox}>
                                    <Text style={styles.reasonLabel}>Reason:</Text>
                                    <Text style={styles.reasonText}>{item.reason}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyText}>No appointments found</Text>
                        <Text style={styles.emptySubtext}>
                            Try adjusting your filters or date selection
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const StatBox = ({ value, label, color }) => (
    <View style={styles.statBox}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    backText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 15,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        marginTop: 4,
    },
    filterSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    filterScroll: {
        marginHorizontal: -12,
        paddingHorizontal: 12,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8,
        backgroundColor: '#fff',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    calendarSection: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        elevation: 2,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
   
    calendarButton: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#f9fafb',
        marginBottom: 8,
      },
      calendarButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      },
      calendarButtonIcon: {
        fontSize: 24,
      },
      calendarButtonTextContainer: {
        flex: 1,
      },
      calendarButtonLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
      },
      calendarButtonValue: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '700',
        marginTop: 2,
      },
      calendarDropdownIcon: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '700',
      },
      clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 6,
      },
      clearButtonIcon: {
        fontSize: 16,
        color: '#ef4444',
        fontWeight: '700',
      },
      clearButtonText: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: '600',
      },
    resultSection: {
        backgroundColor: '#f0f9ff',
        borderRadius: 8,
        padding: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        marginBottom: 15,
    },
    resultText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#007AFF',
    },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
    },
    cardTime: {
        fontSize: 14,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    cardBody: {
        padding: 12,
    },
    patientName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    appointmentType: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    reasonBox: {
        backgroundColor: '#f9fafb',
        borderRadius: 6,
        padding: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#92400e',
    },
    reasonText: {
        fontSize: 12,
        color: '#78350f',
        marginTop: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
    },
});