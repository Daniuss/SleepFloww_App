import React, { useEffect, useState } from 'react';
import { Linking, Text } from 'react-native';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import type { PermissionResponse } from 'expo-modules-core';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionTitle } from '../components/SectionTitle';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { useTheme } from '../theme/ThemeProvider';

export function MicrophonePermissionScreen() {
  const { colors, spacing, typography } = useTheme();
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const status = await getRecordingPermissionsAsync();
    setPermission(status);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleRequest() {
    const status = await requestRecordingPermissionsAsync();
    setPermission(status);
  }

  const statusLabel = !permission
    ? 'Verificando...'
    : permission.granted
      ? 'Permitido'
      : permission.canAskAgain
        ? 'Não permitido (pode pedir de novo)'
        : 'Negado permanentemente';

  return (
    <ScreenContainer scroll={false} style={{ flex: 1, gap: spacing.lg }}>
      <SectionTitle>Permissões do microfone</SectionTitle>

      <Card>
        <Text style={[typography.body, { color: colors.secondaryInk }]}>
          O microfone é necessário para gravar e analisar o áudio durante a noite. Sem essa
          permissão, a gravação da noite não funciona.
        </Text>
        <Text style={[typography.subtitle, { color: colors.primaryInk, marginTop: spacing.sm }]}>
          Status atual: {statusLabel}
        </Text>
      </Card>

      {!loading && permission && !permission.granted && permission.canAskAgain && (
        <AppButton label="Permitir acesso ao microfone" onPress={handleRequest} />
      )}

      <AppButton
        label="Abrir configurações do app"
        variant="secondary"
        onPress={() => Linking.openSettings()}
      />
    </ScreenContainer>
  );
}
