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
};

// What app.config.ts exposes to the running app via Constants.expoConfig.extra.
export type BrandExtra = {
  brandKey: string;
  brand: BrandConfig;
  storefrontToken: string;
  // brands/<brand>/logo.svg, drawn with fill="currentColor"
  logoSvg: string;
};

// Result of require('./images/x.jpg')
type ImageAsset = number;

export type ChoiceOption = { id: string; label: string; image?: ImageAsset };

// Shape of brands/<brand>/content.ts: photos, copy and onboarding choices.
// Loaded through the @brand-content alias (metro.config.js).
export type BrandContent = {
  tagline: string;
  welcome: { image: ImageAsset; headline: string };
  hero: { image: ImageAsset; eyebrow: string; title: string; subtitle: string; cta: string };
  onboarding: {
    intro: { title: string; images: ImageAsset[] };
    shopFor: { title: string; options: ChoiceOption[] };
    activities: { title: string; options: ChoiceOption[] };
    size: { title: string; options: string[] };
    notifications: { title: string; body: string };
  };
};
