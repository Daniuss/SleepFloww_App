import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { ScreenContainer } from '../components/ScreenContainer';
import { FormField } from '../components/FormField';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { signUp } from '../api/supabaseAuth';
import { useAuthStore } from '../store/authStore';
import { useNightsStore } from '../store/nightsStore';
import { useRecordsStore } from '../store/recordsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { colors, spacing, radius, typography, isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);
  const fetchNights = useNightsStore((s) => s.fetchNights);
  const fetchRecords = useRecordsStore((s) => s.fetchRecords);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 3 &&
    password.length >= 6 &&
    confirmPassword.length >= 6;

  async function handleSubmit() {
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const { session } = await signUp(email.trim(), password, name.trim());
      setSession(session);
      if (!session) {
        // Não deveria acontecer com "Confirm email" desativado no Supabase,
        // mas cobrimos o caso mesmo assim.
        setError('Conta criada. Confirme seu e-mail antes de entrar.');
        return;
      }
      await Promise.all([fetchNights(session.user.id), fetchRecords(session.user.id)]);
      navigation.replace('Main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer
      scroll
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
        <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Criar sua conta</Text>

        <FormField label="Nome" placeholder="Seu nome" value={name} onChangeText={setName} />
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
        <FormField
          label="Confirmar senha"
          placeholder="********"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {error && (
          <Text style={[typography.caption, { color: colors.critical }]}>{error}</Text>
        )}

        <AppButton
          label="Criar conta"
          disabled={!canSubmit}
          loading={loading}
          onPress={handleSubmit}
        />

        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={[typography.caption, { color: colors.secondaryInk, textAlign: 'center' }]}>
            Já possui uma conta?{' '}
            <Text style={{ color: colors.brand, fontWeight: '600' }}>Entrar</Text>
          </Text>
        </Pressable>
      </View>

      <Text style={[typography.caption, { color: colors.mutedInk, textAlign: 'center' }]}>
        Este app não diagnostica apneia nem substitui avaliação médica.
      </Text>
    </ScreenContainer>
  );
}
