import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand, content, displayFont, theme, type ChoiceOption } from '@/brand';
import { BrandMark } from '@/components/brand-mark';
import { PillButton } from '@/components/pill-button';
import { ProductCard } from '@/components/product-card';
import { Scrim } from '@/components/scrim';
import { useAsync } from '@/lib/use-async';
import { useStatusBar } from '@/lib/use-status-bar';
import { usePreferences } from '@/preferences/preferences-provider';
import { getProducts } from '@/shopify/products';

export default function HomeScreen() {
  useStatusBar('light');
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { preferences } = usePreferences();
  const newIn = useAsync(() => getProducts(10, 'CREATED_AT'), 'new-in');

  // The categories the customer picked come first.
  const categories = [...content.onboarding.categories.options].sort(
    (a, b) => Number(preferences.categories.includes(b.id)) - Number(preferences.categories.includes(a.id)),
  );

  return (
    <ScrollView style={styles.screen} contentInsetAdjustmentBehavior="never">
      <View style={[styles.hero, { height }]}>
        <Image
          source={content.hero.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top"
        />
        <Scrim strength={0.8} />
        <View style={[styles.heroContent, { paddingBottom: insets.bottom + 110 }]}>
          <BrandMark height={24} color="#FFFFFF" />
          <Text style={styles.eyebrow}>{content.hero.eyebrow}</Text>
          <Text style={styles.heroTitle}>{content.hero.title}</Text>
          {content.hero.subtitle ? <Text style={styles.heroSubtitle}>{content.hero.subtitle}</Text> : null}
          <View style={styles.heroActions}>
            <PillButton title={content.hero.cta} variant="outline" onPress={() => router.navigate('/shop')} />
          </View>
        </View>
      </View>

      <Section title={content.onboarding.categories.sectionTitle}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(a) => a.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rail}
          renderItem={({ item }) => <CategoryCard category={item} />}
        />
      </Section>

      <Section title="New In">
        {newIn.data?.length ? (
          <FlatList
            horizontal
            data={newIn.data}
            keyExtractor={(p) => p.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
            renderItem={({ item }) => (
              <View style={styles.productSlot}>
                <ProductCard product={item} />
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyCard}>
            <BrandMark height={18} color={theme.text} />
            <Text style={styles.emptyTitle}>New drops are on the way</Text>
            <Text style={styles.emptyBody}>New {brand.name} pieces land here first.</Text>
          </View>
        )}
      </Section>

      <View style={{ height: insets.bottom + 120 }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function CategoryCard({ category }: { category: ChoiceOption }) {
  return (
    <Link href={{ pathname: '/search', params: { q: category.label } }} asChild>
      <Pressable style={styles.categoryCard}>
        {category.image !== undefined && (
          <Image source={category.image} style={StyleSheet.absoluteFill} contentFit="cover" />
        )}
        <Scrim strength={0.7} />
        {/* One line per word, so a long word shrinks rather than breaking mid-word. */}
        <Text
          style={styles.categoryLabel}
          numberOfLines={category.label.split(' ').length}
          adjustsFontSizeToFit
          minimumFontScale={0.6}>
          {category.label}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  hero: { backgroundColor: '#000' },
  heroContent: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, gap: 12 },
  eyebrow: { ...displayFont, color: 'rgba(255,255,255,0.8)', fontSize: 15, letterSpacing: 4, marginTop: 8 },
  heroTitle: { ...displayFont, color: '#FFFFFF', fontSize: 54, lineHeight: 52, letterSpacing: 0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 17, lineHeight: 23 },
  heroActions: { flexDirection: 'row', marginTop: 12 },

  section: { paddingTop: 36, gap: 16 },
  sectionTitle: { ...displayFont, fontSize: 30, letterSpacing: 0.5, color: theme.text, paddingHorizontal: 20 },
  rail: { paddingHorizontal: 20, gap: 12 },

  categoryCard: {
    width: 170,
    height: 230,
    borderRadius: theme.radius,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: theme.surface,
  },
  categoryLabel: { ...displayFont, color: '#FFFFFF', fontSize: 24, letterSpacing: 0.5, padding: 14 },

  productSlot: { width: 180 },
  emptyCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: theme.radius,
    backgroundColor: theme.surface,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { ...displayFont, fontSize: 22, color: theme.text, marginTop: 6 },
  emptyBody: { fontSize: 15, color: theme.textMuted },

});
