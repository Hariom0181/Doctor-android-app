import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert,  KeyboardAvoidingView, Platform
} from 'react-native';
import { nurseService } from '../services/nurseService';

export default function NurseLogMedicationScreen({ route, navigation }) {
  const { patient } = route.params;
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      const data = await nurseService.getPatientPrescriptions(patient.id);
      setPrescriptions(data);
    } catch (e) {
      console.error('Error loading prescriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectPrescription = (pres) => {
    setSelectedPrescription(pres);
    setMedicationName(pres.medication_name);
    setDosage(pres.dosage || '');
  };

  const handleSubmit = async () => {
    if (!medicationName.trim()) {
      Alert.alert('Required', 'Please enter or select a medication name');
      return;
    }
    setSubmitting(true);
    try {
      await nurseService.logMedication(
        selectedPrescription?.id || null,
        patient.id,
        medicationName.trim(),
        dosage.trim(),
        notes.trim()
      );
      Alert.alert('Success', 'Medication logged successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to log medication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
   
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Medication</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}  keyboardShouldPersistTaps="handled">
        {/* Patient Info */}
       <View style={styles.patientBanner}>
          <Text style={styles.patientBannerName}>👤 {patient.firstName} {patient.lastName}</Text>
          {patient.allergies ? (
            <Text style={styles.patientBannerAllergy}>⚠️ Allergies: {patient.allergies}</Text>
          ) : null}
        </View>

        {/* Active Prescriptions */}
        {!loading && prescriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select from Active Prescriptions</Text>
            {prescriptions.map((pres) => (
              <TouchableOpacity
                key={pres.id}
                style={[styles.presCard, selectedPrescription?.id === pres.id && styles.presCardSelected]}
                onPress={() => selectPrescription(pres)}
              >
                <Text style={styles.presName}>{pres.medication_name}</Text>
                <Text style={styles.presDetail}>{pres.dosage} • {pres.frequency}</Text>
                {pres.instructions ? <Text style={styles.presInstructions}>{pres.instructions}</Text> : null}
              </TouchableOpacity>
            ))}
            <Text style={styles.orText}>— or enter manually below —</Text>
          </View>
        )}

        {loading && <ActivityIndicator color="#007AFF" style={{ marginBottom: 20 }} />}

        {/* Manual Entry */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medication Details</Text>

          <Text style={styles.label}>Medication Name *</Text>
          <TextInput
            style={styles.input}
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="Enter medication name"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g. 500mg, 1 tablet"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any observations or special notes..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>💊 Log Medication</Text>
          }
        </TouchableOpacity>
      </ScrollView>
        </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, minWidth: 60 },
  backText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  content: { padding: 15, paddingBottom: 40 },
  patientBanner: { backgroundColor: '#dbeafe', borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  patientBannerName: { fontSize: 16, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  patientBannerAllergy: { fontSize: 13, color: '#b45309', fontWeight: '600' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  presCard: { borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 10 },
  presCardSelected: { borderColor: '#007AFF', backgroundColor: '#eff6ff' },
  presName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  presDetail: { fontSize: 13, color: '#6b7280', marginTop: 3 },
  presInstructions: { fontSize: 12, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' },
  orText: { textAlign: 'center', color: '#9ca3af', fontSize: 12, marginTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa' },
  textArea: { height: 100, paddingTop: 10 },
  submitBtn: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});