import React, { useState } from 'react';
import { OrgChart, OrgNode } from './OrgChart';

export default { title: 'OrgChart', component: OrgChart };

const nodes: OrgNode[] = [
  {
    id: 'ceo',
    title: 'Ada Lovelace',
    subtitle: 'Chief Executive Officer',
    avatar: 'AL',
    children: [
      {
        id: 'cto',
        title: 'Grace Hopper',
        subtitle: 'Chief Technology Officer',
        avatar: 'GH',
        children: [
          {
            id: 'platform',
            title: 'Linus Torvalds',
            subtitle: 'Principal Engineer',
            avatar: 'LT',
            children: [
              { id: 'frontend', title: 'Margaret Hamilton', subtitle: 'Frontend Lead' },
              { id: 'backend', title: 'Ken Thompson', subtitle: 'Backend Lead' }
            ]
          },
          { id: 'qa', title: 'Radia Perlman', subtitle: 'QA Lead' }
        ]
      },
      {
        id: 'cfo',
        title: 'Katherine Johnson',
        subtitle: 'Chief Financial Officer',
        avatar: 'KJ',
        children: [{ id: 'accounting', title: 'Mary Jackson', subtitle: 'Accounting Manager' }]
      },
      {
        id: 'coo',
        title: 'Annie Easley',
        subtitle: 'Chief Operating Officer',
        avatar: 'AE'
      }
    ]
  }
];

export function Showcase() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <OrgChart
        nodes={nodes}
        ariaLabel="Company organization chart"
        defaultExpandedIds={['ceo', 'cto']}
        onNodeClick={(node) => setSelected(String(node.title))}
      />
      <span>Selected: {selected ?? 'none'}</span>
    </div>
  );
}

export function Collapsible() {
  const [expanded, setExpanded] = useState<string[]>(['ceo']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <OrgChart
        nodes={nodes}
        ariaLabel="Collapsible organization chart"
        expandedIds={expanded}
        onExpandedChange={setExpanded}
      />
      <span>Expanded branches: {expanded.join(', ') || 'none'}</span>
    </div>
  );
}

export function Horizontal() {
  return (
    <OrgChart
      nodes={nodes}
      ariaLabel="Horizontal organization chart"
      orientation="horizontal"
      defaultExpandedIds={['ceo', 'cto', 'platform']}
    />
  );
}
