import { storefront } from './client';

type Policy = { title: string; url: string } | null;

export type ShopInfo = {
  primaryDomain: { url: string };
  privacyPolicy: Policy;
  refundPolicy: Policy;
  shippingPolicy: Policy;
  termsOfService: Policy;
};

const SHOP_QUERY = `
  query {
    shop {
      primaryDomain { url }
      privacyPolicy { title url }
      refundPolicy { title url }
      shippingPolicy { title url }
      termsOfService { title url }
    }
  }
`;

export async function getShopInfo(): Promise<ShopInfo> {
  return (await storefront<{ shop: ShopInfo }>(SHOP_QUERY)).shop;
}
