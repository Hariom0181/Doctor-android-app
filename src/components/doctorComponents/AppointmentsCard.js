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
// Professional icons
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

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
            <View style={[styles.card, styles.loadingCenter]}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <MaterialCommunityIcons name="calendar-clock" size={20} color="#007AFF" />
                    <Text style={styles.title}>Today's Schedule</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Ionicons name="reload" size={18} color="#007AFF" />
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
                    {todayAppointments.length > 0 && (
                         <View style={styles.badge}>
                            <Text style={styles.badgeText}>{todayAppointments.length}</Text>
                         </View>
                    )}
                </TouchableOpacity>
            </View>

            {todayAppointments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="clipboard-blank-outline" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No appointments today</Text>
                </View>
            ) : (
                <FlatList
                    data={todayAppointments}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <View style={styles.appointmentItem}>
                            <View style={styles.leftBar} />
                            
                            <View style={styles.mainContent}>
                                <View style={styles.timeSection}>
                                    <MaterialCommunityIcons name="clock-outline" size={14} color="#007AFF" />
                                    <Text style={styles.timeText}>
                                        {formatTime(item.appointment_time)}
                                    </Text>
                                </View>

                                <View style={styles.detailsSection}>
                                    <View style={styles.patientInfo}>
                                        <Text style={styles.patientName}>{item.patient_name}</Text>
                                    </View>
                                    
                                    <View style={styles.metaRow}>
                                        <Text style={styles.appointmentType}>
                                            {item.appointment_type}
                                        </Text>
                                        {item.patient_blood_group && (
                                            <>
                                                <Text style={styles.dotSeparator}>•</Text>
                                                <Text style={styles.bloodGroup}>
                                                    Blood: {item.patient_blood_group}
                                                </Text>
                                            </>
                                        )}
                                    </View>

                                    {item.patient_phone && (
                                        <View style={styles.phoneInfo}>
                                            <Feather name="phone" size={12} color="#64748B" />
                                            <Text style={styles.phoneText}>{item.patient_phone}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View
                                style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(item.status) + '15' }
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

// Added Feather for the small phone icon
import { Feather } from '@expo/vector-icons';

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tab: {
        paddingVertical: 10,
        marginRight: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tabActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
    },
    tabTextActive: {
        color: '#007AFF',
    },
    badge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#007AFF',
    },
    appointmentItem: {
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    leftBar: {
        width: 4,
        height: '100%',
        backgroundColor: '#007AFF',
    },
    mainContent: {
        flex: 1,
        padding: 12,
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    timeText: {
        fontSize: 13,
        fontWeight: '800',
        marginLeft: 4,
        color: '#007AFF',
    },
    detailsSection: {
        marginTop: 2,
    },
    patientName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    appointmentType: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
    },
    dotSeparator: {
        marginHorizontal: 6,
        color: '#CBD5E1',
    },
    bloodGroup: {
        fontSize: 12,
        color: '#EF4444',
        fontWeight: '700',
    },
    phoneInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: 4,
    },
    phoneText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});