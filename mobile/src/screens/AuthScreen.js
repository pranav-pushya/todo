import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Zap, ShieldCheck } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import CustomButton from '../components/common/CustomButton.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useAuth } from '../context/AuthContext.js';

export default function AuthScreen({ navigation }) {
  const haptics = useHaptics();
  const { login, register, loginAsGuest } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required credentials.');
      return;
    }

    setIsLoading(true);
    haptics.triggerMedium();

    let res;
    if (mode === 'login') {
      res = await login(username.trim(), password.trim());
    } else {
      res = await register(username.trim(), email.trim(), password.trim());
    }

    setIsLoading(false);

    if (res.success) {
      haptics.triggerSuccess();
      navigation.navigate('Main');
    } else {
      haptics.triggerError();
      setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleGuestAccess = async () => {
    haptics.triggerSuccess();
    await loginAsGuest();
    navigation.navigate('Main');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Branding */}
          <View style={styles.brandHeader}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBolt}>⚡</Text>
            </View>
            <Text style={styles.brandTitle}>Kortex</Text>
            <Text style={styles.brandSubtitle}>
              Autonomous AI Developer Platform & Workspace
            </Text>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              onPress={() => {
                haptics.triggerLight();
                setMode('login');
                setErrorMessage('');
              }}
              style={[styles.tab, mode === 'login' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                haptics.triggerLight();
                setMode('register');
                setErrorMessage('');
              }}
              style={[styles.tab, mode === 'register' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. pushyapranav"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {mode === 'register' && (
              <>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="developer@kortex.dev"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomButton
              title={mode === 'login' ? 'Sign In to Workspace' : 'Create Developer Account'}
              variant="primary"
              loading={isLoading}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>

          {/* 1-Tap Guest Access */}
          <View style={styles.guestSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE INSTANTLY</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleGuestAccess}
              style={styles.guestButton}
            >
              <Zap size={18} color={colors.cobaltLight} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.guestTitle}>Continue as Guest Developer</Text>
                <Text style={styles.guestSubtitle}>
                  Zero-signup mode with sample sprints & full AI access
                </Text>
              </View>
              <ShieldCheck size={18} color={colors.success} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    borderWidth: 1,
    borderColor: colors.borderActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoBolt: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tabText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.cobaltLight,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: colors.surfaceCard,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 20,
  },
  guestSection: {
    marginTop: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  dividerText: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderActive,
  },
  guestTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  guestSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
