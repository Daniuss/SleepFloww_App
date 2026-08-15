import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.title, { color: colors.primaryInk }]}>{children}</Text>;
}

export function SectionSubtitle({ children }: { children: React.ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.body, { color: colors.secondaryInk }]}>{children}</Text>;
}
