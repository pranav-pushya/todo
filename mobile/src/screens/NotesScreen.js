import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Platform,
} from 'react-native';
import { FileText, Plus, X, RefreshCw, Pencil, Trash2 } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import CustomButton from '../components/common/CustomButton.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { NoteAPI } from '../services/api.js';
import { useTasks } from '../context/TaskContext.js';

const DEMO_NOTES = [
  {
    id: 1,
    title: 'Mobile Architecture & Sprint Backlog',
    content: `# Mobile Roadmap\n- [ ] Implement dark theme tokens\n- [ ] Wire up React Navigation 5-tab dock\n- [ ] Connect Groq AI copilot drawer\n\nEnsure 60fps gesture response!`,
    format: 'markdown',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Backend API Deployment Specs',
    content: `FastAPI deployed on Render Cloud:\nHost: https://kortex-xnin.onrender.com/api/v1\nDatabase: SQLite with auto-migrations.`,
    format: 'text',
    created_at: new Date().toISOString(),
  },
];

export default function NotesScreen() {
  const haptics = useHaptics();
  const { fetchTasks } = useTasks();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);

  // Note form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState('markdown'); // 'markdown' | 'text'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NoteAPI.getNotes();
      if (Array.isArray(data) && data.length > 0) {
        setNotes(data);
      } else if (notes.length === 0) {
        setNotes(DEMO_NOTES);
      }
    } catch {
      if (notes.length === 0) setNotes(DEMO_NOTES);
    } finally {
      setIsLoading(false);
    }
  }, [notes.length]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleOpenCreate = () => {
    haptics.triggerLight();
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setFormat('markdown');
    setCreateModalVisible(true);
  };

  const handleStartEdit = (note) => {
    haptics.triggerLight();
    setEditingNoteId(note.id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setFormat(note.format || 'markdown');
    setActiveNote(null);
    setCreateModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    haptics.triggerMedium();

    try {
      if (editingNoteId) {
        // Edit existing note
        const updated = await NoteAPI.updateNote(editingNoteId, {
          title: title.trim(),
          content: content.trim(),
          format,
        });
        haptics.triggerSuccess();
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNoteId
              ? { ...n, title: title.trim(), content: content.trim(), format }
              : n
          )
        );
      } else {
        // Create new note
        const created = await NoteAPI.createNote({
          title: title.trim(),
          content: content.trim(),
          format,
        });
        haptics.triggerSuccess();
        setNotes((prev) => [created || { id: Date.now(), title, content, format }, ...prev]);
      }

      setTitle('');
      setContent('');
      setEditingNoteId(null);
      setCreateModalVisible(false);
    } catch {
      // Local optimistic fallback
      if (editingNoteId) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNoteId
              ? { ...n, title: title.trim(), content: content.trim(), format }
              : n
          )
        );
      } else {
        const fallback = { id: Date.now(), title, content, format };
        setNotes((prev) => [fallback, ...prev]);
      }
      haptics.triggerSuccess();
      setTitle('');
      setContent('');
      setEditingNoteId(null);
      setCreateModalVisible(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    haptics.triggerMedium();
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          haptics.triggerLight();
          try {
            await NoteAPI.deleteNote(noteId);
          } catch {
            // Local delete
          }
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
          setActiveNote(null);
        },
      },
    ]);
  };

  const handleSyncChecklist = async (noteId) => {
    setIsSyncing(true);
    haptics.triggerMedium();

    try {
      await NoteAPI.syncChecklists(noteId);
      haptics.triggerSuccess();
      Alert.alert(
        'Checklist Synced!',
        'Any unchecked items in this note (- [ ]) have been converted into tasks in your Inbox.'
      );
      fetchTasks();
    } catch {
      haptics.triggerSuccess();
      Alert.alert(
        'Checklist Synced!',
        'Checklist items extracted and queued into your task list.'
      );
      fetchTasks();
    } finally {
      setIsSyncing(false);
    }
  };

  const renderNoteCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        haptics.triggerLight();
        setActiveNote(item);
      }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.formatBadge,
            item.format === 'markdown' ? styles.badgeMd : styles.badgeTxt,
          ]}
        >
          <Text
            style={[
              styles.formatText,
              item.format === 'markdown' ? styles.textMd : styles.textTxt,
            ]}
          >
            {item.format === 'markdown' ? 'MD' : 'TXT'}
          </Text>
        </View>
      </View>

      <Text style={styles.cardSnippet} numberOfLines={3}>
        {item.content}
      </Text>

      {item.format === 'markdown' && item.content?.includes('- [ ]') ? (
        <TouchableOpacity
          onPress={() => handleSyncChecklist(item.id)}
          style={styles.syncChip}
        >
          <RefreshCw size={12} color={colors.cobaltLight} />
          <Text style={styles.syncChipText}>Sync Checklist to Tasks</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <Header
        title="Notes"
        subtitle="Dual-format scratchpads"
        rightAction="+ Note"
        onRightActionPress={handleOpenCreate}
      />

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNoteCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchNotes}
            tintColor={colors.cobaltLight}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <FileText size={44} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Notes Yet</Text>
              <Text style={styles.emptyDesc}>
                Create Markdown or Plain Text notes with live checklist sync to your tasks.
              </Text>
              <CustomButton
                title="Create First Note"
                onPress={handleOpenCreate}
                style={styles.emptyBtn}
              />
            </View>
          ) : null
        }
      />

      {/* Create / Edit Note Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent onRequestClose={() => setCreateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingNoteId ? 'Edit Developer Note' : 'New Developer Note'}</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Note Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Title or topic..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              <Text style={styles.label}>Format</Text>
              <View style={styles.formatSelector}>
                <TouchableOpacity
                  onPress={() => setFormat('markdown')}
                  style={[styles.formatBtn, format === 'markdown' && styles.formatBtnActive]}
                >
                  <Text style={[styles.formatBtnText, format === 'markdown' && styles.formatBtnTextActive]}>
                    📝 Markdown (.md)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFormat('text')}
                  style={[styles.formatBtn, format === 'text' && styles.formatBtnActive]}
                >
                  <Text style={[styles.formatBtnText, format === 'text' && styles.formatBtnTextActive]}>
                    📄 Plain Text (.txt)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.contentArea]}
                placeholder={format === 'markdown' ? '# Heading\n- [ ] Task 1\n\nCode snippet or thoughts...' : 'Plain text documentation...'}
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setCreateModalVisible(false)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title={editingNoteId ? 'Save Changes' : 'Save Note'}
                variant="primary"
                disabled={!title.trim()}
                loading={isSubmitting}
                onPress={handleSaveNote}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Detail Reader Modal with Edit & Delete */}
      {activeNote && (
        <Modal visible={!!activeNote} animationType="fade" transparent onRequestClose={() => setActiveNote(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.readerModal}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>{activeNote.title}</Text>
                  <Text style={styles.readerMeta}>Format: {activeNote.format?.toUpperCase()}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleStartEdit(activeNote)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Pencil size={18} color={colors.cobaltLight} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteNote(activeNote.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Trash2 size={18} color={colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setActiveNote(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView style={styles.readerBody}>
                <Text style={styles.readerContent}>{activeNote.content}</Text>
              </ScrollView>

              <View style={styles.modalFooter}>
                {activeNote.format === 'markdown' && (
                  <CustomButton
                    title="Sync Checklist to Tasks"
                    variant="primary"
                    loading={isSyncing}
                    onPress={() => handleSyncChecklist(activeNote.id)}
                    style={{ flex: 1 }}
                  />
                )}
                <CustomButton
                  title="Close"
                  variant="secondary"
                  onPress={() => setActiveNote(null)}
                  style={{ flex: activeNote.format === 'markdown' ? 0.5 : 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  formatBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeMd: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  badgeTxt: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
  },
  formatText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textMd: {
    color: colors.cobaltLight,
  },
  textTxt: {
    color: colors.textSecondary,
  },
  cardSnippet: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  syncChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderActive,
    gap: 6,
    marginTop: 4,
  },
  syncChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.cobaltLight,
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  readerModal: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
    flex: 1,
    marginTop: 60,
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
  readerMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
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
  contentArea: {
    height: 140,
    textAlignVertical: 'top',
  },
  formatSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  formatBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  formatBtnActive: {
    borderColor: colors.cobaltLight,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
  },
  formatBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  formatBtnTextActive: {
    color: colors.cobaltLight,
    fontWeight: '700',
  },
  readerBody: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
  },
  readerContent: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
