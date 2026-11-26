import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { MaskedInput, parseMaskedValue } from './MaskedInput';

const CPF_MASK = '999.999.999-99';

export default { title: 'MaskedInput', component: MaskedInput };

export function Showcase() {
  const [value, setValue] = useState('');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <MaskedInput
        fullWidth
        mask={CPF_MASK}
        placeholder="000.000.000-00"
        value={value}
        onChange={setValue}
      />
      <span>Parsed value: {parseMaskedValue(value, CPF_MASK) || '-'}</span>
    </ExampleItemsCol>
  );
}

export function Phone() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <MaskedInput fullWidth mask="(99) 99999-9999" placeholder="(00) 00000-0000" />
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <MaskedInput fullWidth disabled mask={CPF_MASK} defaultValue="12345678901" />
    </ExampleItemsCol>
  );
}
