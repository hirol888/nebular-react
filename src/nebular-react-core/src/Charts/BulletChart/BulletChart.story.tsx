import React from 'react';
import { BulletChart } from './BulletChart';

export default { title: 'Charts/BulletChart', component: BulletChart };

const data = [
  { label: 'Revenue', value: 80, target: 90, max: 100, ranges: [50, 75, 100] },
  { label: 'Profit', value: 55, target: 65, max: 100, ranges: [50, 75, 100] },
  { label: 'New customers', value: 42, target: 70, max: 100, ranges: [40, 70, 100] }
];

export function Showcase() {
  return <BulletChart data={data} ariaLabel="Performance against target" />;
}

export function WithFormatter() {
  return (
    <BulletChart
      data={data}
      height={220}
      valueFormatter={(value: number) => `${value}%`}
      ariaLabel="Performance against target in percent"
    />
  );
}

export function WithoutTargetAndValues() {
  return (
    <BulletChart
      data={data}
      height={150}
      showTarget={false}
      showValues={false}
      ariaLabel="Performance ranges"
    />
  );
}
