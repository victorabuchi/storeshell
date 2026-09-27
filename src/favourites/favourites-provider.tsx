import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { brandKey } from '@/brand';
import type { ProductSummary } from '@/shopify/types';

// Favourites live on the device, so they work without an account.
const STORAGE_KEY = `${brandKey}:favourites`;

type FavouritesContext = {
  favourites: ProductSummary[];
  isFavourite: (id: string) => boolean;
  toggle: (product: ProductSummary) => void;
};

const Context = createContext<FavouritesContext | null>(null);

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<ProductSummary[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setFavourites(JSON.parse(stored)))
      .catch(() => {});
  }, []);

  const toggle = useCallback((product: ProductSummary) => {
    setFavourites((current) => {
      const next = current.some((p) => p.id === product.id)
        ? current.filter((p) => p.id !== product.id)
        : [product, ...current];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ favourites, toggle, isFavourite: (id: string) => favourites.some((p) => p.id === id) }),
    [favourites, toggle],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFavourites() {
  const context = useContext(Context);
  if (!context) throw new Error('useFavourites must be used inside FavouritesProvider');
  return context;
}
