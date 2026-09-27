import { StyleSheet, Text, View } from 'react-native';

import { displayFont, theme } from '@/brand';
import { formatMoney } from '@/lib/format';
import type { Money } from '@/shopify/types';

export function Price({ price, compareAt, size = 15 }: { price: Money; compareAt?: Money | null; size?: number }) {
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);

  return (
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize: size + 2 }]}>{formatMoney(price)}</Text>
      {onSale && <Text style={[styles.compare, { fontSize: size - 2 }]}>{formatMoney(compareAt)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  price: { ...displayFont, color: theme.text, letterSpacing: 0.5 },
  compare: { color: theme.textMuted, textDecorationLine: 'line-through' },
});
