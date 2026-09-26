import AsyncStorage from '@react-native-async-storage/async-storage';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { brandKey } from '@/brand';
import { addCartLines, createCart, getCart, removeCartLines, updateCartLines } from '@/shopify/cart';
import type { Cart } from '@/shopify/types';

const STORAGE_KEY = `storeshell:${brandKey}:cartId`;

type CartContext = {
  cart: Cart | null;
  busy: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
};

const Context = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const checkout = useShopifyCheckoutSheet();
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(false);

  const save = useCallback(async (next: Cart | null) => {
    setCart(next);
    if (next) await AsyncStorage.setItem(STORAGE_KEY, next.id);
    else await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const clear = useCallback(() => save(null), [save]);

  // Restore the cart from the previous session. Shopify expires carts, so a
  // stale ID simply returns null and we start fresh.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((id) => (id ? getCart(id) : null))
      .then(save)
      .catch(() => save(null));
  }, [save]);

  // An order placed in the checkout sheet means this cart is done.
  useEffect(() => {
    const sub = checkout.addEventListener('completed', () => {
      clear();
    });
    return () => sub?.remove();
  }, [checkout, clear]);

  const run = useCallback(
    async (fn: () => Promise<Cart>) => {
      setBusy(true);
      try {
        await save(await fn());
        checkout.invalidate();
      } finally {
        setBusy(false);
      }
    },
    [checkout, save],
  );

  const addItem = useCallback(
    (variantId: string, quantity = 1) => {
      const lines = [{ merchandiseId: variantId, quantity }];
      return run(() => (cart ? addCartLines(cart.id, lines) : createCart(lines)));
    },
    [cart, run],
  );

  const setLineQuantity = useCallback(
    (lineId: string, quantity: number) => {
      if (!cart) return Promise.resolve();
      return run(() =>
        quantity > 0
          ? updateCartLines(cart.id, [{ id: lineId, quantity }])
          : removeCartLines(cart.id, [lineId]),
      );
    },
    [cart, run],
  );

  return (
    <Context.Provider value={{ cart, busy, addItem, setLineQuantity, clear }}>
      {children}
    </Context.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
