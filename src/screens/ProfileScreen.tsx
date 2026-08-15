import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';
import { useAuthStore } from '../store/authStore';
import type { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Perfil'>,
  NativeStackScreenProps<RootStackParamList>
>;

const OPTIONS = [
  { label: 'Exportar relatório', hint: 'Gera um PDF com o histórico para levar ao médico' },
  { label: 'Política de privacidade', hint: 'Como seus dados são usados e armazenados' },
  { label: 'Permissões do microfone', hint: 'Necessário para a captura de áudio noturna' },
];

export function ProfileScreen({ navigation }: Props) {
  const { colors, spacing, typography } = useTheme();
  const { email, logout } = useAuthStore();

  return (
    <ScreenContainer>
      <SectionTitle>Perfil</SectionTitle>

      <Card>
        <Text style={[typography.subtitle, { color: colors.primaryInk }]}>Conta</Text>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          {email ?? 'Não autenticado'} · Plano gratuito · Dados salvos só em memória no servidor
        </Text>
      </Card>

      <View style={{ gap: spacing.sm }}>
        {OPTIONS.map((opt) => (
          <Pressable key={opt.label}>
            <Card>
              <Text style={[typography.subtitle, { color: colors.primaryInk }]}>{opt.label}</Text>
              <Text style={[typography.caption, { color: colors.mutedInk }]}>{opt.hint}</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <AppButton
        label="Sair"
        variant="secondary"
        onPress={() => {
          logout();
          navigation.replace('Login');
        }}
      />
    </ScreenContainer>
  );
}
