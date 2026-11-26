import React, { useState } from 'react';
import { Transfer } from './Transfer';

export default { title: 'Transfer', component: Transfer };

const permissions = [
  { value: 'read', label: 'Read' },
  { value: 'write', label: 'Write' },
  { value: 'delete', label: 'Delete' },
  { value: 'admin', label: 'Admin' },
  { value: 'billing', label: 'Billing' }
];

export function Showcase() {
  const [value, setValue] = useState<string[]>(['write']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Transfer
        ariaLabel="Permissions transfer"
        data={permissions}
        value={value}
        onChange={setValue}
      />
      <span>Selected permissions: {value.join(', ') || 'none'}</span>
    </div>
  );
}

export function CustomTitles() {
  const [value, setValue] = useState<string[]>(['billing']);

  return (
    <Transfer
      ariaLabel="Feature access transfer"
      data={permissions}
      value={value}
      onChange={setValue}
      titles={['Available features', 'Enabled features']}
      nothingFoundMessage="Nothing matches the search"
      searchable={false}
    />
  );
}

export function Disabled() {
  return (
    <Transfer
      ariaLabel="Read-only permissions transfer"
      data={permissions}
      defaultValue={['read', 'admin']}
      disabled
    />
  );
}
