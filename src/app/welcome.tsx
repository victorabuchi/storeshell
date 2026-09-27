import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAccount } from '@/account/account-provider';
import { content } from '@/brand';
import { BrandMark } from '@/components/brand-mark';
import { PillButton } from '@/components/pill-button';
import { Scrim } from '@/components/scrim';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const account = useAccount();

  const startOnboarding = () => router.push('/onboarding');

  const signIn = async () => {
    try {
      if (await account.signIn()) startOnboarding();
    } catch (e) {
      Alert.alert('Could not sign in', (e as Error).message);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={content.welcome.image}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="top"
      />
      <Scrim strength={0.92} />

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }]}>
        <BrandMark height={30} color="#FFFFFF" />
        <Text style={styles.headline}>{content.welcome.headline}</Text>

        {account.available ? (
          <View style={styles.actions}>
            <PillButton title="Join Us" onPress={signIn} loading={account.signingIn} />
            <PillButton title="Sign In" variant="outline" onPress={signIn} />
          </View>
        ) : (
          <View style={styles.actions}>
            <PillButton title="Get Started" onPress={startOnboarding} />
          </View>
        )}

        {account.available && (
          <Pressable accessibilityRole="button" onPress={startOnboarding} hitSlop={12}>
            <Text style={styles.guest}>Continue as guest</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  bottom: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, gap: 28 },
  headline: { color: '#FFFFFF', fontSize: 27, lineHeight: 33, fontWeight: '500', letterSpacing: -0.3 },
  actions: { flexDirection: 'row', gap: 14 },
  guest: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
});
