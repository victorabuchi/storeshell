import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useAccount } from '@/account/account-provider';
import { theme } from '@/brand';

export default function AddressesScreen() {
  const { customer } = useAccount();
  const addresses = customer?.addresses.nodes ?? [];

  return (
    <FlatList
      data={addresses}
      keyExtractor={(a) => a.id}
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      ListEmptyComponent={
        <Text style={styles.empty}>No saved addresses yet. Addresses you use at checkout are saved here.</Text>
      }
      ListFooterComponent={
        addresses.length ? <Text style={styles.empty}>New addresses are saved when you check out.</Text> : null
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          {customer?.defaultAddress?.id === item.id && <Text style={styles.badge}>Default</Text>}
          {item.formatted.map((line, i) => (
            <Text key={i} style={i === 0 ? styles.first : styles.line}>
              {line}
            </Text>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  row: { padding: 20, gap: 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
  badge: { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: theme.textMuted, marginBottom: 4 },
  first: { fontSize: 16, fontWeight: '600', color: theme.text },
  line: { fontSize: 15, color: theme.text },
  empty: { padding: 20, fontSize: 15, color: theme.textMuted },
});
