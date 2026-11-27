import React, { useState } from 'react';
import { Dendrogram, DendrogramNode } from './Dendrogram';

export default { title: 'Charts/Dendrogram', component: Dendrogram };

const data: DendrogramNode = {
  id: 'all',
  label: 'All samples',
  distance: 12,
  children: [
    {
      id: 'group-a',
      label: 'Group A',
      distance: 7,
      children: [
        {
          id: 'a-1',
          label: 'A1',
          distance: 3,
          children: [
            { id: 'a-1-1', label: 'A1a' },
            { id: 'a-1-2', label: 'A1b' }
          ]
        },
        { id: 'a-2', label: 'A2', distance: 2, children: [{ id: 'a-2-1', label: 'A2a' }] }
      ]
    },
    {
      id: 'group-b',
      label: 'Group B',
      distance: 9,
      children: [
        { id: 'b-1', label: 'B1', distance: 4, children: [{ id: 'b-1-1', label: 'B1a' }] },
        {
          id: 'b-2',
          label: 'B2',
          distance: 5,
          children: [
            { id: 'b-2-1', label: 'B2a' },
            { id: 'b-2-2', label: 'B2b' },
            { id: 'b-2-3', label: 'B2c' }
          ]
        }
      ]
    },
    { id: 'group-c', label: 'Group C', distance: 4, children: [{ id: 'c-1', label: 'C1' }] }
  ]
};

export function Showcase() {
  return <Dendrogram data={data} ariaLabel="Hierarchical clustering of samples" />;
}

export function Horizontal() {
  return (
    <Dendrogram
      data={data}
      orientation="left"
      width={560}
      height={360}
      color="#00b8d9"
      ariaLabel="Horizontal hierarchical clustering"
    />
  );
}

export function Interactive() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Dendrogram
        data={data}
        width={520}
        height={340}
        onNodeClick={(node) => setSelected(node.label ?? node.id ?? 'unknown')}
        ariaLabel="Interactive hierarchical clustering"
      />
      <span>Selected: {selected ?? 'none'}</span>
    </div>
  );
}
