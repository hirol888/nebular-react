import React from 'react';
import { CopyButton } from './CopyButton';

export default { title: 'CopyButton', component: CopyButton };

export function Showcase() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}
    >
      <CopyButton value="npm install @nebular-react/core" />
      <CopyButton value="https://nebular.example.com" status="primary" appearance="outline" />
      <CopyButton value="Short-lived feedback" timeout={500} status="success" />
    </div>
  );
}

export function CustomLabels() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}
    >
      <CopyButton value="abc-123" label="Copiar código" copiedLabel="Código copiado!" />
      <CopyButton
        value="https://nebular.example.com/setup"
        label="Copiar link"
        copiedLabel="Link copiado!"
        status="primary"
        size="small"
      />
    </div>
  );
}
