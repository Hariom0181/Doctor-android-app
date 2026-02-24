import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';
// Professional Icons
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

export default function MyDoctor({ onViewAll }) {

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctorImage, setDoctorImage] = useState(null);

    useEffect(() => {
        fetchLinkedDoctor();
    }, []);

    const fetchLinkedDoctor = async () => {
        try {
            const result = await patientService.getLinkedDoctors();

            if (result.success && result.data.length > 0) {
                const linkedDoctor = result.data[0];
                setDoctor(linkedDoctor);
                const imageUrl = await doctorService.getProfileImageById(linkedDoctor.id);
                setDoctorImage(imageUrl);
            }
        } catch (error) {
            console.log('Error fetching doctor:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.card, styles.loadingCenter]}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    }

    if (!doctor) {
        return (
            <View style={styles.card}>
                <View style={styles.emptyContainer}>
                    <Feather name="user-minus" size={24} color="#94A3B8" />
                    <Text style={styles.emptyText}>No primary doctor linked</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="doctor" size={18} color="#64748B" />
                <Text style={styles.title}>Primary Physician</Text>
            </View>

            <View style={styles.doctorContainer}>
                <View style={styles.imageWrapper}>
                    {doctorImage ? (
                        <Image
                            source={{ uri: doctorImage }}
                            style={styles.doctorImage}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.initials}>
                                {doctor.name.charAt(0)}
                            </Text>
                        </View>
                    )}
                    <View style={styles.verifiedBadge}>
                        <MaterialCommunityIcons name="check-decagram" size={14} color="#007AFF" />
                    </View>
                </View>

                <View style={styles.details}>
                    <Text style={styles.name}>{doctor.name}</Text>
                    
                    <View style={styles.metaRow}>
                        <View style={styles.specializationBadge}>
                            <Text style={styles.specializationText}>
                                {doctor.specialization}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.hospitalRow}>
                        <Feather name="map-pin" size={12} color="#94A3B8" />
                        <Text style={styles.hospital}>
                            {doctor.hospital}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.actionButton}>
                    <Feather name="chevron-right" size={20} color="#CBD5E1" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    loadingCenter: {
        height: 100,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    title: {
        fontSize: 13,
        fontWeight: '800',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    doctorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 16,
    },
    doctorImage: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
    },
    imagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initials: {
        fontSize: 24,
        color: '#fff',
        fontWeight: '800',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 1,
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    specializationBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    specializationText: {
        fontSize: 11,
        color: '#007AFF',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    hospitalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    hospital: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    actionButton: {
        paddingLeft: 10,
    },
    emptyContainer: {
        paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
});