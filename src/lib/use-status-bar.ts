import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle, type StatusBarStyle } from 'expo-status-bar';
import { useCallback } from 'react';

// Tabs stay mounted, so each screen sets the status bar style when it gains focus.
export function useStatusBar(style: StatusBarStyle) {
  useFocusEffect(useCallback(() => setStatusBarStyle(style, true), [style]));
}
