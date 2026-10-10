import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext.js';
import { ProjectProvider } from './src/context/ProjectContext.js';
import { TaskProvider } from './src/context/TaskContext.js';
import { AgentProvider } from './src/context/AgentContext.js';
import AppNavigator from './src/navigation/AppNavigator.js';

export default function App() {
  return (
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
  );
}
