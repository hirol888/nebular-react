import React from 'react';
import { WaterfallChart } from './WaterfallChart';

export default { title: 'Charts/WaterfallChart', component: WaterfallChart };

const data = [
  { label: 'Revenue', value: 1200 },
  { label: 'Costs', value: -420 },
  { label: 'Taxes', value: -180 },
  { label: 'Profit', value: 0, type: 'total' as const }
];

export function Showcase() {
  return <WaterfallChart data={data} ariaLabel="Profit waterfall" />;
}

export function WithFormatter() {
  return (
    <WaterfallChart
      data={data}
      height={320}
      valueFormatter={(value: number) => `$${value}`}
      ariaLabel="Profit waterfall in dollars"
    />
  );
}

export function WithoutGridAndConnectors() {
  return (
    <WaterfallChart
      data={data}
      showGrid={false}
      showConnectors={false}
      ariaLabel="Profit waterfall without grid"
    />
  );
}
