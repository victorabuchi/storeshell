import { SvgXml } from 'react-native-svg';

import { logoSvg } from '@/brand';

// The brand's logo.svg, drawn with fill="currentColor" so it can be tinted.
export function BrandMark({ size = 48, color }: { size?: number; color: string }) {
  return <SvgXml xml={logoSvg} width={size} height={size} color={color} />;
}
