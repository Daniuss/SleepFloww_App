import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { ScreenContainer } from '../components/ScreenContainer';
import { FormField } from '../components/FormField';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { login } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNightsStore } from '../store/nightsStore';
import { useRecordsStore } from '../store/recordsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Autentica contra o backend (server/). Primeiro login com um e-mail novo
// cria a conta automaticamente — ainda não existe tela de cadastro separada.
export function LoginScreen({ navigation }: Props) {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const fetchNights = useNightsStore((s) => s.fetchNights);
  const fetchRecords = useRecordsStore((s) => s.fetchRecords);

  const canSubmit = email.trim().length > 3 && password.length >= 4;

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      const { token, email: sessionEmail } = await login(email.trim(), password);
      setSession(token, sessionEmail);
      await Promise.all([fetchNights(token), fetchRecords(token)]);
      navigation.replace('Main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer
      scroll={false}
      backgroundColor={isDark ? colors.page : '#eef1fb'}
      style={{ flex: 1, justifyContent: 'center', gap: spacing.xl }}
    >
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.lg,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 30 }}>🌙</Text>
        </View>
        <Text style={[typography.title, { color: colors.primaryInk }]}>SleepFlow</Text>
        <Text style={[typography.body, { color: colors.secondaryInk, textAlign: 'center' }]}>
          Acompanhe seus padrões respiratórios durante o sono.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.lg,
          gap: spacing.md,
          borderWidth: isDark ? 1 : 0,
          borderColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: '#0b0b0b',
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: isDark ? 0 : 0.08,
              shadowRadius: 24,
            },
            android: { elevation: isDark ? 0 : 3 },
            default: {},
          }),
        }}
      >
        <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Entrar na sua conta</Text>

        <FormField
          label="E-mail"
          placeholder="voce@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <FormField
          label="Senha"
          placeholder="********"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && (
          <Text style={[typography.caption, { color: colors.critical }]}>{error}</Text>
        )}

        <AppButton
          label="Entrar"
          disabled={!canSubmit}
          loading={loading}
          onPress={handleSubmit}
        />
      </View>

      <Text style={[typography.caption, { color: colors.mutedInk, textAlign: 'center' }]}>
        Este app não diagnostica apneia nem substitui avaliação médica.
      </Text>
    </ScreenContainer>
  );
}
