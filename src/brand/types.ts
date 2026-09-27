// Shape of brands/<brand>/config.json. Validated by scripts/brand.js.
export type BrandConfig = {
  name: string;
  slug: string;
  scheme: string;
  version: string;
  ios: {
    bundleIdentifier: string;
    // Apple developer team that signs the app (the brand's own account).
    appleTeamId?: string;
    // Enables native Apple Pay buttons. Must match the merchant ID registered
    // in the brand's Apple developer account and connected to Shopify.
    appleMerchantId?: string;
  };
  android: {
    package: string;
  };
  shopify: {
    storeDomain: string;
    apiVersion: string;
    // Overrides the default https://<storeDomain>/api/<apiVersion>/graphql.json
    endpoint?: string;
    // Numeric shop ID. Customer account sign-in redirects to shop.<shopId>.app://callback
    shopId?: string;
    // Public client ID from Headless channel → Customer Account API. Sign-in is
    // hidden until it's set.
    customerAccountClientId?: string;
  };
  theme: {
    primary: string;
    onPrimary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    radius: number;
  };
  copy: {
    homeTitle: string;
    homeSubtitle: string;
  };
  // Display font for headings, buttons and labels. `files` are embedded at build
  // time (paths relative to the brand folder); `display` is the font's family name.
  support?: {
    // Public page explaining how to delete an account (Google Play requires one).
    // Defaults to the store's /pages/contact.
    accountDeletionUrl?: string;
  };
  // The brand's EAS project (builds, submissions and over-the-air updates).
  eas?: {
    owner: string;
    projectId: string;
  };
  fonts?: {
    display: string;
    // Native UIKit views (tab bar) look fonts up by PostScript name instead.
    postScriptName: string;
    files: string[];
  };
};

// What app.config.ts exposes to the running app via Constants.expoConfig.extra.
export type BrandExtra = {
  brandKey: string;
  brand: BrandConfig;
  storefrontToken: string;
};

// Result of require('./images/x.jpg')
type ImageAsset = number;

export type ChoiceOption = { id: string; label: string; image?: ImageAsset };

// Shape of brands/<brand>/content.ts: photos, copy and onboarding choices.
// Loaded through the @brand-content alias (metro.config.js).
export type BrandContent = {
  // The brand's own logo file (transparent PNG, tinted in the app). Without it
  // the brand name is shown as text.
  logo?: ImageAsset;
  // Width ÷ height of the logo, used to size it.
  logoAspectRatio?: number;
  tagline: string;
  welcome: { image: ImageAsset; headline: string };
  hero: { image: ImageAsset; eyebrow: string; title: string; subtitle?: string; cta: string };
  onboarding: {
    intro: { title: string; images: ImageAsset[] };
    shopFor: { title: string; options: ChoiceOption[] };
    activities: { title: string; options: ChoiceOption[] };
    size: { title: string; options: string[] };
    notifications: { title: string; body: string };
  };
};
