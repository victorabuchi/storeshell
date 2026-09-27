import { Image } from 'expo-image';
import { StyleSheet, Text } from 'react-native';

import { brand, content } from '@/brand';

// The brand's own logo file, tinted to `color`. Brands without one show their name.
export function BrandMark({ height = 24, color }: { height?: number; color: string }) {
  if (content.logo === undefined) {
    return <Text style={[styles.name, { fontSize: height, color }]}>{brand.name.toUpperCase()}</Text>;
  }
  const width = height * (content.logoAspectRatio ?? 1);
  return (
    <Image
      source={content.logo}
      style={{ width, height }}
      tintColor={color}
      contentFit="contain"
      accessibilityLabel={brand.name}
    />
  );
}

const styles = StyleSheet.create({
  name: { fontWeight: '800', letterSpacing: 1 },
});
