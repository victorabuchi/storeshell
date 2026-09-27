import { storefront } from './client';
import type { Product, ProductSummary } from './types';

const IMAGE = `url altText width height`;
const MONEY = `amount currencyCode`;

const PRODUCT_SUMMARY = `
  id
  handle
  title
  featuredImage { ${IMAGE} }
  priceRange { minVariantPrice { ${MONEY} } }
  compareAtPriceRange { minVariantPrice { ${MONEY} } }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $sortKey: ProductSortKeys!) {
    products(first: $first, sortKey: $sortKey) {
      nodes { ${PRODUCT_SUMMARY} }
    }
  }
`;

const SEARCH_QUERY = `
  query Search($query: String!, $first: Int!) {
    products(first: $first, query: $query, sortKey: RELEVANCE) {
      nodes { ${PRODUCT_SUMMARY} }
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

export async function getProducts(
  first = 24,
  sortKey: 'BEST_SELLING' | 'CREATED_AT' = 'BEST_SELLING',
): Promise<ProductSummary[]> {
  const data = await storefront<{ products: { nodes: ProductSummary[] } }>(PRODUCTS_QUERY, {
    first,
    sortKey,
  });
  return data.products.nodes;
}

export async function searchProducts(query: string, first = 24): Promise<ProductSummary[]> {
  const data = await storefront<{ products: { nodes: ProductSummary[] } }>(SEARCH_QUERY, {
    query,
    first,
  });
  return data.products.nodes;
}

export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefront<{ product: Product | null }>(PRODUCT_QUERY, { handle });
  return data.product;
}
