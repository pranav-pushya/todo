import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import colors from '../../theme/colors.js';
import storage from '../../services/storage.js';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Kortex ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleResetStorage = async () => {
    try {
      await storage.clear();
      this.setState({ hasError: false, error: null, errorInfo: null });
    } catch {
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.icon}>⚠️</Text>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.subtitle}>
                An unhandled error was intercepted by Kortex Error Boundary.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.errorTitle}>Error Message</Text>
              <Text style={styles.errorText}>
                {this.state.error?.message || String(this.state.error)}
              </Text>

              {this.state.errorInfo?.componentStack ? (
                <>
                  <Text style={[styles.errorTitle, { marginTop: 12 }]}>Component Stack</Text>
                  <ScrollView style={styles.stackBox} nestedScrollEnabled>
                    <Text style={styles.stackText}>
                      {this.state.errorInfo.componentStack.trim()}
                    </Text>
                  </ScrollView>
                </>
              ) : null}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={this.handleReset}>
                <Text style={styles.primaryButtonText}>Reload Interface</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={this.handleResetStorage}>
                <Text style={styles.secondaryButtonText}>Reset Storage & Cache</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    maxHeight: '60%',
  },
  errorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  stackBox: {
    maxHeight: 140,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  stackText: {
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonRow: {
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: colors.cobaltPrimary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: colors.surfaceCard,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
