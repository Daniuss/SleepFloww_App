import React, { useState } from 'react';
import { Text, View } from 'react-native';
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
  const { colors, spacing, typography } = useTheme();
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
    <ScreenContainer scroll={false} style={{ flex: 1, justifyContent: 'center', gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.hero, { color: colors.primaryInk }]}>SleepFlow</Text>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          Acompanhe seus padrões respiratórios durante o sono.
        </Text>
      </View>

      <View style={{ gap: spacing.md }}>
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
      </View>

      {error && (
        <Text style={[typography.caption, { color: colors.critical, textAlign: 'center' }]}>
          {error}
        </Text>
      )}

      <AppButton
        label="Entrar"
        disabled={!canSubmit}
        loading={loading}
        onPress={handleSubmit}
      />
      <Text style={[typography.caption, { color: colors.mutedInk, textAlign: 'center' }]}>
        Este app não diagnostica apneia nem substitui avaliação médica.
      </Text>
    </ScreenContainer>
  );
}
