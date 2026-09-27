import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAccount, type Order } from '@/account/account-provider';
import { displayFont, theme } from '@/brand';
import { ErrorState, Loading } from '@/components/status';
import { formatMoney } from '@/lib/format';
import { useAsync } from '@/lib/use-async';

const STATUS: Record<string, string> = {
  FULFILLED: 'Delivered or on its way',
  IN_PROGRESS: 'Being prepared',
  ON_HOLD: 'On hold',
  OPEN: 'Order placed',
  PARTIALLY_FULFILLED: 'Partly shipped',
  PENDING_FULFILLMENT: 'Order placed',
  RESTOCKED: 'Returned',
  SCHEDULED: 'Scheduled',
  UNFULFILLED: 'Order placed',
};

export default function OrdersScreen() {
  const { getOrders } = useAccount();
  const { data, error, refetch } = useAsync(getOrders, 'orders');

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <Loading />;

  return (
    <FlatList
      data={data}
      keyExtractor={(o) => o.id}
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      renderItem={({ item }) => <OrderRow order={item} />}
    />
  );
}

function OrderRow({ order }: { order: Order }) {
  const items = order.lineItems.nodes;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => WebBrowser.openBrowserAsync(order.statusPageUrl)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.surface }]}>
      <View style={styles.thumbs}>
        {items.slice(0, 2).map((item, i) => (
          <Image key={i} source={item.image?.url} style={styles.thumb} contentFit="cover" />
        ))}
      </View>
      <View style={styles.info}>
        <Text style={styles.status}>{STATUS[order.fulfillmentStatus] ?? order.fulfillmentStatus}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {items.map((i) => i.title).join(', ')}
        </Text>
        <Text style={styles.meta}>
          {order.name} · {new Date(order.processedAt).toLocaleDateString()} · {formatMoney(order.totalPrice)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.border,
  },
  thumbs: { flexDirection: 'row', gap: 6 },
  thumb: { width: 64, height: 80, borderRadius: 8, backgroundColor: theme.surface },
  info: { flex: 1, gap: 4, justifyContent: 'center' },
  status: { ...displayFont, fontSize: 20, color: theme.text },
  meta: { fontSize: 14, color: theme.textMuted },
  empty: { padding: 24, fontSize: 16, color: theme.textMuted },
});
