import {
  AcceleratedCheckoutButtons,
  ApplePayLabel,
  useShopifyCheckoutSheet,
} from '@shopify/checkout-sheet-kit';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { displayFont, theme } from '@/brand';
import { useCart } from '@/cart/cart-provider';
import { walletButtons } from '@/checkout/config';
import { Button } from '@/components/button';
import { Price } from '@/components/price';
import { ErrorState, Loading } from '@/components/status';
import { useFavourites } from '@/favourites/favourites-provider';
import { useAsync } from '@/lib/use-async';
import { getProduct } from '@/shopify/products';
import type { Product, ProductSummary, Variant } from '@/shopify/types';

export default function ProductScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { data, error, refetch } = useAsync(() => getProduct(handle), handle);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (data === undefined) return <Loading />;
  if (data === null) return <ErrorState error={new Error('Product not found')} onRetry={refetch} />;
  return <ProductView product={data} />;
}

type Selection = Record<string, string>;

const matches = (variant: Variant, selection: Selection) =>
  variant.selectedOptions.every((o) => selection[o.name] === o.value);

function ProductView({ product }: { product: Product }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addItem, busy } = useCart();
  const { acceleratedCheckoutsAvailable } = useShopifyCheckoutSheet();

  const variants = product.variants.nodes;
  const [selection, setSelection] = useState<Selection>(() => {
    const initial = variants.find((v) => v.availableForSale) ?? variants[0];
    return Object.fromEntries(initial.selectedOptions.map((o) => [o.name, o.value]));
  });
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => matches(v, selection));
  const available = variant?.availableForSale ?? false;
  const hasOptions = !(variants.length === 1 && variants[0].title === 'Default Title');
  const images = product.images.nodes;

  const isValueAvailable = (name: string, value: string) =>
    variants.some((v) => v.availableForSale && matches(v, { ...selection, [name]: value }));

  const onAdd = async () => {
    if (!variant) return;
    try {
      await addItem(variant.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      Alert.alert('Could not add to bag', (e as Error).message);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerRight: () => <FavouriteButton product={product} /> }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(img) => img.url}
          renderItem={({ item }) => (
            <Image
              source={item.url}
              alt={item.altText ?? product.title}
              style={{ width, height: width * 1.25, backgroundColor: theme.surface }}
              contentFit="cover"
              transition={200}
            />
          )}
        />

        <View style={styles.body}>
          <Text style={styles.title}>{product.title}</Text>
          {variant && <Price price={variant.price} compareAt={variant.compareAtPrice} size={18} />}

          {hasOptions &&
            product.options.map((option) => (
              <View key={option.name} style={styles.option}>
                <Text style={styles.optionName}>
                  {option.name}: <Text style={styles.optionValue}>{selection[option.name]}</Text>
                </Text>
                <View style={styles.chips}>
                  {option.optionValues.map(({ name: value }) => {
                    const selected = selection[option.name] === value;
                    const enabled = isValueAvailable(option.name, value);
                    return (
                      <Pressable
                        key={value}
                        onPress={() => setSelection({ ...selection, [option.name]: value })}
                        style={[styles.chip, selected && styles.chipSelected, !enabled && styles.chipDisabled]}>
                        <Text
                          style={[
                            styles.chipText,
                            selected && { color: theme.onPrimary },
                            !enabled && styles.chipTextDisabled,
                          ]}>
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

          {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={!variant || !available ? 'Sold out' : added ? 'Added to bag ✓' : 'Add to bag'}
          onPress={onAdd}
          loading={busy}
          disabled={!variant || !available}
        />
        {Platform.OS === 'ios' && acceleratedCheckoutsAvailable && variant && available && (
          <AcceleratedCheckoutButtons
            variantId={variant.id}
            quantity={1}
            wallets={walletButtons}
            applePayLabel={ApplePayLabel.buy}
            cornerRadius={theme.radius}
          />
        )}
      </View>
    </View>
  );
}

// Favourites store the same summary the product grids use.
function toSummary(product: Product): ProductSummary {
  const first = product.variants.nodes[0];
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    featuredImage: product.images.nodes[0] ?? null,
    priceRange: { minVariantPrice: first.price },
    compareAtPriceRange: { minVariantPrice: first.compareAtPrice ?? first.price },
  };
}

function FavouriteButton({ product }: { product: Product }) {
  const { isFavourite, toggle } = useFavourites();
  const active = isFavourite(product.id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favourites' : 'Add to favourites'}
      onPress={() => toggle(toSummary(product))}
      hitSlop={8}>
      <SymbolView name={active ? 'heart.fill' : 'heart'} tintColor={theme.text} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  body: { padding: 16, gap: 12 },
  title: { ...displayFont, fontSize: 36, lineHeight: 38, color: theme.text },
  option: { gap: 8, marginTop: 8 },
  optionName: { fontSize: 14, color: theme.textMuted },
  optionValue: { color: theme.text, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minWidth: 52,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipDisabled: { backgroundColor: theme.surface },
  chipText: { ...displayFont, fontSize: 16, letterSpacing: 0.5, color: theme.text },
  chipTextDisabled: { color: theme.textMuted, textDecorationLine: 'line-through' },
  description: { fontSize: 15, lineHeight: 22, color: theme.text, marginTop: 8 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
});
