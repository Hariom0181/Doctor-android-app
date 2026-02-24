import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native';
// Professional Icons
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function patient_ProfileCard({ patient, profileImage }) {
    return (
        <View style={styles.profileCard}>
            <View style={styles.profileContainer}>
                {/* Left Side - Image with subtle border */}
                <View style={styles.imageSection}>
                    {profileImage ? (
                        <View style={styles.imageFrame}>
                            <Image
                                source={{ uri: profileImage }}
                                style={styles.profileImage}
                            />
                        </View>
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>
                                {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Right Side - Details */}
                <View style={styles.detailsSection}>
                    <Text style={styles.name}>
                        {patient?.firstName} {patient?.lastName}
                    </Text>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.infoRow}>
                        <Feather name="mail" size={12} color="#64748B" />
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue} numberOfLines={1}>
                                {patient?.email}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Feather name="phone" size={12} color="#64748B" />
                        <View style={styles.textContainer}>
                            <Text style={styles.infoLabel}>Contact Number</Text>
                            <Text style={styles.infoValue}>
                                {patient?.phone}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    profileContainer: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    imageSection: {
        marginRight: 20,
    },
    imageFrame: {
        padding: 4,
        borderRadius: 55,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    profileImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    placeholderImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    placeholderText: {
        fontSize: 34,
        fontWeight: '800',
        color: '#fff',
        letterSpacing: 1,
    },
    detailsSection: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        letterSpacing: -0.5,
    },
    divider: {
        height: 2,
        width: 30,
        backgroundColor: '#007AFF',
        marginVertical: 12,
        borderRadius: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 10,
    },
    textContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 9,
        color: '#94A3B8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '600',
        marginTop: 1,
    },
});