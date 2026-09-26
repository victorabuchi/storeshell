import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/brand';
import type { ProductSummary } from '@/shopify/types';
import { Price } from './price';

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={{ pathname: '/product/[handle]', params: { handle: product.handle } }} asChild>
      <Pressable style={styles.card}>
        <View style={styles.imageWrap}>
          <Image
            source={product.featuredImage?.url}
            alt={product.featuredImage?.altText ?? product.title}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Price
          price={product.priceRange.minVariantPrice}
          compareAt={product.compareAtPriceRange.minVariantPrice}
          size={14}
        />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 6 },
  imageWrap: {
    aspectRatio: 4 / 5,
    borderRadius: theme.radius,
    overflow: 'hidden',
    backgroundColor: theme.surface,
    marginBottom: 4,
  },
  image: { width: '100%', height: '100%' },
  title: { fontSize: 14, color: theme.text },
});
