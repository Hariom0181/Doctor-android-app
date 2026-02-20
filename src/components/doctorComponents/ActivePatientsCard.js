import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';

export default function ActivePatientsCard({ onViewAll }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [patientImages, setPatientImages] = useState({});
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);
    useEffect(() => {
        if (patients.length > 0) {
          loadPatientImages();
        }
      }, [patients]);
      
      const loadPatientImages = async () => {
        try {
          setLoadingImages(true);
          const images = {};
          
          for (const patient of patients) {
            try {
              const imageUrl = await patientService.getProfileImage(patient.id);
              if (imageUrl) {
                images[patient.id] = imageUrl;
              }
            } catch (error) {
              console.error(`Error loading image for patient ${patient.id}:`, error);
            }
          }
          
          setPatientImages(images);
        } catch (error) {
          console.error('Error loading patient images:', error);
        } finally {
          setLoadingImages(false);
        }
      };

    const handleSelectPatient = (patientId) => {
        console.log('Selected patient ID:', patientId);
        onViewAll(patientId);  // Pass ID, not object
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPatients();
        loadPatientImages();
      };
    // In renderItem:
    <TouchableOpacity onPress={() => handleSelectPatient(item.id)}>
        <View style={styles.patientItem}>
            ...
        </View>
    </TouchableOpacity>

    const fetchPatients = async () => {
        try {
            const result = await doctorService.getLinkedPatients();

            if (result.success && result.data) {
                setPatients(result.data.slice(0, 3));
            } else {
                setPatients([]);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
            setPatients([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.card}>
                <ActivityIndicator size="small" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>Active Patients</Text>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                >
                    <Text style={styles.refreshIcon}>🔄</Text>
                </TouchableOpacity>
            </View>

            {patients.length === 0 ? (
                <Text style={styles.emptyText}>No patients linked</Text>
            ) : (
                <>
                    <FlatList
                        data={patients}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}

                        renderItem={({ item }) => (
                            <View style={styles.patientItem}>
                              <TouchableOpacity
                                onPress={() => handleSelectPatient(item.id)}
                                style={styles.patientTouchable}
                              >
                                {patientImages[item.id] ? (
                                  <Image
                                    source={{ uri: patientImages[item.id] }}
                                    style={styles.patientImage}
                                  />
                                ) : (
                                  <View style={styles.patientImagePlaceholder}>
                                    <Text style={styles.patientInitials}>
                                      {item.firstName.charAt(0)}{item.lastName?.charAt(0) || ''}
                                    </Text>
                                  </View>
                                )}
                                <Text style={styles.patientName} numberOfLines={1}>
                                  {item.firstName}
                                </Text>
                                {/* <Text style={styles.patientAge}>{item.age} yrs</Text> */} 
                              </TouchableOpacity>
                            </View>
                          )}

                    />

                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => console.log('View all clicked')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.viewAllButtonIcon}>👥</Text>
                        <Text style={styles.viewAllButtonText}>View All</Text>
                        <Text style={styles.viewAllButtonArrow}>→</Text>
                    </TouchableOpacity>
                </>
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
    patientItem: {
        alignItems: 'center',
        marginRight: 15,
    },
    patientImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    patientName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        width: 60,
        textAlign: 'center',
    },
    patientAge: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },

    viewAllText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 13,
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
    patientTouchable: {
        alignItems: 'center',
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginTop: 12,
        elevation: 2,
    },
    viewAllButtonIcon: {
        fontSize: 20,
    },
    viewAllButtonText: {
        color: '#007AFF',
        fontWeight: '700',
        fontSize: 15,
        flex: 1,
        marginLeft: 10,
    },
    viewAllButtonArrow: {
        color: '#007AFF',
        fontSize: 18,
        fontWeight: '700',
    },
    patientImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
      },
      patientInitials: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
      },
});