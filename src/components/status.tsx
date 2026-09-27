import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { displayFont, theme } from '@/brand';
import { Button } from './button';

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button title="Try again" variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: theme.background,
  },
  title: { ...displayFont, fontSize: 24, color: theme.text },
  message: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
});
