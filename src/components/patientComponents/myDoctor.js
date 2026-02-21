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

export default function MyDoctor({ onViewAll }) {

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctorImage, setDoctorImage] = useState(null);

    useEffect(() => {
        fetchLinkedDoctor();
        // console.log("Doctor Image URL:", doctorImage);
    }, []);

    const fetchLinkedDoctor = async () => {
        try {
            const result = await patientService.getLinkedDoctors();

            if (result.success && result.data.length > 0) {
                const linkedDoctor = result.data[0]; // only one doctor
                setDoctor(linkedDoctor);
                const imageUrl = await doctorService.getProfileImageById(linkedDoctor.id);
                setDoctorImage(imageUrl);

                // optional: load image if you have API
                // const imageUrl = await doctorService.getProfileImage(linkedDoctor.id);
                // setDoctorImage(imageUrl);
            }
        } catch (error) {
            console.log('Error fetching doctor:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    }

    if (!doctor) {
        return (
            <View style={styles.card}>
                <Text style={styles.emptyText}>No doctor linked</Text>
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <Text style={styles.title}>My Doctor</Text>

            <View style={styles.doctorContainer}>
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

                <View style={styles.details}>
                    <Text style={styles.name}>{doctor.name}</Text>
                    <Text style={styles.specialization}>
                        {doctor.specialization}
                    </Text>
                    <Text style={styles.hospital}>
                        {doctor.hospital}
                    </Text>
                </View>
            </View>
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
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    doctorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    imagePlaceholder: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    initials: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    details: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
    },
    specialization: {
        fontSize: 13,
        color: '#007AFF',
        marginTop: 2,
    },
    hospital: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
    },
    doctorImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        marginRight: 15,
    },
});