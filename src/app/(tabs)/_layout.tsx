import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { PlatformColor } from 'react-native';

import { brand, theme } from '@/brand';
import { useCart } from '@/cart/cart-provider';

const label = { fontFamily: brand.fonts?.postScriptName, fontSize: 12 };
// The glass tab bar turns dark over photos, so selection follows the system label
// colour (white on dark, black on light) instead of a fixed brand colour.
const selectedColor = PlatformColor('label');

export default function TabsLayout() {
  const { cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <NativeTabs
      tintColor={selectedColor}
      badgeBackgroundColor={theme.primary}
      labelStyle={{ default: label, selected: { ...label, color: selectedColor } }}>
      {/* Home's hero photo runs under the status bar, so it handles insets itself. */}
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/icons/tab-home.png')}
          renderingMode="template"
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
        {/* Material Symbols "storefront" (Google Fonts, Apache 2.0) */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/icons/tab-shop.png')}
          renderingMode="template"
          md="storefront"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Bag</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        {count > 0 && <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge>}
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
