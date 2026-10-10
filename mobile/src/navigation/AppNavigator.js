import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator.js';
import ProfileScreen from '../screens/ProfileScreen.js';
import AuthScreen from '../screens/AuthScreen.js';
import colors from '../theme/colors.js';

const Stack = createNativeStackNavigator();

const KortexNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.cobaltLight,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.borderSubtle,
    notification: colors.danger,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={KortexNavigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'default',
        }}
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            presentation: Platform.OS === 'ios' ? 'fullScreenModal' : 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
