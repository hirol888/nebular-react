import React, { useState } from 'react';
import { JsonEditor } from './JsonEditor';

export default { title: 'JsonEditor', component: JsonEditor };

const sample = `{
  "name": "Nebular",
  "components": 120,
  "stable": true,
  "tags": ["react", "ui"]
}`;

export function Showcase() {
  return <JsonEditor defaultValue={sample} ariaLabel="JSON payload" />;
}

export function Controlled() {
  const [value, setValue] = useState(sample);
  const [status, setStatus] = useState('valid');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <JsonEditor
        value={value}
        onChange={setValue}
        onValidate={(result) =>
          setStatus(result.valid ? 'valid' : `${result.error?.message ?? 'invalid'}`)
        }
        height={220}
        ariaLabel="Controlled JSON editor"
      />
      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Validation: {status}</span>
    </div>
  );
}

export function ReadOnly() {
  return (
    <JsonEditor defaultValue={sample} readOnly indent={4} height={200} ariaLabel="Read only JSON" />
  );
}
