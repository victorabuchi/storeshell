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
};
