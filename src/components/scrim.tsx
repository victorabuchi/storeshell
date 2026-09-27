import { StyleSheet, View, type ViewStyle } from 'react-native';

// Darkens the bottom of a full-bleed photo so white text on top stays legible.
export function Scrim({ strength = 0.85, style }: { strength?: number; style?: ViewStyle }) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          experimental_backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,${strength}) 100%)`,
        },
        style,
      ]}
    />
  );
}
