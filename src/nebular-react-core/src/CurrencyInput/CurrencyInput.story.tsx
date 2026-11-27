import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { CurrencyInput } from './CurrencyInput';

export default { title: 'CurrencyInput', component: CurrencyInput };

export function Showcase() {
  const [value, setValue] = useState<number | null>(1299.9);

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CurrencyInput fullWidth value={value} placeholder="R$ 0,00" onChange={setValue} />
      <span>Value: {value ?? '-'}</span>
    </ExampleItemsCol>
  );
}

export function USD() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CurrencyInput fullWidth currency="USD" locale="en-US" defaultValue={1234.5} />
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <CurrencyInput fullWidth disabled defaultValue={9999.9} />
    </ExampleItemsCol>
  );
}
