import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Plus, Inbox as InboxIcon } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import SwipeableTaskRow from '../components/tasks/SwipeableTaskRow.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useTasks } from '../context/TaskContext.js';
import { useProjects } from '../context/ProjectContext.js';

export default function InboxScreen({ navigation }) {
  const haptics = useHaptics();
  const { tasks, isLoading, fetchTasks, createTask, toggleTask, deleteTask } = useTasks();
  const { projects } = useProjects();
  const [quickInput, setQuickInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inboxTasks = React.useMemo(() => {
    return tasks.filter((t) => !t.project_id);
  }, [tasks]);

  const projectMap = React.useMemo(() => {
    const map = {};
    projects.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [projects]);

  const handleQuickAdd = async () => {
    if (!quickInput.trim()) return;

    setIsSubmitting(true);
    haptics.triggerMedium();

    try {
      await createTask({
        title: quickInput.trim(),
        priority: 'P3',
        due_date: null,
        project_id: null,
        tags: ['inbox', 'quick-capture'],
      });
      haptics.triggerSuccess();
      setQuickInput('');
    } catch {
      haptics.triggerError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerArea}>
      <View style={styles.quickAddCard}>
        <TextInput
          style={styles.quickInput}
          placeholder="Capture thought or task to inbox..."
          placeholderTextColor={colors.textMuted}
          value={quickInput}
          onChangeText={setQuickInput}
          onSubmitEditing={handleQuickAdd}
          returnKeyType="done"
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleQuickAdd}
          disabled={!quickInput.trim() || isSubmitting}
          style={[
            styles.quickAddBtn,
            (!quickInput.trim() || isSubmitting) && styles.quickAddBtnDisabled,
          ]}
        >
          <Plus size={18} color="#ffffff" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsBanner}>
        <Text style={styles.statsText}>
          {inboxTasks.filter((t) => !t.completed).length} unassigned items to triage
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <InboxIcon size={44} color={colors.textMuted} style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>Inbox Zero</Text>
      <Text style={styles.emptyDesc}>
        All quick thoughts and backlog tasks have been organized. Use the capture bar above to add an idea on the fly.
      </Text>
    </View>
  );

  return (
    <ScreenContainer>
      <Header
        title="Inbox"
        subtitle="Quick capture & backlog triage"
        rightAction="Profile"
        onRightActionPress={() => navigation.navigate('Profile')}
      />

      <FlatList
        data={inboxTasks}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerArea: {
    marginBottom: 16,
  },
  quickAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  quickInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  quickAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cobaltPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  quickAddBtnDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.6,
  },
  statsBanner: {
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
