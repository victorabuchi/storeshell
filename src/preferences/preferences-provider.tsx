import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { brandKey } from '@/brand';

export type Preferences = {
  onboarded: boolean;
  shopFor: string[];
  activities: string[];
  size?: string;
  // Profile photo chosen on this device (file in the app's document directory).
  avatarUri?: string;
};

const EMPTY: Preferences = { onboarded: false, shopFor: [], activities: [] };
const STORAGE_KEY = `${brandKey}:preferences`;

type PreferencesContext = {
  ready: boolean;
  preferences: Preferences;
  update: (changes: Partial<Preferences>) => void;
};

const Context = createContext<PreferencesContext | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setPreferences({ ...EMPTY, ...JSON.parse(stored) }))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((changes: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...changes };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ ready, preferences, update }), [ready, preferences, update]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePreferences() {
  const context = useContext(Context);
  if (!context) throw new Error('usePreferences must be used inside PreferencesProvider');
  return context;
}
