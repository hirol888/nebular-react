import React from 'react';
import { ViolinPlot } from './ViolinPlot';

export default { title: 'Charts/ViolinPlot', component: ViolinPlot };

const data = [
  { label: 'API', values: [42, 45, 47, 49, 50, 52, 55, 58, 64, 78] },
  { label: 'Database', values: [18, 20, 22, 24, 25, 27, 30, 36, 45, 62], color: '#00d68f' },
  { label: 'Cache', values: [2, 3, 3, 4, 4, 5, 5, 6, 8, 14], color: '#ffaa00' }
];

export function Showcase() {
  return <ViolinPlot data={data} ariaLabel="Latency distribution by service" />;
}

export function BandwidthComparison() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ViolinPlot
        data={data}
        bandwidth={0.15}
        height={240}
        ariaLabel="Latency distribution with narrow bandwidth"
      />
      <ViolinPlot
        data={data}
        bandwidth={0.8}
        height={240}
        ariaLabel="Latency distribution with wide bandwidth"
      />
    </div>
  );
}

export function WithoutMedianAndGrid() {
  return (
    <ViolinPlot
      data={data}
      height={260}
      showMedian={false}
      showGrid={false}
      valueFormatter={(value: number) => `${value} ms`}
      ariaLabel="Latency distribution without median and grid"
    />
  );
}
