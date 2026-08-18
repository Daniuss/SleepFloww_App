import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppButton } from './AppButton';
import { setAlertListener, type AppAlertRequest } from './AppAlert.web';

// Montado 1x no App.tsx. Mostra os pedidos de AppAlert.alert() como um
// Modal de verdade (react-native-web implementa Modal corretamente,
// diferente de Alert) usando as mesmas cores/tipografia/espaçamento do
// resto do app — mesmo visual de cartão já usado no LoginScreen.
export function AppAlertHost() {
  const { colors, spacing, radius, typography } = useTheme();
  const [queue, setQueue] = useState<AppAlertRequest[]>([]);

  useEffect(() => {
    setAlertListener((request) => setQueue((prev) => [...prev, request]));
    return () => setAlertListener(null);
  }, []);

  const current = queue[0] ?? null;

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  if (!current) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={dismiss}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(11,11,11,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.lg,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
            gap: spacing.md,
          }}
        >
          <Text style={[typography.subtitle, { color: colors.primaryInk }]}>{current.title}</Text>
          {current.message ? (
            <Text style={[typography.body, { color: colors.secondaryInk }]}>{current.message}</Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' }}>
            {current.buttons.map((button, index) => (
              <View key={index} style={{ flex: current.buttons.length > 1 ? 1 : undefined }}>
                <AppButton
                  label={button.text ?? 'OK'}
                  variant={button.style === 'cancel' ? 'secondary' : 'primary'}
                  onPress={() => {
                    button.onPress?.();
                    dismiss();
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
