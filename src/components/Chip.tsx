import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: Props) {
  const { colors, radius, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          borderRadius: radius.pill,
          borderColor: selected ? colors.brand : colors.border,
          backgroundColor: selected ? colors.brandSoft : 'transparent',
        },
      ]}
    >
      <Text
        style={[
          typography.caption,
          { color: selected ? colors.brand : colors.secondaryInk },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
