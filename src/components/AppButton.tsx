import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', loading, disabled }: Props) {
  const { colors, radius, spacing, typography } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? colors.brand : 'transparent',
          borderColor: colors.brand,
          borderWidth: isPrimary ? 0 : 1.5,
          borderRadius: radius.md,
          paddingVertical: spacing.md,
          opacity: pressed || disabled ? 0.7 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.brand} />
      ) : (
        <Text
          style={[
            typography.subtitle,
            { color: isPrimary ? '#fff' : colors.brand, textAlign: 'center' },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
