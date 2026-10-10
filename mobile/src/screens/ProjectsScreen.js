import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { FolderKanban, Plus, X, Check, ArrowRight } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import CustomButton from '../components/common/CustomButton.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useProjects } from '../context/ProjectContext.js';
import { useTasks } from '../context/TaskContext.js';

const COLOR_SWATCHES = [
  '#1d4ed8', // Cobalt Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export default function ProjectsScreen({ navigation }) {
  const haptics = useHaptics();
  const { projects, isLoading, fetchProjects, createProject } = useProjects();
  const { tasks, setSelectedProjectId } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute task statistics per project
  const projectStats = React.useMemo(() => {
    const stats = {};
    projects.forEach((p) => {
      const pTasks = tasks.filter((t) => t.project_id === p.id);
      const total = pTasks.length;
      const completed = pTasks.filter((t) => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      stats[p.id] = { total, completed, rate };
    });
    return stats;
  }, [projects, tasks]);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    haptics.triggerMedium();

    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      });
      haptics.triggerSuccess();
      setName('');
      setDescription('');
      setModalVisible(false);
    } catch {
      haptics.triggerError();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProject = (projectId) => {
    haptics.triggerLight();
    setSelectedProjectId(projectId);
    navigation.navigate('Today');
  };

  const renderProjectCard = ({ item }) => {
    const stat = projectStats[item.id] || { total: 0, completed: 0, rate: 0 };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleSelectProject(item.id)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color || colors.cobaltLight }]} />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </View>
          <ArrowRight size={16} color={colors.textMuted} />
        </View>

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.metricsArea}>
          <View style={styles.metricsRow}>
            <Text style={styles.metricsText}>
              {stat.completed} / {stat.total} tasks
            </Text>
            <Text style={[styles.metricsRate, { color: item.color || colors.cobaltLight }]}>
              {stat.rate}%
            </Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${stat.rate}%`,
                  backgroundColor: item.color || colors.cobaltPrimary,
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <Header
        title="Projects"
        subtitle="Workspace categories & progress"
        rightAction="+ Project"
        onRightActionPress={() => {
          haptics.triggerLight();
          setModalVisible(true);
        }}
      />

      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProjectCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchProjects}
            tintColor={colors.cobaltLight}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <FolderKanban size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Projects Yet</Text>
              <Text style={styles.emptyDesc}>
                Create your first project workspace to organize tasks by team, sprint, or feature.
              </Text>
              <CustomButton
                title="Create First Project"
                onPress={() => setModalVisible(true)}
                style={styles.emptyBtn}
              />
            </View>
          ) : null
        }
      />

      {/* Create Project Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Project Workspace</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Project Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Mobile App, Backend API, Sprint 4"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this workspace focused on?"
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Workspace Color</Text>
              <View style={styles.swatchRow}>
                {COLOR_SWATCHES.map((hex) => {
                  const isSelected = selectedColor === hex;
                  return (
                    <TouchableOpacity
                      key={hex}
                      onPress={() => {
                        haptics.triggerLight();
                        setSelectedColor(hex);
                      }}
                      style={[styles.swatch, { backgroundColor: hex }]}
                    >
                      {isSelected && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Create Workspace"
                variant="primary"
                disabled={!name.trim()}
                loading={isSubmitting}
                onPress={handleCreate}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  metricsArea: {
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricsText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  metricsRate: {
    fontSize: 11,
    fontWeight: '700',
  },
  track: {
    height: 5,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2.5,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
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
    height: 70,
    textAlignVertical: 'top',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});
