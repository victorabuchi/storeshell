import { ShopifyCheckoutSheetProvider } from '@shopify/checkout-sheet-kit';
import { DefaultTheme, SplashScreen, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AccountProvider } from '@/account/account-provider';
import { theme } from '@/brand';
import { CartProvider } from '@/cart/cart-provider';
import { checkoutConfig } from '@/checkout/config';
import { FavouritesProvider } from '@/favourites/favourites-provider';
import { PreferencesProvider, usePreferences } from '@/preferences/preferences-provider';

SplashScreen.preventAutoHideAsync();

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

const backOnly = { headerBackButtonDisplayMode: 'minimal' } as const;

function RootNavigator() {
  const { ready, preferences } = usePreferences();

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerTintColor: theme.text, headerShadowVisible: false }}>
      <Stack.Protected guard={preferences.onboarded}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[handle]"
          options={{ title: '', headerBackButtonDisplayMode: 'minimal', headerTransparent: true }}
        />
        <Stack.Screen name="settings" options={{ title: 'Settings', ...backOnly }} />
        <Stack.Screen name="orders" options={{ title: 'Orders', ...backOnly }} />
        <Stack.Screen name="favourites" options={{ title: 'Favourites', ...backOnly }} />
        <Stack.Screen name="addresses" options={{ title: 'Delivery Information', ...backOnly }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile', ...backOnly }} />
      </Stack.Protected>
      <Stack.Protected guard={!preferences.onboarded}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Also opened from Profile to edit preferences. */}
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ShopifyCheckoutSheetProvider configuration={checkoutConfig}>
      <PreferencesProvider>
        <AccountProvider>
          <CartProvider>
            <FavouritesProvider>
              <ThemeProvider value={navigationTheme}>
                <StatusBar style="dark" />
                <RootNavigator />
              </ThemeProvider>
            </FavouritesProvider>
          </CartProvider>
        </AccountProvider>
      </PreferencesProvider>
    </ShopifyCheckoutSheetProvider>
  );
}
