import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { NightSeverity } from '../types/domain';

const SEVERITY_TO_STATUS: Record<NightSeverity, 'good' | 'warning' | 'serious'> = {
  baixo: 'good',
  moderado: 'warning',
  alto: 'serious',
};

export function StatusBadge({ severity, label }: { severity: NightSeverity; label: string }) {
  const { colors, radius, spacing, typography } = useTheme();
  const statusKey = SEVERITY_TO_STATUS[severity];
  const color = colors[statusKey];

  return (
    <View
      style={[
        styles.pill,
        { borderColor: color, borderRadius: radius.pill, paddingHorizontal: spacing.sm },
      ]}
    >
      {/* Nunca só a cor: sempre bolinha + texto, por causa de daltonismo/contraste */}
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[typography.caption, { color: colors.primaryInk }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
