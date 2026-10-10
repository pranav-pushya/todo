import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import colors from '../theme/colors.js';

export default function ProfileScreen({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="Profile"
        subtitle="Developer identity & settings"
        rightAction="Done"
        onRightActionPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <Text style={styles.title}>👤 Developer Profile</Text>
        <Text style={styles.subtitle}>Manage account and server connection</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
