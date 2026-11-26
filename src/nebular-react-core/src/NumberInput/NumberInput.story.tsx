import React, { useState } from 'react';
import { NumberInput } from './NumberInput';

export default { title: 'NumberInput', component: NumberInput };

export function Showcase() {
  const [value, setValue] = useState<number | null>(10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 240 }}>
      <NumberInput
        aria-label="Quantity"
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        step={1}
      />
      <span>Quantity: {value ?? 'empty'}</span>
    </div>
  );
}

export function Precision() {
  const [value, setValue] = useState<number | null>(12.5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 240 }}>
      <NumberInput
        aria-label="Unit price"
        value={value}
        onChange={setValue}
        min={0}
        max={1000}
        step={0.01}
        precision={2}
      />
      <span>Unit price: {value ?? 'empty'}</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 240 }}>
      <NumberInput aria-label="Locked quantity" defaultValue={5} min={0} max={10} disabled />
      <NumberInput aria-label="Read-only quantity" defaultValue={8} min={0} max={10} readOnly />
    </div>
  );
}
