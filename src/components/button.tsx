import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { theme } from '@/brand';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const primary = variant === 'primary';
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        (pressed || inactive) && { opacity: inactive ? 0.45 : 0.8 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? theme.onPrimary : theme.text} />
      ) : (
        <Text style={[styles.label, { color: primary ? theme.onPrimary : theme.text }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: { backgroundColor: theme.primary },
  secondary: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  label: { fontSize: 16, fontWeight: '600' },
});
