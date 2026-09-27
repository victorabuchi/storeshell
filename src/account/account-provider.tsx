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

export type Customer = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string } | null;
  creationDate: string;
};

type AccountContext = {
  // False until the brand config has a customerAccountClientId and shopId.
  available: boolean;
  customer: Customer | null;
  signingIn: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const { shopId, customerAccountClientId: clientId = '', storeDomain } = brand.shopify;
const available = Boolean(clientId && shopId);
const storeUrl = `https://${storeDomain}`;
const redirectUri = `shop.${shopId}.app://callback`;
const TOKEN_KEY = `${brandKey}.customer-token`;
// Stands in for the store's discovery document until sign-in is configured.
const NO_DISCOVERY: DiscoveryDocument = {};

const CUSTOMER_QUERY = `query { customer { firstName lastName emailAddress { emailAddress } creationDate } }`;

async function customerApiUrl() {
  const res = await fetch(`${storeUrl}/.well-known/customer-account-api`);
  const { graphql_api } = (await res.json()) as { graphql_api: string };
  return graphql_api;
}

async function fetchCustomer(accessToken: string): Promise<Customer> {
  const res = await fetch(await customerApiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: accessToken },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
  });
  if (!res.ok) throw new Error(`Customer Account API ${res.status}`);
  const json = (await res.json()) as { data?: { customer: Customer } };
  if (!json.data) throw new Error('Customer Account API returned no data');
  return json.data.customer;
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

  const value = useMemo(
    () => ({ available, customer, signingIn, signIn, signOut }),
    [customer, signingIn, signIn, signOut],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAccount() {
  const context = useContext(Context);
  if (!context) throw new Error('useAccount must be used inside AccountProvider');
  return context;
}
