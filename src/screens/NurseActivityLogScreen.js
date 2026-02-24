import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { nurseService } from '../services/nurseService';

export default function NurseActivityLogScreen({ navigation }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'medication' | 'note'

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await nurseService.getActivityLog();
      setActivities(data || []);
    } catch (e) {
      console.error('Error loading activity log:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const filteredActivities = activities.filter(a => {
    if (activeFilter === 'all') return true;
    return a.type === activeFilter;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    if (isYesterday) return `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'warning': return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
      default: return { bg: '#f0fdf4', border: '#10b981', text: '#059669' };
    }
  };

  const renderActivity = ({ item }) => {
    const isMed = item.type === 'medication';
    const severityStyle = getSeverityStyle(item.severity);

    return (
      <View style={[styles.activityCard, isMed ? styles.medCard : styles.noteCard]}>
        {/* Top row */}
        <View style={styles.activityTop}>
          <View style={[styles.typeIcon, { backgroundColor: isMed ? '#dbeafe' : '#f3e8ff' }]}>
            <Text style={styles.typeIconText}>{isMed ? '💊' : '📝'}</Text>
          </View>
          <View style={styles.activityMeta}>
            <Text style={styles.activityPatient}>{item.patient_name}</Text>
            <Text style={styles.activityTime}>{formatDate(item.created_at)}</Text>
          </View>
          {!isMed && item.severity && (
            <View style={[styles.severityTag, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
              <Text style={[styles.severityTagText, { color: severityStyle.text }]}>
                {item.severity.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.activityContent}>
          {isMed ? (
            <>
              <Text style={styles.activityTitle}>{item.medication_name}</Text>
              <Text style={styles.activityDetail}>Dosage: {item.dosage}</Text>
              {item.notes && <Text style={styles.activityNotes}>{item.notes}</Text>}
            </>
          ) : (
            <>
              <Text style={styles.activityTitle}>
                {item.observation_type?.replace('_', ' ').toUpperCase() || 'GENERAL'}
              </Text>
              <Text style={styles.activityDetail} numberOfLines={3}>{item.observation}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const medCount = activities.filter(a => a.type === 'medication').length;
  const noteCount = activities.filter(a => a.type === 'note').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Activity Log</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{activities.length}</Text>
          <Text style={styles.statLabel}>Total Activities</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBorder]}>
          <Text style={[styles.statNum, { color: '#007AFF' }]}>{medCount}</Text>
          <Text style={styles.statLabel}>💊 Medications</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNum, { color: '#8b5cf6' }]}>{noteCount}</Text>
          <Text style={styles.statLabel}>📝 Notes</Text>
        </View>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'medication', label: '💊 Medications' },
          { key: 'note', label: '📝 Notes' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item, idx) => `${item.type}-${item.id}-${idx}`}
          renderItem={renderActivity}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No activities found</Text>
              <Text style={styles.emptySubtext}>Your medication logs and notes will appear here</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#007AFF', paddingTop: 50, paddingBottom: 15,
    paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { paddingRight: 12 },
  backBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: 15, marginTop: 15, borderRadius: 12, elevation: 2, overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  statBoxBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#e5e7eb' },
  statNum: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 15, marginTop: 12, marginBottom: 4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 30 },
  activityCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 2,
  },
  medCard: { borderLeftWidth: 4, borderLeftColor: '#007AFF' },
  noteCard: { borderLeftWidth: 4, borderLeftColor: '#8b5cf6' },
  activityTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  typeIconText: { fontSize: 18 },
  activityMeta: { flex: 1 },
  activityPatient: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  activityTime: { fontSize: 11, color: '#999', marginTop: 2 },
  severityTag: {
    borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  severityTagText: { fontSize: 10, fontWeight: '800' },
  activityContent: {},
  activityTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 4 },
  activityDetail: { fontSize: 13, color: '#555', lineHeight: 18 },
  activityNotes: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#666' },
  emptySubtext: { fontSize: 13, color: '#999', marginTop: 4, textAlign: 'center' },
});