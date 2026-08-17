import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SleepSessionScreen } from '../screens/SleepSessionScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { MicrophonePermissionScreen } from '../screens/MicrophonePermissionScreen';
import { MainTabs } from './MainTabs';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const initializing = useAuthStore((s) => s.initializing);
  const session = useAuthStore((s) => s.session);

  // Espera a sessão salva (AsyncStorage) ser restaurada antes de decidir a
  // primeira tela — evita mostrar o Login por um instante pra quem já tinha
  // entrado antes.
  if (initializing) return null;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={session ? 'Main' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="SleepSession" component={SleepSessionScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="MicrophonePermission" component={MicrophonePermissionScreen} />
    </Stack.Navigator>
  );
}
