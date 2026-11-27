import React, { useState } from 'react';
import { PropertyGrid } from './PropertyGrid';
import type { PropertyGridField } from './PropertyGrid';
import type { SchemaFormValues } from '../SchemaForm';

export default { title: 'PropertyGrid', component: PropertyGrid };

const fields: readonly PropertyGridField[] = [
  {
    name: 'title',
    label: 'Label',
    type: 'text',
    category: 'Identity',
    defaultValue: 'Send message'
  },
  { name: 'id', label: 'Node ID', type: 'text', category: 'Identity', readOnly: true },
  {
    name: 'retries',
    label: 'Retry attempts',
    type: 'number',
    category: 'Execution',
    defaultValue: 3
  },
  { name: 'paused', label: 'Pause after failure', type: 'boolean', category: 'Execution' }
];

export function WorkflowNode() {
  const [values, setValues] = useState<SchemaFormValues>({
    title: 'Send confirmation',
    id: 'mail-204',
    retries: 5,
    paused: true
  });
  return (
    <PropertyGrid fields={fields} value={values} onChange={setValues} style={{ maxWidth: 540 }} />
  );
}
