import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { displayFont, theme } from '@/brand';

type Props = {
  label: string;
  // Shown on the right, or under the label with `large`.
  value?: string;
  onPress?: () => void;
  // Bigger title with the value underneath (Profile); compact label/value row otherwise (Settings).
  large?: boolean;
  destructive?: boolean;
};

export function ListRow({ label, value, onPress, large, destructive }: Props) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, large && styles.large, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text style={[large ? styles.largeLabel : styles.label, destructive && styles.destructive]}>
          {label}
        </Text>
        {large && value ? <Text style={styles.subtitle}>{value}</Text> : null}
      </View>
      {!large && value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? <SymbolView name="chevron.right" size={16} tintColor={theme.textMuted} /> : null}
    </Pressable>
  );
}

export function ListGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

const styles = StyleSheet.create({
  group: { backgroundColor: theme.background },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 64,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  large: { minHeight: 96, paddingVertical: 18 },
  pressed: { backgroundColor: theme.surface },
  text: { flex: 1, gap: 4 },
  label: { ...displayFont, fontSize: 18, letterSpacing: 0.5, color: theme.text },
  largeLabel: { ...displayFont, fontSize: 24, letterSpacing: 0.5, color: theme.text },
  subtitle: { fontSize: 16, color: theme.textMuted },
  value: { fontSize: 16, color: theme.textMuted },
  destructive: { color: '#C62828' },
});
