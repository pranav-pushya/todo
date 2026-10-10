import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import colors from '../theme/colors.js';

export default function AuthScreen() {
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>⚡ Kortex Auth</Text>
        <Text style={styles.subtitle}>Sign in or continue as Guest Developer</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
