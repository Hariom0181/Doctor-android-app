import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { nurseService } from '../services/nurseService';

export default function NursePatientDetailScreen({ route, navigation }) {
  const { patient } = route.params;
  const [notes, setNotes] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [notesData, logsData] = await Promise.all([
        nurseService.getPatientNotes(patient.id),
        nurseService.getMedicationLogs(patient.id),
      ]);
      setNotes(notesData);
      setMedLogs(logsData);
    } catch (e) {
      console.error('Error loading patient details:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'warning': return '#d97706';
      default: return '#16a34a';
    }
  };

  const renderInfo = () => (
  <View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Personal Information</Text>
      <InfoRow label="Name" value={`${patient.firstName} ${patient.lastName}`} />
      <InfoRow label="Email" value={patient.email} />
      <InfoRow label="Phone" value={patient.phone || 'N/A'} />
      <InfoRow label="Gender" value={patient.gender || 'N/A'} />
      <InfoRow label="Blood Group" value={patient.bloodGroup || 'N/A'} />
      <InfoRow label="DOB" value={patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'} />
      <InfoRow label="City" value={patient.city || 'N/A'} />
    </View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Medical Information</Text>
      {patient.allergies ? (
        <View style={styles.allergyBox}>
          <Text style={styles.allergyLabel}>Allergies</Text>
          <Text style={styles.allergyText}>{patient.allergies}</Text>
        </View>
      ) : null}
      <InfoRow label="Medical History" value={patient.medicalHistory || 'No history recorded'} />
    </View>
  </View>
);

  const renderNotes = () => (
    <View>
      {notes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No notes yet</Text>
        </View>
      ) : (
        notes.map((note) => (
          <View key={note.id} style={[styles.card, { borderLeftColor: getSeverityColor(note.severity) }]}>
            <View style={styles.rowBetween}>
              <Text style={styles.noteType}>{(note.observation_type || 'general').toUpperCase()}</Text>
              <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(note.severity) + '22' }]}>
                <Text style={[styles.severityText, { color: getSeverityColor(note.severity) }]}>{note.severity || 'normal'}</Text>
              </View>
            </View>
            <Text style={styles.noteObservation}>{note.observation}</Text>
            <Text style={styles.timeText}>{formatDate(note.created_at)}</Text>
          </View>
        ))
      )}
    </View>
  );

  const renderMedLogs = () => (
    <View>
      {medLogs.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text style={styles.emptyText}>No medication logs yet</Text>
        </View>
      ) : (
        medLogs.map((log) => (
          <View key={log.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.medName}>{log.medication_name}</Text>
              {log.dosage ? <Text style={styles.dosageBadge}>{log.dosage}</Text> : null}
            </View>
            {log.notes ? <Text style={styles.noteObservation}>{log.notes}</Text> : null}
            <Text style={styles.timeText}>{formatDate(log.administered_at)}</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{patient.firstName} {patient.lastName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.medBtn]}
          onPress={() => navigation.navigate('NurseLogMedication', { patient })}>
          <Text style={styles.actionBtnText}>💊 Log Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.noteBtn]}
          onPress={() => navigation.navigate('NurseAddNote', { patient, onGoBack: loadAll })}>
          <Text style={styles.actionBtnText}>📝 Add Note</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {[['info','Info'], ['notes',`Notes (${notes.length})`], ['medications',`Meds (${medLogs.length})`]].map(([key, label]) => (
          <TouchableOpacity key={key} style={[styles.tab, activeTab === key && styles.tabActive]} onPress={() => setActiveTab(key)}>
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}><ActivityIndicator size="large" color="#007AFF" /></View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {activeTab === 'info' && renderInfo()}
          {activeTab === 'notes' && renderNotes()}
          {activeTab === 'medications' && renderMedLogs()}
        </ScrollView>
      )}
    </View>
  );
}

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#007AFF', paddingTop: 50, paddingBottom: 15, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { padding: 5, minWidth: 60 },
  backText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  actionRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#fff', elevation: 2 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  medBtn: { backgroundColor: '#dbeafe' },
  noteBtn: { backgroundColor: '#f3e5f5' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: '#007AFF' },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#007AFF' },
  tabText: { fontSize: 12, color: '#666', fontWeight: '600' },
  tabTextActive: { color: '#007AFF' },
  scroll: { flex: 1 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 13, color: '#666', fontWeight: '600', flex: 1 },
  infoValue: { fontSize: 13, color: '#1a1a1a', flex: 1.5, textAlign: 'right' },
  allergyBox: { backgroundColor: '#fff3cd', borderRadius: 8, padding: 10, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  allergyLabel: { fontSize: 12, fontWeight: '700', color: '#92400e' },
  allergyText: { fontSize: 13, color: '#78350f', marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteType: { fontSize: 11, fontWeight: '700', color: '#007AFF', letterSpacing: 0.5 },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  severityText: { fontSize: 11, fontWeight: '700' },
  noteObservation: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 8 },
  timeText: { fontSize: 11, color: '#9ca3af' },
  medName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  dosageBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontSize: 12, color: '#1d4ed8', fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: '#9ca3af', fontWeight: '600' },
});