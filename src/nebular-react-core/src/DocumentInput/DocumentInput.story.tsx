import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { DocumentInput, isValidCpf } from './DocumentInput';

export default { title: 'DocumentInput', component: DocumentInput };

export function Showcase() {
  const [value, setValue] = useState('52998224725');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <DocumentInput fullWidth value={value} placeholder="000.000.000-00" onChange={setValue} />
      <span>Value: {value || '-'}</span>
      <span>Valid CPF: {String(isValidCpf(value))}</span>
    </ExampleItemsCol>
  );
}

export function CNPJ() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <DocumentInput fullWidth documentType="cnpj" defaultValue="11222333000181" />
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <DocumentInput fullWidth disabled defaultValue="52998224725" />
    </ExampleItemsCol>
  );
}
