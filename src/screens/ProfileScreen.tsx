import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppAlert } from '../components/AppAlert';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/authStore';
import { useNightsStore } from '../store/nightsStore';
import { exportNightsReport } from '../reports/nightsReport';
import { signOut } from '../api/supabaseAuth';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Perfil'>,
  NativeStackScreenProps<RootStackParamList>
>;

type OptionKey = 'export' | 'privacy' | 'permissions';

const OPTIONS: { key: OptionKey; label: string; hint: string }[] = [
  { key: 'export', label: 'Exportar relatório', hint: 'Gera um PDF com o histórico para levar ao médico' },
  { key: 'privacy', label: 'Política de privacidade', hint: 'Como seus dados são usados e armazenados' },
  { key: 'permissions', label: 'Permissões do microfone', hint: 'Necessário para a captura de áudio noturna' },
];

export function ProfileScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const user = useAuthStore((s) => s.user);
  const nights = useNightsStore((s) => s.nights);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (nights.length === 0) {
      AppAlert.alert('Nada para exportar', 'Grave pelo menos uma noite antes de exportar o relatório.');
      return;
    }
    setExporting(true);
    try {
      await exportNightsReport(nights, user?.email ?? '');
    } catch (err) {
      AppAlert.alert('Erro ao exportar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  function handlePress(key: OptionKey) {
    if (key === 'export') return handleExport();
    if (key === 'privacy') return navigation.navigate('PrivacyPolicy');
    if (key === 'permissions') return navigation.navigate('MicrophonePermission');
  }

  return (
    <ScreenContainer>
      <SectionTitle>Perfil</SectionTitle>

      <Card>
        <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Conta</Text>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {user?.email ?? 'Não autenticado'} · Plano gratuito · Dados salvos na nuvem (Supabase)
        </Text>
      </Card>

      <View style={{ gap: spacing.sm }}>
        {OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => handlePress(opt.key)}
            disabled={opt.key === 'export' && exporting}
            accessibilityRole="button"
            accessibilityLabel={opt.label}
            accessibilityHint={opt.hint}
          >
            <Card>
              <Text style={[typography.subtitle, { color: colors.primaryInk }]}>
                {opt.key === 'export' && exporting ? 'Gerando relatório...' : opt.label}
              </Text>
              <Text style={[typography.caption, { color: colors.mutedInk }]}>{opt.hint}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <AppButton
        label="Sair"
        variant="secondary"
        onPress={async () => {
          await signOut();
          navigation.replace('Login');
        }}
      />
    </ScreenContainer>
  );
}
