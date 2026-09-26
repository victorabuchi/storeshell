# Celestic

One Expo codebase that builds a separate native storefront app per Shopify brand.

- **Shared (built once):** screens in `src/app`, Storefront API client in `src/shopify`, cart in `src/cart`, checkout in `src/checkout`.
- **Per brand:** `brands/<brand>/config.json` + `icon.png` + `splash.png`, and a Storefront token in `.env.local`.
- **Checkout:** [Shopify Checkout Kit](https://github.com/Shopify/checkout-sheet-kit-react-native). Native Apple Pay buttons on product + bag, and a native checkout sheet (cards, Shop Pay, Apple Pay) in the brand's colors. Orders land in the brand's Shopify admin.

## Commands

`<brand>` is a folder in `brands/` and defaults to `frozenholm`.

| Command | What it does |
| --- | --- |
| `npm run ios -- <brand>` | Builds the brand's app and runs it on the iOS simulator |
| `npm run ios -- <brand> --device` | Same, on a connected iPhone |
| `npm run android -- <brand>` | Same for Android |
| `npm run dev -- <brand>` | Starts the dev server for an already-installed build |
| `npm run brand:check -- <brand>` | Validates the brand's config, assets and token |
| `npm run brand:new -- <brand>` | Scaffolds a new brand folder |
| `npm run typecheck` | TypeScript check |

The app uses native modules, so it runs in a development build, not Expo Go. `ios/` and `android/` are generated and git-ignored. `npm run ios` regenerates them when you switch brands.

## Adding a brand

1. `npm run brand:new -- acme`
2. Edit `brands/acme/config.json`: name, bundle ID, Apple team ID, store domain, colors.
3. Replace `icon.png` (1024×1024) and `splash.png`.
4. Add `ACME_STOREFRONT_TOKEN=...` to `.env.local`. Get the token from the Headless channel in the brand's Shopify admin.
5. `npm run ios -- acme`

The `demo` brand points at Shopify's public mock store and needs no token.

## Apple Pay setup (per brand)

The buttons appear only when all of these are in place:

1. A merchant ID (e.g. `merchant.com.frozenholm.app`) in the brand's Apple developer account, set as `ios.appleMerchantId`.
2. An Apple Pay payment processing certificate created through Shopify ([guide](https://shopify.dev/docs/storefronts/mobile/create-apple-payment-processing-certificates)).
3. The `write_cart_wallet_payments` scope on the Storefront token.
4. A real device or simulator with Apple Pay set up.
