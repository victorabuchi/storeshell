import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { brand, content, theme } from '@/brand';
import { BrandMark } from '@/components/brand-mark';
import { Button } from '@/components/button';
import { useStatusBar } from '@/lib/use-status-bar';
import { usePreferences } from '@/preferences/preferences-provider';

const labels = (ids: string[], options: { id: string; label: string }[]) =>
  options.filter((o) => ids.includes(o.id)).map((o) => o.label).join(', ') || 'Not set';

export default function ProfileScreen() {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const account = useAccount();
  const { preferences } = usePreferences();
  const { customer } = account;

  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
  const initials = (customer?.firstName?.[0] ?? '') + (customer?.lastName?.[0] ?? '');

  const signIn = () =>
    account.signIn().catch((e: Error) => Alert.alert('Could not sign in', e.message));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 120 }]}>
      {customer ? (
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials.toUpperCase() || '·'}</Text>
          </View>
          <Text style={styles.name}>{name || customer.emailAddress?.emailAddress}</Text>
          {name ? <Text style={styles.muted}>{customer.emailAddress?.emailAddress}</Text> : null}
          <Text style={styles.muted}>Member since {new Date(customer.creationDate).getFullYear()}</Text>
        </View>
      ) : (
        <View style={styles.header}>
          <BrandMark size={64} color={theme.text} />
          <Text style={styles.name}>Become a {brand.name} Member</Text>
          <Text style={[styles.muted, styles.center]}>{content.tagline}</Text>
          {account.available && (
            <View style={styles.signIn}>
              <Button title="Join Us or Sign In" onPress={signIn} loading={account.signingIn} />
            </View>
          )}
        </View>
      )}

      <View style={styles.card}>
        <Row label="Shopping for" value={labels(preferences.shopFor, content.onboarding.shopFor.options)} />
        <Row label="Activities" value={labels(preferences.activities, content.onboarding.activities.options)} />
        <Row label="Size" value={preferences.size ?? 'Not set'} last />
      </View>
      <Button title="Edit preferences" variant="secondary" onPress={() => router.push('/onboarding')} />

      {customer && (
        <Pressable accessibilityRole="button" onPress={account.signOut} style={styles.signOut}>
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  content: { paddingHorizontal: 20, gap: 20 },
  header: { alignItems: 'center', gap: 8, paddingBottom: 12 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  initials: { color: theme.onPrimary, fontSize: 30, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', color: theme.text, marginTop: 8, textAlign: 'center' },
  muted: { fontSize: 15, color: theme.textMuted },
  center: { textAlign: 'center' },
  signIn: { alignSelf: 'stretch', marginTop: 16 },
  card: { borderRadius: theme.radius, backgroundColor: theme.surface, paddingHorizontal: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, gap: 16 },
  rowDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  rowLabel: { fontSize: 15, color: theme.textMuted },
  rowValue: { flex: 1, fontSize: 15, fontWeight: '500', color: theme.text, textAlign: 'right' },
  signOut: { alignItems: 'center', paddingVertical: 12 },
  signOutLabel: { fontSize: 16, color: theme.textMuted, fontWeight: '500' },
});
