import type { Money } from '@/shopify/types';

export function formatMoney({ amount, currencyCode }: Money) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(
    Number(amount),
  );
}

// Shopify names the only variant of a product with no options "Default Title".
export function variantLabel(title: string) {
  return title === 'Default Title' ? null : title;
}
