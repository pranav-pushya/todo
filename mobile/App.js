import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenContainer from './src/components/common/ScreenContainer';
import Header from './src/components/common/Header';
import PriorityBadge from './src/components/common/PriorityBadge';
import CustomButton from './src/components/common/CustomButton';
import colors from './src/theme/colors';
import useHaptics from './src/hooks/useHaptics';

function MainPreview() {
  const haptics = useHaptics();

  return (
    <ScreenContainer>
      <Header
        title="Kortex"
        subtitle="Autonomous AI Workspace"
        rightAction="Live API"
        onRightActionPress={() => haptics.triggerLight()}
      />
      <View style={styles.content}>
        <Text style={styles.heading}>Step 2 Design Tokens Verified</Text>
        <Text style={styles.desc}>
          Obsidian Dark theme tokens, priority indicators, and haptic feedback hooks are active.
        </Text>

        <View style={styles.badgeRow}>
          <PriorityBadge priority="P1" />
          <PriorityBadge priority="P2" />
          <PriorityBadge priority="P3" />
          <PriorityBadge priority="P4" />
        </View>

        <CustomButton
          title="Test Tactile Haptic Tap"
          variant="primary"
          onPress={() => haptics.triggerSuccess()}
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainPreview />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  btn: {
    width: '100%',
  },
});
