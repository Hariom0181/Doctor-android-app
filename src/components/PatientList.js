import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { doctorService } from '../services/doctorService';

export default function PatientList({ onSelectPatient }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await doctorService.getLinkedPatients();
      
      if (result.success) {
        setPatients(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load patients');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (patients.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No linked patients</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={patients}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.patientCard}
          onPress={() => onSelectPatient(item)}
        >
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientAge}>Age: {item.age}</Text>
        </TouchableOpacity>
      )}
      onRefresh={fetchPatients}
      refreshing={loading}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  patientAge: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});