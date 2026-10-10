import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import colors from '../theme/colors.js';

export default function ProjectsScreen({ navigation }) {
  return (
    <ScreenContainer>
      <Header
        title="Projects"
        subtitle="Workspaces & categories"
        rightAction="Profile"
        onRightActionPress={() => navigation.navigate('Profile')}
      />
      <View style={styles.content}>
        <Text style={styles.title}>📁 Project Workspaces</Text>
        <Text style={styles.subtitle}>Organized team folders and sprints</Text>
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
