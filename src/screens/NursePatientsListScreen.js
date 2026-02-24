import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { nurseService } from '../services/nurseService';

export default function NursePatientsListScreen({ navigation }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'allergy' | 'no-allergy'

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await nurseService.getAssignedPatients();
      setPatients(data || []);
    } catch (e) {
      console.error('Error loading patients:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  // Filter + search
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.bloodGroup?.toLowerCase().includes(q)
      );
    }

    if (filterStatus === 'allergy') {
      result = result.filter(p => p.allergies);
    } else if (filterStatus === 'no-allergy') {
      result = result.filter(p => !p.allergies);
    }

    return result;
  }, [patients, searchQuery, filterStatus]);

  const renderPatientItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => navigation.navigate('NursePatientDetail', { patient: item })}
      activeOpacity={0.7}
    >
      {/* Avatar + name */}
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.firstName?.[0]}{item.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.nameSection}>
          <Text style={styles.patientName}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.patientEmail} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodText}>{item.bloodGroup || '?'}</Text>
        </View>
      </View>

      {/* Details row */}
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Phone</Text>
          <Text style={styles.detailValue}>{item.phone || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Gender</Text>
          <Text style={styles.detailValue}>{item.gender || 'N/A'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>City</Text>
          <Text style={styles.detailValue}>{item.city || 'N/A'}</Text>
        </View>
      </View>

      {/* Allergy tag */}
      {item.allergies && (
        <View style={styles.allergyTag}>
          <Text style={styles.allergyTagText}>⚠️ {item.allergies}</Text>
        </View>
      )}

      <Text style={styles.viewDetail}>Tap to view details →</Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, email, phone..."
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: `All (${patients.length})` },
          { key: 'allergy', label: '⚠️ Has Allergies' },
          { key: 'no-allergy', label: '✅ No Allergies' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterStatus === f.key && styles.filterChipActive]}
            onPress={() => setFilterStatus(f.key)}
          >
            <Text style={[styles.filterChipText, filterStatus === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Result count */}
      <Text style={styles.resultCount}>
        Showing {filteredPatients.length} of {patients.length} patients
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{searchQuery ? '🔍' : '👥'}</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? `No results for "${searchQuery}"` : 'No patients assigned'}
      </Text>
      {searchQuery && (
        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
          <Text style={styles.clearSearchBtnText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 My Patients</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{patients.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading patients...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={item => item.id.toString()}
          renderItem={renderPatientItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007AFF']} />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
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
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', width: 32, height: 32,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  headerBadgeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666', fontSize: 14 },
  listContent: { padding: 15, paddingBottom: 30 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    marginBottom: 12, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1a1a1a' },
  clearBtn: { fontSize: 16, color: '#999', paddingLeft: 8 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterChipText: { fontSize: 12, color: '#555', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  resultCount: { fontSize: 12, color: '#999', marginBottom: 12 },
  patientCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15,
    marginBottom: 12, elevation: 3, borderLeftWidth: 4, borderLeftColor: '#10b981',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#dbeafe', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#1d4ed8' },
  nameSection: { flex: 1 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  patientEmail: { fontSize: 12, color: '#666', marginTop: 2 },
  bloodBadge: {
    backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  bloodText: { fontSize: 12, fontWeight: '800', color: '#dc2626' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailItem: {},
  detailLabel: { fontSize: 11, color: '#999', fontWeight: '600' },
  detailValue: { fontSize: 13, color: '#1a1a1a', fontWeight: '700', marginTop: 2 },
  allergyTag: {
    backgroundColor: '#fef3c7', padding: 6, borderRadius: 6,
    borderLeftWidth: 3, borderLeftColor: '#f59e0b', marginBottom: 8,
  },
  allergyTagText: { fontSize: 12, color: '#92400e', fontWeight: '600' },
  viewDetail: { fontSize: 12, color: '#007AFF', textAlign: 'right', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#666' },
  clearSearchBtn: {
    marginTop: 12, backgroundColor: '#007AFF',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20,
  },
  clearSearchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});