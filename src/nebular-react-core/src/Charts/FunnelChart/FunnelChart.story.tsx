import React from 'react';
import { FunnelChart } from './FunnelChart';

export default { title: 'Charts/FunnelChart', component: FunnelChart };

const data = [
  { label: 'Visits', value: 1200 },
  { label: 'Signups', value: 640 },
  { label: 'Activated', value: 320 },
  { label: 'Purchased', value: 120 }
];

export function Showcase() {
  return <FunnelChart data={data} ariaLabel="Conversion funnel" />;
}

export function WithFormatter() {
  return (
    <FunnelChart
      data={[
        { label: 'Applied', value: 840, color: '#3366ff' },
        { label: 'Interviewed', value: 320, color: '#00d68f' },
        { label: 'Hired', value: 48, color: '#ffaa00' }
      ]}
      height={300}
      valueFormatter={(value: number) => value.toLocaleString('en-US')}
      ariaLabel="Hiring funnel"
    />
  );
}

export function WithoutValues() {
  return (
    <FunnelChart
      data={data}
      showValues={false}
      onSegmentClick={() => undefined}
      ariaLabel="Conversion funnel without values"
    />
  );
}
