import React, { useState } from 'react';
import { SignaturePad } from './SignaturePad';

export default { title: 'SignaturePad', component: SignaturePad };

export function Basic() {
  return <SignaturePad ariaLabel="Signature" />;
}

export function Colors() {
  return (
    <SignaturePad
      ariaLabel="Signature in blue"
      penColor="#3366ff"
      backgroundColor="#f7f9fc"
      height={200}
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SignaturePad value={value} onChange={setValue} ariaLabel="Controlled signature" />
      <code style={{ fontSize: '0.75rem' }}>{value || 'Draw something'}</code>
    </div>
  );
}
