import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Server,
  LogOut,
  Check,
  Shield,
  Activity,
  Github,
  Zap,
} from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import CustomButton from '../components/common/CustomButton.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useAuth } from '../context/AuthContext.js';
import { useTasks } from '../context/TaskContext.js';
import { useProjects } from '../context/ProjectContext.js';
import {
  SERVER_PRESETS,
  getActiveHost,
  setActiveHost,
  HealthAPI,
} from '../services/api.js';

export default function ProfileScreen({ navigation }) {
  const haptics = useHaptics();
  const { user, logout, loginAsGuest } = useAuth();
  const { stats, fetchTasks } = useTasks();
  const { projects, fetchProjects } = useProjects();

  const [activeHostUrl, setActiveHostUrl] = useState(getActiveHost());
  const [customUrl, setCustomUrl] = useState('');
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverHealthStatus, setServerHealthStatus] = useState(null); // 'online' | 'offline'

  useEffect(() => {
    setActiveHostUrl(getActiveHost());
  }, []);

  const handleSelectPreset = async (presetUrl) => {
    haptics.triggerLight();
    await setActiveHost(presetUrl);
    setActiveHostUrl(presetUrl);
    setServerHealthStatus(null);
  };

  const handleTestConnection = async () => {
    setIsTestingServer(true);
    haptics.triggerMedium();

    try {
      await HealthAPI.checkHealth();
      setServerHealthStatus('online');
      haptics.triggerSuccess();
      Alert.alert('Server Connected!', `API responded with 200 OK at:\n${activeHostUrl}`);
      // Refresh tasks and projects from newly selected server
      fetchTasks();
      fetchProjects();
    } catch (err) {
      setServerHealthStatus('offline');
      haptics.triggerError();
      Alert.alert(
        'Connection Warning',
        `Could not reach API at:\n${activeHostUrl}\n\nError: ${err.message}`
      );
    } finally {
      setIsTestingServer(false);
    }
  };

  const handleApplyCustomUrl = async () => {
    if (!customUrl.trim()) return;
    let url = customUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }
    if (!url.endsWith('/api/v1')) {
      url = `${url}/api/v1`;
    }
    await setActiveHost(url);
    setActiveHostUrl(url);
    setCustomUrl('');
    haptics.triggerSuccess();
    handleTestConnection();
  };

  const handleLogout = async () => {
    haptics.triggerMedium();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          haptics.triggerLight();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Header
        title="Developer Profile"
        subtitle="Identity & Diagnostics"
        rightAction="Done"
        onRightActionPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color={colors.cobaltLight} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.full_name || user?.username || 'Developer'}</Text>
            <Text style={styles.userRole}>{user?.role || 'Staff Engineer'}</Text>
            <View style={styles.tagRow}>
              <View style={styles.githubBadge}>
                <Github size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                <Text style={styles.githubText}>{user?.username || 'pranav-pushya'}</Text>
              </View>
              {user?.is_guest && (
                <View style={styles.guestBadge}>
                  <Shield size={10} color={colors.warning} style={{ marginRight: 3 }} />
                  <Text style={styles.guestText}>Guest Session</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Productivity Analytics Stats */}
        <Text style={styles.sectionTitle}>Productivity Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{stats.completed}</Text>
            <Text style={styles.metricLabel}>Tasks Completed</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{stats.completionRate}%</Text>
            <Text style={styles.metricLabel}>Velocity Rate</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{projects.length}</Text>
            <Text style={styles.metricLabel}>Workspaces</Text>
          </View>
        </View>

        {/* Dynamic Server Host Switcher */}
        <Text style={styles.sectionTitle}>Backend API Host Configuration</Text>
        <View style={styles.serverCard}>
          <View style={styles.serverHeader}>
            <Server size={18} color={colors.cobaltLight} />
            <Text style={styles.serverTitle}>Active Gateway</Text>
            {serverHealthStatus && (
              <View
                style={[
                  styles.statusPill,
                  serverHealthStatus === 'online' ? styles.statusOnline : styles.statusOffline,
                ]}
              >
                <Activity size={10} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.statusPillText}>
                  {serverHealthStatus === 'online' ? 'Online' : 'Offline'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.activeUrlText} numberOfLines={1}>
            {activeHostUrl}
          </Text>

          {/* Preset Buttons */}
          <View style={styles.presetsList}>
            {SERVER_PRESETS.map((preset) => {
              const isSelected = activeHostUrl === preset.url;
              return (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => handleSelectPreset(preset.url)}
                  style={[styles.presetRow, isSelected && styles.presetRowSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}>
                      {preset.label}
                    </Text>
                    <Text style={styles.presetUrl} numberOfLines={1}>
                      {preset.url}
                    </Text>
                  </View>
                  {isSelected && <Check size={16} color={colors.cobaltLight} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom URL Input */}
          <View style={styles.customUrlRow}>
            <TextInput
              style={styles.customInput}
              placeholder="Or enter custom IP (e.g. 192.168.1.50:8001)"
              placeholderTextColor={colors.textMuted}
              value={customUrl}
              onChangeText={setCustomUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleApplyCustomUrl}
              disabled={!customUrl.trim()}
              style={[styles.applyBtn, !customUrl.trim() && { opacity: 0.5 }]}
            >
              <Text style={styles.applyBtnText}>Set</Text>
            </TouchableOpacity>
          </View>

          <CustomButton
            title={isTestingServer ? 'Testing Gateway...' : 'Ping & Health Check'}
            variant="secondary"
            loading={isTestingServer}
            onPress={handleTestConnection}
            style={styles.testBtn}
          />
        </View>

        {/* Session Management */}
        <View style={styles.authActions}>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={async () => {
              await loginAsGuest();
              haptics.triggerSuccess();
              Alert.alert('Guest Session', 'Active guest session restored.');
            }}
          >
            <Zap size={16} color={colors.cobaltLight} />
            <Text style={styles.guestBtnText}>Re-initialize Demo Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={16} color={colors.danger} />
            <Text style={styles.logoutText}>Sign Out of Kortex</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    color: colors.cobaltLight,
    marginTop: 2,
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  githubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  githubText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  guestText: {
    fontSize: 9,
    color: colors.warning,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  serverCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  serverTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusOnline: {
    backgroundColor: colors.success,
  },
  statusOffline: {
    backgroundColor: colors.danger,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  activeUrlText: {
    fontSize: 12,
    color: colors.cobaltLight,
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 6,
    marginBottom: 14,
    fontFamily: 'monospace',
  },
  presetsList: {
    gap: 8,
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  presetRowSelected: {
    borderColor: colors.cobaltLight,
    backgroundColor: 'rgba(29, 78, 216, 0.1)',
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  presetLabelSelected: {
    color: colors.cobaltLight,
  },
  presetUrl: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  customUrlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 12,
  },
  applyBtn: {
    backgroundColor: colors.cobaltPrimary,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  testBtn: {
    width: '100%',
  },
  authActions: {
    gap: 10,
    marginTop: 10,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceCard,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.cobaltLight,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
});
