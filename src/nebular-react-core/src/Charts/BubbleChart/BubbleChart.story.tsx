import React from 'react';
import { BubbleChart } from './BubbleChart';

export default { title: 'Charts/BubbleChart', component: BubbleChart };

const data = [
  { x: 12, y: 34, size: 240, label: 'Chrome' },
  { x: 28, y: 18, size: 90, label: 'Safari' },
  { x: 46, y: 52, size: 380, label: 'Edge' },
  { x: 64, y: 26, size: 140, label: 'Firefox' },
  { x: 78, y: 44, size: 60, label: 'Opera' }
];

export function Showcase() {
  return <BubbleChart data={data} ariaLabel="Browser market share and sessions" />;
}

export function AxisLabels() {
  return (
    <BubbleChart
      data={data}
      width={560}
      height={360}
      xLabel="Average session (min)"
      yLabel="Conversion rate (%)"
      ariaLabel="Sessions against conversion"
      valueFormatter={(value: number) => value.toFixed(0)}
      onBubbleClick={(datum) => {
        // eslint-disable-next-line no-console
        console.log(datum.label);
      }}
    />
  );
}

export function Empty() {
  return <BubbleChart data={[]} ariaLabel="Empty bubble chart" />;
}
