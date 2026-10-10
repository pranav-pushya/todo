import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext.js';
import { ProjectProvider } from './src/context/ProjectContext.js';
import { TaskProvider, useTasks } from './src/context/TaskContext.js';
import { AgentProvider } from './src/context/AgentContext.js';
import ScreenContainer from './src/components/common/ScreenContainer.js';
import Header from './src/components/common/Header.js';
import PriorityBadge from './src/components/common/PriorityBadge.js';
import CustomButton from './src/components/common/CustomButton.js';
import colors from './src/theme/colors.js';
import useHaptics from './src/hooks/useHaptics.js';

function ContextVerificationView() {
  const haptics = useHaptics();
  const { tasks, toggleTask, stats } = useTasks();

  return (
    <ScreenContainer>
      <Header
        title="Kortex"
        subtitle="Global State Verified"
        rightAction={`${stats.completed}/${stats.total} Done`}
        onRightActionPress={() => haptics.triggerLight()}
      />
      <View style={styles.content}>
        <Text style={styles.heading}>Step 4: Global Contexts Active</Text>
        <Text style={styles.desc}>
          AuthContext, ProjectContext, TaskContext, and AgentContext are fully wired and functional.
        </Text>

        <View style={styles.statsCard}>
          <Text style={styles.statsText}>Total Tasks: {stats.total}</Text>
          <Text style={styles.statsText}>Completed: {stats.completed}</Text>
          <Text style={styles.statsText}>Velocity: {stats.completionRate}%</Text>
        </View>

        {tasks.slice(0, 2).map((t) => (
          <View key={t.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <PriorityBadge priority={t.priority} size="sm" />
              <Text style={styles.taskStatus}>
                {t.completed ? '✓ Done' : '⏳ In Progress'}
              </Text>
            </View>
            <Text style={styles.taskTitle}>{t.title}</Text>
            <CustomButton
              title={t.completed ? 'Mark Incomplete' : 'Complete with Haptic'}
              variant={t.completed ? 'secondary' : 'primary'}
              size="sm"
              onPress={() => {
                haptics.triggerSuccess();
                toggleTask(t.id);
              }}
              style={styles.taskBtn}
            />
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <AgentProvider>
              <ContextVerificationView />
            </AgentProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 16,
  },
  statsText: {
    color: colors.cobaltLight,
    fontWeight: '600',
    fontSize: 12,
  },
  taskCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskStatus: {
    fontSize: 11,
    color: colors.textMuted,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  taskBtn: {
    marginTop: 4,
  },
});
