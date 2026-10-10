import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import PriorityBadge from '../common/PriorityBadge.js';
import CustomButton from '../common/CustomButton.js';
import colors from '../../theme/colors.js';
import useHaptics from '../../hooks/useHaptics.js';
import { useTasks } from '../../context/TaskContext.js';
import { useProjects } from '../../context/ProjectContext.js';

export default function AddTaskModal({ visible, onClose, initialView = 'today' }) {
  const haptics = useHaptics();
  const { createTask } = useTasks();
  const { projects } = useProjects();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('P2');
  const [projectId, setProjectId] = useState(null);
  const [dueDateType, setDueDateType] = useState(initialView === 'today' ? 'today' : 'none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = ['P1', 'P2', 'P3', 'P4'];

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    haptics.triggerMedium();

    let computedDueDate = null;
    const now = new Date();
    if (dueDateType === 'today') {
      computedDueDate = now.toISOString();
    } else if (dueDateType === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 86400000);
      computedDueDate = tomorrow.toISOString();
    }

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        project_id: projectId,
        due_date: computedDueDate,
        tags: ['mobile'],
      });

      haptics.triggerSuccess();
      setTitle('');
      setDescription('');
      onClose();
    } catch {
      haptics.triggerError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Create New Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add details, criteria, or subtasks..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {priorities.map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => {
                      haptics.triggerLight();
                      setPriority(p);
                    }}
                    style={[
                      styles.priorityOption,
                      isSelected && styles.priorityOptionActive,
                    ]}
                  >
                    <PriorityBadge priority={p} size="sm" />
                    {isSelected && <Check size={12} color={colors.cobaltLight} style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Due Date</Text>
            <View style={styles.dueRow}>
              {[
                { id: 'today', label: '📅 Today' },
                { id: 'tomorrow', label: '☀️ Tomorrow' },
                { id: 'none', label: '📥 No Date (Inbox)' },
              ].map((d) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => {
                    haptics.triggerLight();
                    setDueDateType(d.id);
                  }}
                  style={[
                    styles.dueOption,
                    dueDateType === d.id && styles.dueOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.dueText,
                      dueDateType === d.id && styles.dueTextActive,
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {projects.length > 0 && (
              <>
                <Text style={styles.label}>Project Workspace</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectScroll}>
                  <TouchableOpacity
                    onPress={() => setProjectId(null)}
                    style={[
                      styles.projectChip,
                      projectId === null && styles.projectChipActive,
                    ]}
                  >
                    <Text style={[styles.projectChipText, projectId === null && styles.projectChipTextActive]}>
                      None (General)
                    </Text>
                  </TouchableOpacity>

                  {projects.map((proj) => (
                    <TouchableOpacity
                      key={proj.id}
                      onPress={() => {
                        haptics.triggerLight();
                        setProjectId(proj.id);
                      }}
                      style={[
                        styles.projectChip,
                        projectId === proj.id && styles.projectChipActive,
                      ]}
                    >
                      <View style={[styles.projDot, { backgroundColor: proj.color || colors.cobaltLight }]} />
                      <Text
                        style={[
                          styles.projectChipText,
                          projectId === proj.id && styles.projectChipTextActive,
                        ]}
                      >
                        {proj.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <CustomButton
              title="Create Task"
              variant="primary"
              loading={isSubmitting}
              disabled={!title.trim()}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  priorityOptionActive: {
    borderColor: colors.cobaltLight,
    backgroundColor: colors.surfaceHover,
  },
  checkIcon: {
    marginLeft: 4,
  },
  dueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dueOption: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  dueOptionActive: {
    borderColor: colors.cobaltLight,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
  },
  dueText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dueTextActive: {
    color: colors.cobaltLight,
    fontWeight: '600',
  },
  projectScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  projectChipActive: {
    borderColor: colors.cobaltLight,
    backgroundColor: colors.surfaceHover,
  },
  projDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  projectChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  projectChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 2,
  },
});
