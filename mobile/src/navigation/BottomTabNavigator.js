import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar, Inbox, FolderKanban, FileText, Sparkles } from 'lucide-react-native';
import TodayScreen from '../screens/TodayScreen.js';
import InboxScreen from '../screens/InboxScreen.js';
import ProjectsScreen from '../screens/ProjectsScreen.js';
import NotesScreen from '../screens/NotesScreen.js';
import AgentScreen from '../screens/AgentScreen.js';
import colors from '../theme/colors.js';
import useHaptics from '../hooks/useHaptics.js';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const haptics = useHaptics();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.cobaltLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
      screenListeners={{
        tabPress: () => {
          haptics.triggerLight();
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, size }) => <Inbox color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <FolderKanban color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          tabBarLabel: 'Notes',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size - 2} />,
        }}
      />
      <Tab.Screen
        name="Copilot"
        component={AgentScreen}
        options={{
          tabBarLabel: 'Copilot',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.copilotIconBadge}>
              <Sparkles color={colors.cobaltLight} size={size - 2} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  copilotIconBadge: {
    padding: 2,
    borderRadius: 8,
  },
});
