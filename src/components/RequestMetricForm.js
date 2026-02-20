import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { doctorService } from '../services/doctorService';

export default function RequestMetricForm({ patient, onSuccess }) {
  const [metricType, setMetricType] = useState('temperature');
  const [loading, setLoading] = useState(false);

  const deviceMap = {
    temperature: 'ESP32_TEMP_001',
    heart_rate: 'ESP32_PULSE_001',
  };

  const handleRequestMetric = async () => {
    setLoading(true);
    try {
      const result = await doctorService.requestMetric(
        patient.id,
        metricType,
        deviceMap[metricType]
      );

      if (result.success) {
        Alert.alert('Success', 'Metric request sent to device');
        onSuccess(result.data.request_id);
      } else {
        Alert.alert('Error', result.error || 'Failed to request metric');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Metric Type:</Text>

      <Picker
        selectedValue={metricType}
        onValueChange={setMetricType}
        style={styles.picker}
        enabled={!loading}
      >
        <Picker.Item label="🌡️ Temperature" value="temperature" />
        <Picker.Item label="❤️ Heart Rate" value="heart_rate" />
      </Picker>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRequestMetric}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>📤 Request Metric</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});