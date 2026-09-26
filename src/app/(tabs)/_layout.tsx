import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { theme } from '@/brand';
import { useCart } from '@/cart/cart-provider';

export default function TabsLayout() {
  const { cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <NativeTabs
      backgroundColor={theme.background}
      tintColor={theme.primary}
      badgeBackgroundColor={theme.primary}
      labelStyle={{ selected: { color: theme.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Bag</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        <NativeTabs.Trigger.Badge hidden={count === 0}>{String(count)}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
