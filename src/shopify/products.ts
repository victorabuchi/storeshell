import { storefront } from './client';
import type { Product, ProductSummary } from './types';

const IMAGE = `url altText width height`;
const MONEY = `amount currencyCode`;

const PRODUCTS_QUERY = `
  query Products($first: Int!) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes {
        id
        handle
        title
        featuredImage { ${IMAGE} }
        priceRange { minVariantPrice { ${MONEY} } }
        compareAtPriceRange { minVariantPrice { ${MONEY} } }
      }
    }
  }
`;

const PRODUCT_QUERY = `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      description
      images(first: 10) { nodes { ${IMAGE} } }
      options { name optionValues { name } }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          price { ${MONEY} }
          compareAtPrice { ${MONEY} }
          selectedOptions { name value }
          image { ${IMAGE} }
        }
      }
    }
  }
`;

export async function getProducts(first = 24): Promise<ProductSummary[]> {
  const data = await storefront<{ products: { nodes: ProductSummary[] } }>(PRODUCTS_QUERY, {
    first,
  });
  return data.products.nodes;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: Product | null }>(PRODUCT_QUERY, { handle });
  return data.product;
}
