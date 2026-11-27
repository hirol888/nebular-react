import React from 'react';
import { Descriptions } from './Descriptions';

export default { title: 'Descriptions', component: Descriptions };

export function Showcase() {
  return (
    <Descriptions
      title="Account"
      bordered
      columns={2}
      items={[
        { label: 'Name', value: 'Alice Johnson' },
        { label: 'E-mail', value: 'alice@example.com' },
        { label: 'Role', value: 'Administrator' },
        { label: 'Status', value: 'Active' },
        { label: 'Notes', value: 'Long-term customer with a custom support plan.', span: 2 }
      ]}
    />
  );
}

export function Sizes() {
  const items = [
    { label: 'Environment', value: 'Production' },
    { label: 'Region', value: 'eu-central-1' },
    { label: 'Version', value: '4.8.2' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Descriptions title="Small" size="small" bordered items={items} />
      <Descriptions title="Medium" size="medium" bordered items={items} />
      <Descriptions title="Large" size="large" bordered items={items} />
    </div>
  );
}

export function Columns() {
  return (
    <Descriptions
      title="Deployment details"
      columns={3}
      items={[
        { label: 'Service', value: 'api-gateway' },
        { label: 'Replicas', value: '4' },
        { label: 'Strategy', value: 'Rolling update' },
        { label: 'Owner', value: 'Platform team' },
        { label: 'Created at', value: '2026-02-14 09:32' },
        { label: 'Last deploy', value: '2026-03-01 18:05' }
      ]}
    />
  );
}
