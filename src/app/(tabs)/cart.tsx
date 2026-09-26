import {
  AcceleratedCheckoutButtons,
  ApplePayLabel,
  useShopifyCheckoutSheet,
} from '@shopify/checkout-sheet-kit';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/brand';
import { useCart } from '@/cart/cart-provider';
import { walletButtons } from '@/checkout/config';
import { Button } from '@/components/button';
import { formatMoney, variantLabel } from '@/lib/format';
import type { CartLine } from '@/shopify/types';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { cart, busy, setLineQuantity, clear } = useCart();
  const checkout = useShopifyCheckoutSheet();

  // Warm up the checkout sheet so it opens instantly.
  useEffect(() => {
    if (cart?.totalQuantity) checkout.preload(cart.checkoutUrl);
  }, [cart, checkout]);

  const changeQuantity = (line: CartLine, quantity: number) =>
    setLineQuantity(line.id, quantity).catch((e: Error) => Alert.alert('Could not update bag', e.message));

  if (!cart || cart.totalQuantity === 0) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top }]}>
        <Text style={styles.emptyTitle}>Your bag is empty</Text>
        <Text style={styles.muted}>Items you add will show up here.</Text>
        <Button title="Start shopping" onPress={() => router.navigate('/')} style={{ marginTop: 12 }} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={cart.lines.nodes}
        keyExtractor={(line) => line.id}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 12 }]}
        ListHeaderComponent={<Text style={styles.heading}>Bag</Text>}
        renderItem={({ item }) => (
          <LineItem line={item} disabled={busy} onChange={(q) => changeQuantity(item, q)} />
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatMoney(cart.cost.subtotalAmount)}</Text>
        </View>
        <Text style={styles.muted}>Shipping and taxes calculated at checkout.</Text>
        <Button title="Checkout" onPress={() => checkout.present(cart.checkoutUrl)} disabled={busy} />
        {Platform.OS === 'ios' && checkout.acceleratedCheckoutsAvailable && (
          <AcceleratedCheckoutButtons
            cartId={cart.id}
            wallets={walletButtons}
            applePayLabel={ApplePayLabel.checkout}
            cornerRadius={theme.radius}
            onComplete={clear}
          />
        )}
      </View>
    </View>
  );
}

function LineItem({
  line,
  disabled,
  onChange,
}: {
  line: CartLine;
  disabled: boolean;
  onChange: (quantity: number) => void;
}) {
  const { merchandise } = line;
  const label = variantLabel(merchandise.title);

  return (
    <View style={styles.line}>
      <Image source={merchandise.image?.url} style={styles.lineImage} contentFit="cover" />
      <View style={styles.lineBody}>
        <Text style={styles.lineTitle} numberOfLines={2}>
          {merchandise.product.title}
        </Text>
        {label && <Text style={styles.muted}>{label}</Text>}
        <View style={styles.lineFooter}>
          <View style={styles.stepper}>
            <StepButton label="−" disabled={disabled} onPress={() => onChange(line.quantity - 1)} />
            <Text style={styles.quantity}>{line.quantity}</Text>
            <StepButton label="+" disabled={disabled} onPress={() => onChange(line.quantity + 1)} />
          </View>
          <Text style={styles.linePrice}>{formatMoney(line.cost.totalAmount)}</Text>
        </View>
      </View>
    </View>
  );
}

function StepButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={styles.stepButton}>
      <Text style={[styles.stepLabel, disabled && { color: theme.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 16 },
  heading: { fontSize: 32, fontWeight: '700', color: theme.text },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 24,
    backgroundColor: theme.background,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: theme.text },
  muted: { fontSize: 13, color: theme.textMuted },
  line: { flexDirection: 'row', gap: 12 },
  lineImage: { width: 88, height: 110, borderRadius: theme.radius, backgroundColor: theme.surface },
  lineBody: { flex: 1, gap: 4 },
  lineTitle: { fontSize: 15, fontWeight: '500', color: theme.text },
  lineFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
  },
  stepButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 18, color: theme.text },
  quantity: { minWidth: 24, textAlign: 'center', fontSize: 15, color: theme.text },
  linePrice: { fontSize: 15, fontWeight: '500', color: theme.text },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, color: theme.text },
  totalValue: { fontSize: 16, fontWeight: '600', color: theme.text },
});
