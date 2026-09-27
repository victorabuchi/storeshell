import fs from 'node:fs';
import path from 'node:path';
import type { ConfigContext, ExpoConfig } from 'expo/config';

import type { BrandConfig, BrandExtra } from './src/brand/types';

// The active brand comes from the BRAND env var (set by scripts/brand.js).
const brandKey = process.env.BRAND ?? 'frozenholm';
const brandDir = path.join(__dirname, 'brands', brandKey);

if (!fs.existsSync(path.join(brandDir, 'config.json'))) {
  throw new Error(`Unknown brand "${brandKey}": brands/${brandKey}/config.json not found`);
}

const brand: BrandConfig = JSON.parse(
  fs.readFileSync(path.join(brandDir, 'config.json'), 'utf8'),
);
const asset = (file: string) => `./brands/${brandKey}/${file}`;

// Per-brand secret, e.g. FROZENHOLM_STOREFRONT_TOKEN in .env.local
const storefrontToken =
  process.env[`${brandKey.toUpperCase().replace(/-/g, '_')}_STOREFRONT_TOKEN`] ?? '';

export default ({ config }: ConfigContext): ExpoConfig => {
  const extra: BrandExtra = { brandKey, brand, storefrontToken };

  return {
    ...config,
    name: brand.name,
    slug: brand.slug,
    scheme: brand.scheme,
    version: brand.version,
    orientation: 'portrait',
    icon: asset('icon.png'),
    userInterfaceStyle: 'light',
    ios: {
      bundleIdentifier: brand.ios.bundleIdentifier,
      appleTeamId: brand.ios.appleTeamId,
      supportsTablet: false,
      entitlements: brand.ios.appleMerchantId
        ? { 'com.apple.developer.in-app-payments': [brand.ios.appleMerchantId] }
        : undefined,
    },
    android: {
      package: brand.android.package,
      adaptiveIcon: {
        foregroundImage: asset('icon.png'),
        backgroundColor: brand.theme.background,
      },
    },
    web: {
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: brand.theme.background,
          image: asset('splash.png'),
          imageWidth: 120,
        },
      ],
      './plugins/withXcodeRecommendedSettings',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra,
  };
};
