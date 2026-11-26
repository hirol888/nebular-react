import React from 'react';
import { JsonViewer } from './JsonViewer';

export default { title: 'JsonViewer', component: JsonViewer };

const payload = {
  id: 1234,
  name: 'Nebular',
  active: true,
  tags: ['ui', 'react', 'charts'],
  owner: {
    name: 'Ada',
    email: 'ada@nebular.dev',
    permissions: ['read', 'write']
  },
  deletedAt: null
};

export function Showcase() {
  return <JsonViewer data={payload} ariaLabel="API response" />;
}

export function Expanded() {
  return <JsonViewer data={payload} expandDepth={3} ariaLabel="API response expanded" />;
}

export function WithSearchAndMaxHeight() {
  return (
    <JsonViewer
      data={JSON.stringify(payload, null, 2)}
      searchable
      maxHeight={240}
      ariaLabel="Searchable API response"
    />
  );
}
