import {
  AcceleratedCheckoutWallet,
  ApplePayContactField,
  ColorScheme,
  type Configuration,
} from '@shopify/checkout-sheet-kit';

import { brand, storefrontToken, theme } from '@/brand';

const merchantId = brand.ios.appleMerchantId;

// Apple Pay buttons need a merchant ID and a real storefront token with the
// write_cart_wallet_payments scope. Without them we fall back to the checkout sheet only.
export const applePayEnabled = Boolean(merchantId && storefrontToken);

export const walletButtons = [AcceleratedCheckoutWallet.applePay];

export const checkoutConfig: Configuration = {
  colorScheme: ColorScheme.light,
  title: 'Checkout',
  preloading: true,
  colors: {
    ios: {
      tintColor: theme.primary,
      backgroundColor: theme.background,
      closeButtonColor: theme.text,
    },
  },
  acceleratedCheckouts:
    applePayEnabled && merchantId
      ? {
          storefrontDomain: brand.shopify.storeDomain,
          storefrontAccessToken: storefrontToken,
          wallets: {
            applePay: {
              merchantIdentifier: merchantId,
              contactFields: [ApplePayContactField.email],
            },
          },
        }
      : undefined,
};
