import brandContent from '@brand-content';
import Constants from 'expo-constants';

import type { BrandExtra } from './types';

const extra = Constants.expoConfig?.extra as BrandExtra | undefined;

if (!extra?.brand) {
  throw new Error('Brand config missing from app config. Start the app with `npm run dev`.');
}

export const brandKey = extra.brandKey;
export const brand = extra.brand;
export const theme = extra.brand.theme;
export const storefrontToken = extra.storefrontToken;
export const content = brandContent;

export const storefrontEndpoint =
  brand.shopify.endpoint ??
  `https://${brand.shopify.storeDomain}/api/${brand.shopify.apiVersion}/graphql.json`;

export type { BrandConfig, BrandContent, ChoiceOption } from './types';
