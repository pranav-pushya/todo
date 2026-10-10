import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ErrorBoundary from './src/components/common/ErrorBoundary.js';
import { AuthProvider } from './src/context/AuthContext.js';
import { ProjectProvider } from './src/context/ProjectContext.js';
import { TaskProvider } from './src/context/TaskContext.js';
import { AgentProvider } from './src/context/AgentContext.js';
import AppNavigator from './src/navigation/AppNavigator.js';
import colors from './src/theme/colors.js';

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AuthProvider>
            <ProjectProvider>
              <TaskProvider>
                <AgentProvider>
                  <StatusBar style="light" />
                  <AppNavigator />
                </AgentProvider>
              </TaskProvider>
            </ProjectProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
