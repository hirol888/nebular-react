import React from 'react';
import { NumberFormatter } from './NumberFormatter';

export default { title: 'NumberFormatter', component: NumberFormatter };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <NumberFormatter value={1234567.89} />
      <NumberFormatter value={1234567.89} locale="pt-BR" />
      <NumberFormatter
        value={1234567.89}
        locale="en-US"
        options={{ style: 'currency', currency: 'USD' }}
      />
      <NumberFormatter value={0.4281} options={{ style: 'percent', maximumFractionDigits: 1 }} />
      <NumberFormatter
        value={1250000}
        options={{ notation: 'compact', maximumFractionDigits: 1 }}
      />
    </div>
  );
}

export function AffixesAndFallback() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <NumberFormatter value={-42.5} prefix="$" suffix=" USD" />
      <NumberFormatter value={Number.NaN} fallback="Not available" />
      <NumberFormatter value={null} as="strong" />
    </div>
  );
}
