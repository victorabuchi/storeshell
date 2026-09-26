import { storefrontEndpoint, storefrontToken } from '@/brand';

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (storefrontToken) {
    headers['X-Shopify-Storefront-Access-Token'] = storefrontToken;
  }

  const res = await fetch(storefrontEndpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Storefront API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('\n'));
  }
  return json.data as T;
}

// Mutations report business errors (sold out, invalid quantity) as userErrors
// rather than GraphQL errors.
export function assertNoUserErrors(userErrors: { message: string }[]) {
  if (userErrors.length) {
    throw new Error(userErrors.map((e) => e.message).join('\n'));
  }
}
