import { assertNoUserErrors, storefront } from './client';
import type { Cart } from './types';

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          image { url altText width height }
          price { amount currencyCode }
          product { title handle }
        }
      }
    }
  }
`;

type MutationResult = { cart: Cart | null; userErrors: { message: string }[] };

async function mutate(name: string, query: string, variables: Record<string, unknown>) {
  const data = await storefront<Record<string, MutationResult>>(query, variables);
  const result = data[name];
  assertNoUserErrors(result.userErrors);
  if (!result.cart) throw new Error(`${name} returned no cart`);
  return result.cart;
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: Cart | null }>(
    `query Cart($cartId: ID!) { cart(id: $cartId) { ${CART_FIELDS} } }`,
    { cartId },
  );
  return data.cart;
}

export function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  return mutate(
    'cartCreate',
    `mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) { cart { ${CART_FIELDS} } userErrors { message } }
    }`,
    { lines },
  );
}

export function addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  return mutate(
    'cartLinesAdd',
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
    }`,
    { cartId, lines },
  );
}

export function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  return mutate(
    'cartLinesUpdate',
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ${CART_FIELDS} } userErrors { message } }
    }`,
    { cartId, lines },
  );
}

export function removeCartLines(cartId: string, lineIds: string[]) {
  return mutate(
    'cartLinesRemove',
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ${CART_FIELDS} } userErrors { message } }
    }`,
    { cartId, lineIds },
  );
}
