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
// Added professional icons
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

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
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>All Appointments</Text>
                    <View style={{ width: 44 }} />
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
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Appointments</Text>
                <View style={{ width: 44 }} />
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
                            <StatBox value={stats.completed} label="Completed" color="#10b981" icon="check-circle" />
                            <StatBox value={stats.cancelled} label="Cancelled" color="#ef4444" icon="close-circle" />
                            <StatBox value={stats.pending} label="Pending" color="#f59e0b" icon="clock-outline" />
                            <StatBox value={stats.confirmed} label="Confirmed" color="#3b82f6" icon="calendar-check" />
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
                                    <MaterialCommunityIcons name="calendar-month" size={24} color="#007AFF" />
                                    <View style={styles.calendarButtonTextContainer}>
                                        <Text style={styles.calendarButtonLabel}>Select Date</Text>
                                        <Text style={styles.calendarButtonValue}>
                                            {selectedDate ? formatDate(selectedDate) : 'All Appointments'}
                                        </Text>
                                    </View>
                                    <Ionicons 
                                        name={showCalendar ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color="#007AFF" 
                                    />
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
                                    <MaterialCommunityIcons name="close-circle-outline" size={18} color="#ef4444" />
                                    <Text style={styles.clearButtonText}>Clear Date Filter</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* RESULT COUNT */}
                        <View style={styles.resultSection}>
                             <MaterialCommunityIcons name="text-box-search-outline" size={18} color="#007AFF" style={{marginRight: 6}} />
                            <Text style={styles.resultText}>
                                {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} found
                            </Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.appointmentCard}>
                        <View style={styles.cardHeader}>
                            <View>
                                <View style={styles.timeRow}>
                                    <MaterialCommunityIcons name="clock-outline" size={16} color="#007AFF" />
                                    <Text style={styles.cardTime}>{formatTime(item.appointment_time)}</Text>
                                </View>
                                <Text style={styles.cardDate}>{formatDate(item.appointment_date)}</Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(item.status) + '15' }
                                ]}
                            >
                                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardDivider} />
                        <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                                <FontAwesome5 name="user-circle" size={14} color="#64748B" style={styles.rowIcon} />
                                <Text style={styles.patientName}>{item.patient_name}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons name="clipboard-text-outline" size={16} color="#64748B" style={styles.rowIcon} />
                                <Text style={styles.appointmentType}>{item.appointment_type}</Text>
                            </View>

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
                        <MaterialCommunityIcons name="calendar-blank" size={64} color="#CBD5E1" />
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

const StatBox = ({ value, label, color, icon }) => (
    <View style={styles.statBox}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 16,
        paddingBottom: 30,
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
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 10,
        color: '#64748B',
        marginTop: 2,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    filterSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
    },
    filterScroll: {
        marginHorizontal: -12,
        paddingHorizontal: 12,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
        backgroundColor: '#F8FAFC',
    },
    filterButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    calendarSection: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    calendarButton: {
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        padding: 14,
        backgroundColor: '#F8FAFC',
        marginBottom: 8,
      },
      calendarButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      calendarButtonTextContainer: {
        flex: 1,
        marginLeft: 12,
      },
      calendarButtonLabel: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '700',
        textTransform: 'uppercase',
      },
      calendarButtonValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '800',
        marginTop: 1,
      },
      clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        paddingVertical: 10,
        marginTop: 4,
        gap: 6,
      },
      clearButtonText: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: '700',
      },
    resultSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    resultText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#007AFF',
    },
    appointmentCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 16,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTime: {
        fontSize: 15,
        fontWeight: '800',
        color: '#007AFF',
        marginLeft: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    cardBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowIcon: {
        width: 20,
    },
    patientName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 8,
    },
    appointmentType: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 8,
        fontWeight: '500',
    },
    reasonBox: {
        backgroundColor: '#FFFBEB',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B',
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#92400E',
        textTransform: 'uppercase',
    },
    reasonText: {
        fontSize: 13,
        color: '#78350F',
        marginTop: 4,
        lineHeight: 18,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
    },
});