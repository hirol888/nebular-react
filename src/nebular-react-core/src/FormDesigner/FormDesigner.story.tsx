import React, { useState } from 'react';
import { CodeBlock } from '../CodeBlock';
import { FormDesigner } from './FormDesigner';
import type { FormDesignerField } from './FormDesigner';

export default { title: 'FormDesigner', component: FormDesigner };

const fields: readonly FormDesignerField[] = [
  { id: 'subject', name: 'subject', label: 'Session title', type: 'text', required: true },
  { id: 'format', name: 'format', label: 'Format', type: 'select', options: ['Online', 'On-site'] }
];

export function WorkshopRegistration() {
  const [schema, setSchema] = useState(fields);
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <FormDesigner value={schema} onChange={setSchema} />
      <details>
        <summary>Serializable field definitions</summary>
        <CodeBlock language="json" code={JSON.stringify(schema, null, 2)} />
      </details>
    </div>
  );
}
