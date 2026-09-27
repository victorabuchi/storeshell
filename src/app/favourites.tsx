import { FlatList, StyleSheet, Text, View } from 'react-native';

import { displayFont, theme } from '@/brand';
import { ProductCard } from '@/components/product-card';
import { useFavourites } from '@/favourites/favourites-provider';

export default function FavouritesScreen() {
  const { favourites } = useFavourites();

  return (
    <FlatList
      data={favourites}
      keyExtractor={(p) => p.id}
      numColumns={2}
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.row}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptyBody}>Tap the heart on a product to save it here.</Text>
        </View>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, gap: 24 },
  row: { gap: 12 },
  empty: { paddingVertical: 48, gap: 6 },
  emptyTitle: { ...displayFont, fontSize: 24, color: theme.text },
  emptyBody: { fontSize: 15, color: theme.textMuted },
});
