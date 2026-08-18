import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppAlertHost } from './src/components/AppAlertHost';
import { supabase } from './src/api/supabaseClient';
import { useAuthStore } from './src/store/authStore';
import './src/types/navigation';

function Navigation() {
  const { isDark } = useTheme();
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  const setSession = useAuthStore((s) => s.setSession);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setInitializing]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Navigation />
        <AppAlertHost />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
