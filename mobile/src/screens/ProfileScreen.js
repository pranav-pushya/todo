import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
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
  LogIn,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
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
  const [serverHealthStatus, setServerHealthStatus] = useState(null);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isGuest = !user || user.is_guest;

  useEffect(() => {
    setActiveHostUrl(getActiveHost());
  }, []);

  const handleSelectPreset = async (presetUrl) => {
    haptics.triggerLight();
    await setActiveHost(presetUrl);
    setActiveHostUrl(presetUrl);
    setServerHealthStatus(null);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    haptics.triggerMedium();
    try {
      await Promise.all([fetchTasks(), fetchProjects()]);
      haptics.triggerSuccess();
      Alert.alert('Synced!', 'Tasks and workspaces refreshed from Kortex Cloud.');
    } catch {
      haptics.triggerError();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingServer(true);
    haptics.triggerMedium();

    try {
      await HealthAPI.checkHealth();
      setServerHealthStatus('online');
      haptics.triggerSuccess();
      Alert.alert('Server Connected!', `API responded with 200 OK at:\n${activeHostUrl}`);
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
          navigation.navigate('Auth');
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Header
        title="Settings & Profile"
        subtitle="Account & Cloud Sync"
        rightAction="Done"
        onRightActionPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Account Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={30} color={colors.cobaltLight} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {user?.full_name || user?.username || (isGuest ? 'Guest Developer' : 'Developer')}
            </Text>
            <Text style={styles.userRole}>
              {user?.email || (isGuest ? 'Local Device Storage' : user?.role || 'Staff Engineer')}
            </Text>
            <View style={styles.tagRow}>
              {isGuest ? (
                <View style={styles.guestBadge}>
                  <Shield size={11} color={colors.warning} style={{ marginRight: 4 }} />
                  <Text style={styles.guestText}>Guest Session</Text>
                </View>
              ) : (
                <View style={styles.verifiedBadge}>
                  <Check size={11} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={styles.verifiedText}>Kortex Cloud Member</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Authentication Controls: Sign In vs Sign Out */}
        <View style={styles.authSection}>
          {isGuest ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                haptics.triggerLight();
                navigation.navigate('Auth');
              }}
              style={styles.signInButton}
            >
              <LogIn size={18} color="#ffffff" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.signInTitle}>Sign In / Create Account</Text>
                <Text style={styles.signInSubtitle}>
                  Sync your tasks, notes, and AI copilot across web & mobile
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={styles.logoutBtn}
            >
              <LogOut size={16} color={colors.danger} />
              <Text style={styles.logoutText}>Sign Out of Kortex</Text>
            </TouchableOpacity>
          )}
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

        {/* Cloud Synchronization Card */}
        <Text style={styles.sectionTitle}>Cloud Synchronization</Text>
        <View style={styles.cloudCard}>
          <View style={styles.cloudRow}>
            <View style={styles.cloudIconWrap}>
              <Server size={18} color={colors.cobaltLight} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cloudTitle}>Production Gateway</Text>
              <Text style={styles.cloudSubtitle}>Connected to Kortex Cloud API</Text>
            </View>
            <View style={styles.cloudStatusDot} />
          </View>

          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <RefreshCw size={14} color={colors.cobaltLight} />
            <Text style={styles.syncButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync Tasks & Workspaces Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info & Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingValue}>Obsidian Dark (Default)</Text>
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Tactile Haptics</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          <View style={styles.settingDivider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>Kortex Mobile v1.0.0 (Release)</Text>
          </View>
        </View>

        {/* Collapsed Advanced Developer Options Accordion */}
        <View style={styles.devAccordion}>
          <TouchableOpacity
            onPress={() => {
              haptics.triggerLight();
              setShowDevOptions(!showDevOptions);
            }}
            style={styles.accordionHeader}
          >
            <Sliders size={16} color={colors.textMuted} />
            <Text style={styles.accordionTitle}>Advanced Developer Settings</Text>
            {showDevOptions ? (
              <ChevronUp size={16} color={colors.textMuted} />
            ) : (
              <ChevronDown size={16} color={colors.textMuted} />
            )}
          </TouchableOpacity>

          {showDevOptions && (
            <View style={styles.devContent}>
              <Text style={styles.devWarning}>
                Configure custom backend API gateways for local testing or custom deployments.
              </Text>

              <Text style={styles.activeUrlText} numberOfLines={1}>
                {activeHostUrl}
              </Text>

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

              <View style={styles.customUrlRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder="Custom API URL..."
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
                style={{ width: '100%', marginTop: 6 }}
              />
            </View>
          )}
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
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  guestText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '700',
  },
  authSection: {
    marginBottom: 20,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cobaltPrimary,
    padding: 14,
    borderRadius: 12,
  },
  signInTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  signInSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 8,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  sectionTitle: {
    fontSize: 11,
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
  cloudCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
  },
  cloudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cloudIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cloudSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cloudStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderActive,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cobaltLight,
  },
  settingsCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  settingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 10,
  },
  devAccordion: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  accordionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  devContent: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  devWarning: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 10,
    lineHeight: 16,
  },
  activeUrlText: {
    fontSize: 11,
    color: colors.cobaltLight,
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  presetsList: {
    gap: 8,
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  presetRowSelected: {
    borderColor: colors.cobaltLight,
    backgroundColor: 'rgba(29, 78, 216, 0.1)',
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  presetLabelSelected: {
    color: colors.cobaltLight,
  },
  presetUrl: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  customUrlRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
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
});
