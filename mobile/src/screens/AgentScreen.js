import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Send, Sparkles, Terminal, Trash2, Cpu } from 'lucide-react-native';
import ScreenContainer from '../components/common/ScreenContainer.js';
import Header from '../components/common/Header.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';
import { useAgent } from '../context/AgentContext.js';
import { useTasks } from '../context/TaskContext.js';

const QUICK_PROMPTS = [
  '⚡ Plan my sprint today',
  '🔥 Add urgent P1 bug fix',
  '📋 Show open tasks',
  '🧹 Clean up completed items',
];

export default function AgentScreen({ navigation }) {
  const haptics = useHaptics();
  const { messages, isThinking, sendCommand, clearMessages } = useAgent();
  const { fetchTasks } = useTasks();

  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isThinking]);

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || input;
    if (!promptToSend.trim() || isThinking) return;

    haptics.triggerMedium();
    setInput('');

    await sendCommand(promptToSend, () => {
      fetchTasks();
    });

    haptics.triggerSuccess();
  };

  const renderToolCallBadge = (tool) => {
    const toolName = typeof tool === 'string' ? tool : tool.name || tool.tool || 'function_call';
    return (
      <View key={toolName} style={styles.toolBadge}>
        <Terminal size={12} color={colors.cobaltLight} />
        <Text style={styles.toolName}>Action: {toolName}</Text>
        <View style={styles.toolStatusDot} />
      </View>
    );
  };

  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.agentRow]}>
        {!isUser && (
          <View style={styles.agentAvatar}>
            <Cpu size={16} color={colors.cobaltLight} />
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.agentText]}>
            {item.text}
          </Text>

          {Array.isArray(item.tool_calls) && item.tool_calls.length > 0 && (
            <View style={styles.toolsContainer}>
              {item.tool_calls.map((t, idx) => renderToolCallBadge(t))}
            </View>
          )}

          <Text style={[styles.timeText, isUser ? styles.userTime : styles.agentTime]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <Header
        title="Copilot"
        subtitle="Autonomous Groq AI"
        rightAction="Clear"
        onRightActionPress={() => {
          haptics.triggerLight();
          clearMessages();
        }}
        rightIcon={<Trash2 size={14} color={colors.textMuted} style={{ marginRight: 4 }} />}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.chatList}
          ListFooterComponent={
            isThinking ? (
              <View style={styles.thinkingContainer}>
                <View style={styles.agentAvatar}>
                  <Cpu size={16} color={colors.cobaltLight} />
                </View>
                <View style={styles.thinkingBubble}>
                  <ActivityIndicator size="small" color={colors.cobaltLight} />
                  <Text style={styles.thinkingText}>Copilot is evaluating tools...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Prompts Carousel */}
        <View style={styles.quickPromptSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptScroll}
          >
            {QUICK_PROMPTS.map((p, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => handleSend(p)}
                style={styles.promptChip}
              >
                <Sparkles size={11} color={colors.cobaltLight} />
                <Text style={styles.promptChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Command Input Bar */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Instruct AI copilot or ask a question..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!input.trim() || isThinking}
            onPress={() => handleSend()}
            style={[
              styles.sendButton,
              (!input.trim() || isThinking) && styles.sendButtonDisabled,
            ]}
          >
            <Send size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  chatList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  agentRow: {
    justifyContent: 'flex-start',
  },
  agentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: colors.cobaltPrimary,
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  agentText: {
    color: colors.textPrimary,
  },
  toolsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    gap: 4,
  },
  toolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderActive,
    gap: 6,
  },
  toolName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.cobaltLight,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  toolStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginLeft: 'auto',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  agentTime: {
    color: colors.textMuted,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 8,
  },
  thinkingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quickPromptSection: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  quickPromptScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  promptChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cobaltPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
});
