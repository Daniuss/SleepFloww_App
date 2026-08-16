import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = TextInputProps & {
  label: string;
};

export function FormField({ label, style, onFocus, onBlur, ...inputProps }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.secondaryInk }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.mutedInk}
        style={[
          styles.input,
          {
            borderColor: isFocused ? colors.brand : colors.border,
            borderWidth: isFocused ? 2 : 1,
            borderRadius: radius.sm,
            color: colors.primaryInk,
            paddingHorizontal: spacing.md,
          },
          typography.body,
          style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
  },
});
