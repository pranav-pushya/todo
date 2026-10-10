import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Trash2, Tag, Calendar } from 'lucide-react-native';
import PriorityBadge from '../common/PriorityBadge.js';
import colors from '../../theme/colors.js';
import useHaptics from '../../hooks/useHaptics.js';

export default function SwipeableTaskRow({ task, onToggle, onDelete, projectName, projectColor }) {
  const haptics = useHaptics();

  const handleToggle = () => {
    haptics.triggerSuccess();
    if (onToggle) onToggle(task.id);
  };

  const handleDelete = () => {
    haptics.triggerLight();
    if (onDelete) onDelete(task.id);
  };

  const formattedDate = task.due_date ? task.due_date.slice(0, 10) : null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleToggle}
        style={[
          styles.checkbox,
          task.completed && styles.checkboxCompleted,
        ]}
      >
        {task.completed && <Check size={14} color="#ffffff" strokeWidth={3} />}
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>

        {task.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority || 'P3'} size="sm" />

          {projectName ? (
            <View style={[styles.projectChip, { borderColor: projectColor || colors.cobaltLight }]}>
              <View style={[styles.projectDot, { backgroundColor: projectColor || colors.cobaltLight }]} />
              <Text style={styles.projectText}>{projectName}</Text>
            </View>
          ) : null}

          {formattedDate ? (
            <View style={styles.dateChip}>
              <Calendar size={11} color={colors.textMuted} style={styles.metaIcon} />
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
          ) : null}

          {Array.isArray(task.tags) &&
            task.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Tag size={10} color={colors.textMuted} style={styles.metaIcon} />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={handleDelete}
        activeOpacity={0.6}
        style={styles.deleteButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.cobaltPrimary,
    borderColor: colors.cobaltLight,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  projectDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  projectText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  metaIcon: {
    marginRight: 3,
  },
  dateText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  tagText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 2,
  },
});
