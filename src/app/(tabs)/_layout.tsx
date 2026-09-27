import { NativeTabs, type MaterialIcon, type SFSymbolIcon } from 'expo-router/unstable-native-tabs';

import { content, theme } from '@/brand';
import { useCart } from '@/cart/cart-provider';

const shopIcon = content.shopIcon ?? { sf: 'bag', md: 'storefront' };

export default function TabsLayout() {
  const { cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <NativeTabs
      tintColor={theme.primary}
      badgeBackgroundColor={theme.primary}
      labelStyle={{ selected: { color: theme.primary } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={shopIcon.sf as SFSymbolIcon['sf']} md={shopIcon.md as MaterialIcon['md']} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Bag</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        <NativeTabs.Trigger.Badge hidden={count === 0}>{String(count)}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>

      {/* role="search" puts Search in its own button beside the tab bar on iOS 26+. */}
      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
