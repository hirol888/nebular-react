import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { PhoneInput, type PhoneNumberMeta } from './PhoneInput';

export default { title: 'PhoneInput', component: PhoneInput };

export function Showcase() {
  const [value, setValue] = useState('11987654321');

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <PhoneInput fullWidth value={value} placeholder="(00) 00000-0000" onChange={setValue} />
      <span>Value: {value || '-'}</span>
    </ExampleItemsCol>
  );
}

export function Countries() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <PhoneInput fullWidth aria-label="Brasil" country="BR" defaultValue="11987654321" />
      <PhoneInput fullWidth aria-label="Estados Unidos" country="US" defaultValue="4155552671" />
      <PhoneInput fullWidth aria-label="Portugal" country="PT" defaultValue="912345678" />
      <PhoneInput fullWidth aria-label="Argentina" country="AR" defaultValue="1123456789" />
      <PhoneInput fullWidth aria-label="Alemanha" country="DE" defaultValue="015123456789" />
    </ExampleItemsCol>
  );
}

export function E164() {
  const [value, setValue] = useState('');
  const [meta, setMeta] = useState<PhoneNumberMeta | null>(null);

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <PhoneInput
        fullWidth
        country="BR"
        outputFormat="e164"
        placeholder="+5511987654321"
        onChange={setValue}
        onChangeMeta={setMeta}
      />
      <span>Stored value: {value || '-'}</span>
      <span>
        Valid: {String(meta?.valid ?? false)} · Possible: {String(meta?.possible ?? false)}
      </span>
    </ExampleItemsCol>
  );
}

export function US() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <PhoneInput fullWidth country="US" defaultValue="4155552671" />
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <PhoneInput fullWidth disabled defaultValue="11987654321" />
    </ExampleItemsCol>
  );
}
