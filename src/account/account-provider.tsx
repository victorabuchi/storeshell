import {
  exchangeCodeAsync,
  refreshAsync,
  TokenResponse,
  useAuthRequest,
  useAutoDiscovery,
  type DiscoveryDocument,
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { brand, brandKey } from '@/brand';

// Shopify Customer Account API, public (mobile) client with PKCE.
// https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api

export type Address = { id: string; formatted: string[] };

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string } | null;
  phoneNumber: { phoneNumber: string } | null;
  creationDate: string;
  defaultAddress: { id: string } | null;
  addresses: { nodes: Address[] };
};

export type Order = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string;
  statusPageUrl: string;
  totalPrice: { amount: string; currencyCode: string };
  lineItems: { nodes: { title: string; quantity: number; image: { url: string } | null }[] };
};

type AccountContext = {
  // False until the brand config has a customerAccountClientId and shopId.
  available: boolean;
  customer: Customer | null;
  signingIn: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  updateName: (firstName: string, lastName: string) => Promise<void>;
  getOrders: () => Promise<Order[]>;
};

const { shopId, customerAccountClientId: clientId = '', storeDomain } = brand.shopify;
const available = Boolean(clientId && shopId);
const storeUrl = `https://${storeDomain}`;
const redirectUri = `shop.${shopId}.app://callback`;
const TOKEN_KEY = `${brandKey}.customer-token`;
// Stands in for the store's discovery document until sign-in is configured.
const NO_DISCOVERY: DiscoveryDocument = {};

const CUSTOMER_FIELDS = `
  id firstName lastName creationDate
  emailAddress { emailAddress }
  phoneNumber { phoneNumber }
  defaultAddress { id }
  addresses(first: 10) { nodes { id formatted(withName: true) } }
`;
const CUSTOMER_QUERY = `query { customer { ${CUSTOMER_FIELDS} } }`;
const UPDATE_NAME = `
  mutation UpdateName($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer { ${CUSTOMER_FIELDS} }
      userErrors { message }
    }
  }
`;
// Order IDs grow over time, so reverse ID order lists the newest first.
const ORDERS_QUERY = `
  query {
    customer {
      orders(first: 25, reverse: true) {
        nodes {
          id name processedAt financialStatus fulfillmentStatus statusPageUrl
          totalPrice { amount currencyCode }
          lineItems(first: 4) { nodes { title quantity image { url } } }
        }
      }
    }
  }
`;

async function customerApiUrl() {
  const res = await fetch(`${storeUrl}/.well-known/customer-account-api`);
  const { graphql_api } = (await res.json()) as { graphql_api: string };
  return graphql_api;
}

async function customerApi<T>(accessToken: string, query: string, variables: object = {}): Promise<T> {
  const res = await fetch(await customerApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: accessToken },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Customer Account API ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('\n'));
  if (!json.data) throw new Error('Customer Account API returned no data');
  return json.data;
}

async function fetchCustomer(accessToken: string): Promise<Customer> {
  return (await customerApi<{ customer: Customer }>(accessToken, CUSTOMER_QUERY)).customer;
}

async function saveToken(token: TokenResponse | null) {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(token.getRequestConfig()));
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function loadToken() {
  const stored = await SecureStore.getItemAsync(TOKEN_KEY);
  return stored ? new TokenResponse(JSON.parse(stored)) : null;
}

const Context = createContext<AccountContext | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const discovery = useAutoDiscovery(available ? storeUrl : NO_DISCOVERY);
  const [request, , promptAsync] = useAuthRequest(
    { clientId, redirectUri, scopes: ['openid', 'email', 'customer-account-api:full'], usePKCE: true },
    available ? discovery : null,
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const token = useRef<TokenResponse | null>(null);

  // Returns a fresh access token, refreshing it if it has expired.
  const accessToken = useCallback(
    async (doc: DiscoveryDocument) => {
      let current = token.current ?? (await loadToken());
      if (!current) return null;
      if (!current.shouldRefresh()) return current.accessToken;
      current = await refreshAsync({ clientId, refreshToken: current.refreshToken }, doc);
      token.current = current;
      await saveToken(current);
      return current.accessToken;
    },
    [],
  );

  // Restore a previous session.
  useEffect(() => {
    if (!available || !discovery) return;
    accessToken(discovery)
      .then((access) => (access ? fetchCustomer(access).then(setCustomer) : undefined))
      .catch(() => saveToken(null));
  }, [discovery, accessToken]);

  const signIn = useCallback(async () => {
    if (!request || !discovery) return false;
    setSigningIn(true);
    try {
      const result = await promptAsync();
      if (result.type !== 'success') return false;
      const next = await exchangeCodeAsync(
        {
          clientId,
          code: result.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier ?? '' },
        },
        discovery,
      );
      token.current = next;
      await saveToken(next);
      setCustomer(await fetchCustomer(next.accessToken));
      return true;
    } finally {
      setSigningIn(false);
    }
  }, [request, discovery, promptAsync]);

  const signOut = useCallback(async () => {
    const idToken = token.current?.idToken;
    token.current = null;
    setCustomer(null);
    await saveToken(null);
    // Mobile clients end the Shopify session with a plain request to the logout endpoint.
    if (idToken && discovery?.endSessionEndpoint) {
      await fetch(`${discovery.endSessionEndpoint}?id_token_hint=${encodeURIComponent(idToken)}`).catch(() => {});
    }
  }, [discovery]);

  const requireToken = useCallback(async () => {
    const access = discovery ? await accessToken(discovery) : null;
    if (!access) throw new Error('Please sign in again.');
    return access;
  }, [discovery, accessToken]);

  const updateName = useCallback(
    async (firstName: string, lastName: string) => {
      const data = await customerApi<{
        customerUpdate: { customer: Customer | null; userErrors: { message: string }[] };
      }>(await requireToken(), UPDATE_NAME, { input: { firstName, lastName } });
      const { customer: updated, userErrors } = data.customerUpdate;
      if (userErrors.length) throw new Error(userErrors.map((e) => e.message).join('\n'));
      if (updated) setCustomer(updated);
    },
    [requireToken],
  );

  const getOrders = useCallback(async () => {
    const data = await customerApi<{ customer: { orders: { nodes: Order[] } } }>(
      await requireToken(),
      ORDERS_QUERY,
    );
    return data.customer.orders.nodes;
  }, [requireToken]);

  const value = useMemo(
    () => ({ available, customer, signingIn, signIn, signOut, updateName, getOrders }),
    [customer, signingIn, signIn, signOut, updateName, getOrders],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAccount() {
  const context = useContext(Context);
  if (!context) throw new Error('useAccount must be used inside AccountProvider');
  return context;
}
