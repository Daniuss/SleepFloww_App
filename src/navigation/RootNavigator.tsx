import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { SleepSessionScreen } from '../screens/SleepSessionScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { MicrophonePermissionScreen } from '../screens/MicrophonePermissionScreen';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="SleepSession" component={SleepSessionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="MicrophonePermission" component={MicrophonePermissionScreen} />
    </Stack.Navigator>
  );
}
