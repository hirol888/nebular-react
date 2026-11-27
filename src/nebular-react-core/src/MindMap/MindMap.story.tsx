import React, { useState } from 'react';
import { MindMap, MindMapNode } from './MindMap';

export default { title: 'MindMap', component: MindMap };

const root: MindMapNode = {
  id: 'product',
  label: 'Product',
  color: '#3366ff',
  children: [
    {
      id: 'design',
      label: 'Design',
      color: '#00b8d9',
      children: [
        { id: 'research', label: 'UX Research' },
        { id: 'ui', label: 'UI Design', children: [{ id: 'system', label: 'Design System' }] }
      ]
    },
    {
      id: 'engineering',
      label: 'Engineering',
      color: '#36b37e',
      children: [
        { id: 'frontend', label: 'Frontend' },
        { id: 'backend', label: 'Backend' },
        { id: 'infra', label: 'Infrastructure' }
      ]
    },
    {
      id: 'operations',
      label: 'Operations',
      color: '#ffab00',
      children: [{ id: 'support', label: 'Support' }]
    },
    {
      id: 'sales',
      label: 'Sales',
      color: '#ff5630',
      children: [{ id: 'enterprise', label: 'Enterprise' }]
    }
  ]
};

export function Showcase() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <MindMap
        root={root}
        defaultExpandedIds={['product', 'design', 'engineering']}
        onNodeClick={(node) => setSelected(String(node.label))}
        ariaLabel="Product mind map"
      />
      <span>Selected: {selected ?? 'none'}</span>
    </div>
  );
}

export function Collapsible() {
  const [expanded, setExpanded] = useState<string[]>(['product']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <MindMap
        root={root}
        expandedIds={expanded}
        onExpandedChange={setExpanded}
        ariaLabel="Collapsible mind map"
      />
      <span>Expanded nodes: {expanded.join(', ') || 'none'}</span>
    </div>
  );
}

export function CustomNode() {
  return (
    <MindMap
      root={root}
      defaultExpandedIds={['product', 'engineering']}
      ariaLabel="Mind map with custom nodes"
      renderNode={(node) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '999px',
              backgroundColor: node.color ?? '#8f9bb3'
            }}
          />
          <strong style={{ fontWeight: 600 }}>{node.label}</strong>
          {node.children?.length ? (
            <em style={{ fontSize: '0.7rem', opacity: 0.7 }}>{node.children.length}</em>
          ) : null}
        </span>
      )}
    />
  );
}
