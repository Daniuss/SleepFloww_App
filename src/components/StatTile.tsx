import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Card } from './Card';

type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function StatTile({ label, value, hint }: Props) {
  const { colors, typography } = useTheme();
  return (
    <Card style={styles.card}>
      <Text style={[typography.caption, { color: colors.mutedInk }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
      <Text style={[typography.hero, { color: colors.primaryInk, fontVariant: ['tabular-nums'] }]}>
        {value}
      </Text>
      {hint ? (
        <Text style={[typography.caption, { color: colors.secondaryInk }]}>{hint}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140 },
});
