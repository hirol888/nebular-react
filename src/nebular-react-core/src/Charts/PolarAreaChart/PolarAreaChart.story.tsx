import React, { useState } from 'react';
import { PolarAreaChart } from './PolarAreaChart';

export default { title: 'Charts/PolarAreaChart', component: PolarAreaChart };

const data = [
  { label: 'Direct', value: 42 },
  { label: 'Organic', value: 28 },
  { label: 'Referral', value: 16 },
  { label: 'Social', value: 9 },
  { label: 'Email', value: 5 }
];

export function Showcase() {
  return <PolarAreaChart data={data} ariaLabel="Sessions by channel" />;
}

export function CustomStartAngle() {
  return (
    <PolarAreaChart
      data={data}
      size={340}
      startAngle={0}
      colors={['#5f3dc4', '#7048e8', '#845ef7', '#9775fa', '#b197fc']}
      valueFormatter={(value: number) => `${value}k`}
      ariaLabel="Sessions by channel in thousands"
    />
  );
}

export function Interactive() {
  const [selected, setSelected] = useState<string>('None');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <PolarAreaChart
        data={data}
        ariaLabel="Interactive sessions by channel"
        onSegmentClick={(segment) => setSelected(`${segment.label}: ${segment.value}k`)}
      />
      <span>Selected segment: {selected}</span>
    </div>
  );
}
