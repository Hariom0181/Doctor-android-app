import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
// Using standard Expo icons (standard in most RN projects)
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function LoginForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');

  const handleSubmit = () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please fill all fields');
      return;
    }
    onSubmit(email, password, role);
  };

  // Helper to render role-specific icons professionally
  const getRoleIcon = (roleName, isActive) => {
    const color = isActive ? '#007AFF' : '#94A3B8';
    const size = 16;
    switch (roleName) {
      case 'patient': return <FontAwesome5 name="user" size={size} color={color} />;
      case 'doctor': return <FontAwesome5 name="user-md" size={size} color={color} />;
      case 'nurse': return <FontAwesome5 name="user-nurse" size={size} color={color} />;
      default: return null;
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.flexSpacer} />

            <View style={styles.innerContent}>
              <View style={styles.headerSection}>
                <View style={styles.logoBadge}>
                  <MaterialCommunityIcons name="heart-pulse" size={38} color="#fff" />
                </View>
                <Text style={styles.title}>HealthTrack</Text>
                <Text style={styles.subtitle}>Secure Medical Portal</Text>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="email-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                </View>

                <Text style={styles.label}>Identity Role</Text>
                <View style={styles.segmentedControl}>
                  {['patient', 'doctor', 'nurse'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.segmentButton, role === r && styles.segmentButtonActive]}
                      onPress={() => setRole(r)}
                      disabled={loading}
                    >
                      <View style={styles.segmentContent}>
                        {getRoleIcon(r, role === r)}
                        <Text style={[styles.segmentText, role === r && styles.segmentTextActive]}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
                
                <Text style={styles.footerNote}>
                  Encrypted end-to-end security active
                </Text>
              </View>
            </View>
            
            <View style={styles.flexSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  flexSpacer: {
    flex: 1,
  },
  innerContent: {
    paddingVertical: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 45,
  },
  logoBadge: {
    width: 72,
    height: 72,
    backgroundColor: '#007AFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 58,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 6,
    marginBottom: 35,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  segmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#007AFF',
    fontWeight: '800',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerNote: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 20,
    fontWeight: '500',
  }
});