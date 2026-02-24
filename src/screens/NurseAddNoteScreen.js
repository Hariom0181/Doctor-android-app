import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { nurseService } from '../services/nurseService';

const OBSERVATION_TYPES = [
  { key: 'general', label: '📋 General', color: '#6b7280' },
  { key: 'vital_signs', label: '❤️ Vital Signs', color: '#dc2626' },
  { key: 'behavior', label: '🧠 Behavior', color: '#7c3aed' },
  { key: 'pain', label: '😣 Pain', color: '#ea580c' },
  { key: 'diet', label: '🍽️ Diet', color: '#16a34a' },
  { key: 'sleep', label: '😴 Sleep', color: '#0891b2' },
];

const SEVERITY_LEVELS = [
  { key: 'normal', label: 'Normal', color: '#16a34a', bg: '#dcfce7' },
  { key: 'warning', label: 'Warning', color: '#d97706', bg: '#fef3c7' },
  { key: 'critical', label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
];

export default function NurseAddNoteScreen({ route, navigation }) {
  const { patient, onGoBack } = route.params;
  const [observation, setObservation] = useState('');
  const [observationType, setObservationType] = useState('general');
  const [severity, setSeverity] = useState('normal');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!observation.trim()) {
      Alert.alert('Required', 'Please enter an observation');
      return;
    }
    setSubmitting(true);
    try {
      await nurseService.addNote(patient.id, observation.trim(), observationType, severity);
      Alert.alert('Success', 'Note added successfully!', [
        {
          text: 'OK', onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          }
        }
      ]);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to add note');
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
        <Text style={styles.headerTitle}>Add Observation</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}  keyboardShouldPersistTaps="handled">
        {/* Patient Banner */}
        <View style={styles.patientBanner}>
          <Text style={styles.patientName}>👤 {patient.firstName} {patient.lastName}</Text>
        </View>

        {/* Observation Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observation Type</Text>
          <View style={styles.chipRow}>
            {OBSERVATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[styles.chip, observationType === type.key && { backgroundColor: type.color, borderColor: type.color }]}
                onPress={() => setObservationType(type.key)}
              >
                <Text style={[styles.chipText, observationType === type.key && styles.chipTextActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Level</Text>
          <View style={styles.severityRow}>
            {SEVERITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[styles.severityBtn, { backgroundColor: severity === level.key ? level.bg : '#f9fafb', borderColor: severity === level.key ? level.color : '#e5e7eb' }]}
                onPress={() => setSeverity(level.key)}
              >
                <Text style={[styles.severityText, { color: severity === level.key ? level.color : '#6b7280' }]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Observation Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observation *</Text>
          <TextInput
            style={styles.textArea}
            value={observation}
            onChangeText={setObservation}
            placeholder="Describe your observation in detail..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{observation.length} characters</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>📝 Save Observation</Text>
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
  patientBanner: { backgroundColor: '#dbeafe', borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  patientName: { fontSize: 16, fontWeight: '700', color: '#1e40af' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#d1d5db', backgroundColor: '#f9fafb' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },
  severityRow: { flexDirection: 'row', gap: 10 },
  severityBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, borderWidth: 1.5 },
  severityText: { fontSize: 13, fontWeight: '700' },
  textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa', minHeight: 140 },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 6 },
  submitBtn: { backgroundColor: '#007AFF', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});