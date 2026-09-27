import Constants from 'expo-constants';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { brand, theme } from '@/brand';
import { ListGroup, ListRow } from '@/components/list-row';
import { useAsync } from '@/lib/use-async';
import { getShopInfo } from '@/shopify/shop';

const open = (url: string) => WebBrowser.openBrowserAsync(url);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { customer, signOut } = useAccount();
  const shop = useAsync(getShopInfo, 'shop-info').data;
  const storeUrl = shop?.primaryDomain.url ?? `https://${brand.shopify.storeDomain}`;

  // Shopify has no self-service account deletion, so the request goes to the store,
  // which erases the customer from Shopify admin (Customers → Erase personal data).
  const deleteAccount = () =>
    Alert.alert(
      'Delete account',
      `We'll open ${brand.name}'s contact page. Ask for your account and personal data to be deleted, and we'll confirm by email.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: () => open(`${storeUrl}/pages/contact`) },
      ],
    );

  const logOut = () =>
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.back();
        },
      },
    ]);

  const policies = [shop?.shippingPolicy, shop?.refundPolicy, shop?.termsOfService, shop?.privacyPolicy].filter(
    (p) => p != null,
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      {customer && (
        <>
          <ListGroup>
            <ListRow label="Email" value={customer.emailAddress?.emailAddress ?? 'Not added'} />
            <ListRow label="Mobile Number" value={customer.phoneNumber?.phoneNumber ?? 'Not added'} />
            <ListRow label="Name" onPress={() => router.push('/edit-profile')} />
          </ListGroup>
          <Gap />
          <ListGroup>
            <ListRow label="Delivery Information" onPress={() => router.push('/addresses')} />
            <ListRow label="Orders" onPress={() => router.push('/orders')} />
          </ListGroup>
          <Gap />
        </>
      )}

      <ListGroup>
        <ListRow label="Shopping Preferences" onPress={() => router.push('/onboarding')} />
        <ListRow label="Notifications" onPress={() => Linking.openSettings()} />
      </ListGroup>
      <Gap />

      <ListGroup>
        <ListRow label="Get Help" onPress={() => open(`${storeUrl}/pages/contact`)} />
        <ListRow label="FAQ" onPress={() => open(`${storeUrl}/pages/faq`)} />
      </ListGroup>
      <Gap />

      <ListGroup>
        <ListRow label="About this version" value={Constants.expoConfig?.version} />
        {policies.map((policy) => (
          <ListRow key={policy.url} label={policy.title} onPress={() => open(policy.url)} />
        ))}
      </ListGroup>

      {customer && (
        <>
          <Gap />
          <ListGroup>
            <ListRow label="Delete Account" onPress={deleteAccount} />
          </ListGroup>
          <Gap />
          <ListGroup>
            <ListRow label="Log Out" onPress={logOut} destructive />
          </ListGroup>
        </>
      )}
    </ScrollView>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  gap: { height: 40, backgroundColor: theme.surface },
});
