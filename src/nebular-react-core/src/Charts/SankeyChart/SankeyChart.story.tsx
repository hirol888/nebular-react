import React from 'react';
import { SankeyChart } from './SankeyChart';

export default { title: 'Charts/SankeyChart', component: SankeyChart };

const nodes = [
  { id: 'coal', label: 'Coal' },
  { id: 'gas', label: 'Gas' },
  { id: 'solar', label: 'Solar', color: '#ffaa00' },
  { id: 'power', label: 'Power' },
  { id: 'heat', label: 'Heat' },
  { id: 'homes', label: 'Homes' }
];

const links = [
  { source: 'coal', target: 'power', value: 40 },
  { source: 'gas', target: 'power', value: 25 },
  { source: 'gas', target: 'heat', value: 15 },
  { source: 'solar', target: 'power', value: 20 },
  { source: 'power', target: 'homes', value: 70 },
  { source: 'heat', target: 'homes', value: 15 }
];

export function Showcase() {
  return <SankeyChart nodes={nodes} links={links} ariaLabel="Energy flow" />;
}

export function WithValueFormatter() {
  return (
    <SankeyChart
      nodes={nodes}
      links={links}
      height={360}
      nodeWidth={16}
      nodePadding={14}
      valueFormatter={(value: number) => `${value} TWh`}
      ariaLabel="Energy flow in terawatt hours"
    />
  );
}

export function Interactive() {
  return (
    <SankeyChart
      nodes={nodes}
      links={links}
      ariaLabel="Interactive energy flow"
      onNodeClick={() => undefined}
      onLinkClick={() => undefined}
    />
  );
}
