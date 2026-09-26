import { ShopifyCheckoutSheetProvider } from '@shopify/checkout-sheet-kit';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/brand';
import { CartProvider } from '@/cart/cart-provider';
import { checkoutConfig } from '@/checkout/config';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.primary,
    background: theme.background,
    card: theme.background,
    text: theme.text,
    border: theme.border,
  },
};

export default function RootLayout() {
  return (
    <ShopifyCheckoutSheetProvider configuration={checkoutConfig}>
      <CartProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerTintColor: theme.text, headerShadowVisible: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="product/[handle]"
              options={{ title: '', headerBackButtonDisplayMode: 'minimal', headerTransparent: true }}
            />
          </Stack>
        </ThemeProvider>
      </CartProvider>
    </ShopifyCheckoutSheetProvider>
  );
}
