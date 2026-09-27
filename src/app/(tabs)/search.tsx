import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { content, displayFont, theme } from '@/brand';
import { ProductCard } from '@/components/product-card';
import { useAsync } from '@/lib/use-async';
import { useStatusBar } from '@/lib/use-status-bar';
import { searchProducts } from '@/shopify/products';

export default function SearchScreen() {
  useStatusBar('dark');
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [text, setText] = useState(params.q ?? '');
  const [query, setQuery] = useState(text);

  // Activity cards on Home open Search with a preset query.
  const [presetQuery, setPresetQuery] = useState(params.q);
  if (params.q !== presetQuery) {
    setPresetQuery(params.q);
    if (params.q) setText(params.q);
  }

  // Wait until typing pauses before hitting the Storefront API.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);

  const results = useAsync(() => (query ? searchProducts(query) : Promise.resolve([])), query);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.field}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Search Frozenholm"
          placeholderTextColor={theme.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          clearButtonMode="while-editing"
          style={styles.input}
        />
      </View>

      {!query ? (
        <View style={styles.suggestions}>
          <Text style={styles.heading}>Popular</Text>
          {content.onboarding.activities.options.map((a) => (
            <Pressable key={a.id} onPress={() => setText(a.label)} hitSlop={6}>
              <Text style={styles.suggestion}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : results.loading ? (
        <ActivityIndicator style={styles.loading} color={theme.primary} />
      ) : (
        <FlatList
          data={results.data ?? []}
          keyExtractor={(p) => p.id}
          numColumns={2}
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.results}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {results.error ? results.error.message : `No results for "${query}" yet.`}
            </Text>
          }
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  field: { paddingHorizontal: 16, paddingBottom: 8 },
  input: {
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 18,
    fontSize: 16,
    color: theme.text,
    backgroundColor: theme.surface,
  },
  suggestions: { paddingHorizontal: 20, paddingTop: 20, gap: 16 },
  heading: { ...displayFont, fontSize: 16, letterSpacing: 3, color: theme.textMuted },
  suggestion: { ...displayFont, fontSize: 32, color: theme.text },
  loading: { marginTop: 40 },
  results: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120, gap: 24 },
  row: { gap: 12 },
  empty: { fontSize: 15, color: theme.textMuted, paddingTop: 24 },
});
