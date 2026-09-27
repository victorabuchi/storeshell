import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { brand, theme } from '@/brand';
import { ProductCard } from '@/components/product-card';
import { ErrorState, Loading } from '@/components/status';
import { useStatusBar } from '@/lib/use-status-bar';
import { useAsync } from '@/lib/use-async';
import { getProducts } from '@/shopify/products';

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  useStatusBar('dark');
  const { data, error, loading, refetch } = useAsync(() => getProducts(), 'products');

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <Loading />;

  return (
    <FlatList
      data={data}
      keyExtractor={(p) => p.id}
      numColumns={2}
      style={styles.list}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      columnWrapperStyle={styles.row}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.brand}>{brand.name.toUpperCase()}</Text>
          <Text style={styles.title}>{brand.copy.homeTitle}</Text>
          <Text style={styles.subtitle}>{brand.copy.homeSubtitle}</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>New drops are on the way</Text>
          <Text style={styles.subtitle}>Check back soon, or turn on notifications to hear first.</Text>
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: theme.background },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 24 },
  row: { gap: 12 },
  header: { gap: 4, marginBottom: 4 },
  brand: { fontSize: 13, fontWeight: '700', letterSpacing: 2, color: theme.textMuted },
  title: { fontSize: 32, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 15, color: theme.textMuted },
  empty: { paddingVertical: 48, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: theme.text },
});
