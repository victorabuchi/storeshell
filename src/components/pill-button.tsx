import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { displayFont } from '@/brand';

type Props = {
  title: string;
  onPress: () => void;
  // solid: white on dark photos · outline: white border · dark: brand dark fill
  variant?: 'solid' | 'outline' | 'dark';
  loading?: boolean;
  disabled?: boolean;
};

// Rounded full-pill button used on photo and dark screens.
export function PillButton({ title, onPress, variant = 'solid', loading, disabled }: Props) {
  const inactive = disabled || loading;
  const textColor = variant === 'solid' ? '#111111' : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (pressed || inactive) && { opacity: inactive ? 0.5 : 0.8 },
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    minWidth: 120,
    paddingHorizontal: 28,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solid: { backgroundColor: '#FFFFFF' },
  outline: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' },
  dark: { backgroundColor: '#111111' },
  label: { ...displayFont, fontSize: 18, letterSpacing: 1 },
});
