import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = TextInputProps & {
  label: string;
};

export function FormField({ label, style, ...inputProps }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.secondaryInk }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedInk}
        style={[
          styles.input,
          {
            borderColor: colors.border,
            borderRadius: radius.sm,
            color: colors.primaryInk,
            paddingHorizontal: spacing.md,
          },
          typography.body,
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    height: 48,
  },
});
