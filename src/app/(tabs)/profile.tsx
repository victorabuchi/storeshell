import { Paths, File } from 'expo-file-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { brand, content, displayFont, theme } from '@/brand';
import { BrandMark } from '@/components/brand-mark';
import { ListRow } from '@/components/list-row';
import { PillButton } from '@/components/pill-button';
import { useStatusBar } from '@/lib/use-status-bar';
import { usePreferences } from '@/preferences/preferences-provider';

const storeUrl = `https://${brand.shopify.storeDomain}`;

export default function ProfileScreen() {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const account = useAccount();
  const { preferences, update } = usePreferences();
  const { customer } = account;

  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
  const categories = content.onboarding.categories.options
    .filter((o) => preferences.categories.includes(o.id))
    .map((o) => o.label);

  const signIn = () => account.signIn().catch((e: Error) => Alert.alert('Could not sign in', e.message));

  // Orders need an account; everything else works signed out.
  const openOrders = () => (customer ? router.push('/orders') : signIn());

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    // The picker's file lives in a cache that iOS can clear, so keep a copy.
    const saved = new File(Paths.document, `avatar-${Date.now()}.jpg`);
    new File(result.assets[0].uri).copy(saved);
    if (preferences.avatarUri) new File(preferences.avatarUri).delete();
    update({ avatarUri: saved.uri });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 100 }}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={pickAvatar}>
          {preferences.avatarUri ? (
            <Image source={preferences.avatarUri} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={styles.avatar}>
              <SymbolView name="camera" size={40} tintColor="#FFFFFF" />
            </View>
          )}
        </Pressable>

        {customer ? (
          <>
            <Text style={styles.name}>{name || customer.emailAddress?.emailAddress}</Text>
            <OutlineButton title="Edit Profile" onPress={() => router.push('/edit-profile')} />
          </>
        ) : (
          <>
            <BrandMark height={22} color={theme.text} />
            <Text style={styles.pitch}>{content.tagline}</Text>
            {account.available && (
              <PillButton
                title="Join Us or Sign In"
                variant="dark"
                onPress={signIn}
                loading={account.signingIn}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.actions}>
        <QuickAction icon="receipt" label="Orders" onPress={openOrders} />
        <QuickAction icon="heart" label="Favourites" onPress={() => router.push('/favourites')} />
        <QuickAction icon="slider.horizontal.3" label="Preferences" onPress={() => router.push('/onboarding')} />
        <QuickAction icon="gearshape" label="Settings" onPress={() => router.push('/settings')} last />
      </View>

      <View style={styles.list}>
        <ListRow
          large
          label="Your preferences"
          value={[preferences.size && `Size ${preferences.size}`, ...categories].filter(Boolean).join(' · ') || 'Not set'}
          onPress={() => router.push('/onboarding')}
        />
        {customer && (
          <ListRow
            large
            label="Delivery addresses"
            value={`${customer.addresses.nodes.length} saved`}
            onPress={() => router.push('/addresses')}
          />
        )}
        <ListRow
          large
          label="Get help"
          value={`Contact ${brand.name}`}
          onPress={() => WebBrowser.openBrowserAsync(`${storeUrl}/pages/contact`)}
        />
      </View>

      {customer && (
        <View style={styles.memberSince}>
          <Text style={styles.memberSinceText}>
            Member Since{' '}
            {new Date(customer.creationDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function OutlineButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.outline, pressed && { opacity: 0.6 }]}>
      <Text style={styles.outlineLabel}>{title}</Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  last,
}: {
  icon: SFSymbol;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.action, !last && styles.actionDivider, pressed && { opacity: 0.5 }]}>
      <SymbolView name={icon} size={24} tintColor={theme.text} />
      <Text style={styles.actionLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  header: { alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...displayFont, fontSize: 34, letterSpacing: 0.5, color: theme.text },
  pitch: { fontSize: 16, color: theme.textMuted, textAlign: 'center' },
  outline: {
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineLabel: { ...displayFont, fontSize: 17, letterSpacing: 1, color: theme.text },

  actions: { flexDirection: 'row', marginTop: 36, marginBottom: 24, paddingHorizontal: 12 },
  action: { flex: 1, alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4 },
  actionDivider: { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: theme.border },
  actionLabel: { ...displayFont, fontSize: 15, letterSpacing: 1, color: theme.text },

  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
  memberSince: { marginTop: 32, paddingVertical: 20, backgroundColor: theme.surface, alignItems: 'center' },
  memberSinceText: { ...displayFont, fontSize: 15, letterSpacing: 2, color: theme.textMuted },
});
