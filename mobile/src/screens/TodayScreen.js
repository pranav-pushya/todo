import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Plus, CheckCircle2, Sparkles } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import SwipeableTaskRow from '../components/tasks/SwipeableTaskRow.js';
import AddTaskModal from '../components/tasks/AddTaskModal.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useTasks } from '../context/TaskContext.js';
import { useProjects } from '../context/ProjectContext.js';

export default function TodayScreen({ navigation }) {
  const haptics = useHaptics();
  const { filteredTasks, isLoading, fetchTasks, toggleTask, deleteTask, stats } = useTasks();
  const { projects } = useProjects();
  const [modalVisible, setModalVisible] = useState(false);

  const projectMap = React.useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  const handleOpenAdd = () => {
    haptics.triggerLight();
    setModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.cardHeading}>Today's Focus</Text>
            <Text style={styles.cardSubtitle}>
              {stats.completed} of {stats.total} tasks completed
            </Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>{stats.completionRate}%</Text>
          </View>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.min(stats.completionRate, 100)}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <CheckCircle2 size={48} color={colors.cobaltLight} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>You're all caught up!</Text>
      <Text style={styles.emptyDesc}>
        No pending tasks scheduled for today. Tap the (+) button below or ask your Copilot to generate your next sprint backlog.
      </Text>
      <TouchableOpacity
        style={styles.copilotPromptBtn}
        onPress={() => navigation.navigate('Copilot')}
      >
        <Sparkles size={14} color={colors.cobaltLight} />
        <Text style={styles.copilotPromptText}>Ask Copilot to plan your day</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer>
      <Header
        title="Today"
        subtitle="Daily agenda & critical tasks"
        rightAction="Profile"
        onRightActionPress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => {
          const proj = item.project_id ? projectMap[item.project_id] : null;
          return (
            <SwipeableTaskRow
              task={item}
              projectName={proj?.name}
              projectColor={proj?.color}
              onToggle={toggleTask}
              onDelete={deleteTask}
            />
          );
        }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchTasks}
            tintColor={colors.cobaltLight}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleOpenAdd}
        style={styles.fab}
      >
        <Plus size={24} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialView="today"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  listHeader: {
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: 'rgba(29, 78, 216, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cobaltLight,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.cobaltPrimary,
    borderRadius: 3,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 14,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  copilotPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderActive,
    gap: 6,
  },
  copilotPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.cobaltLight,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cobaltPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cobaltLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
