import React from 'react';
import { MekkoChart } from './MekkoChart';

export default { title: 'Charts/MekkoChart', component: MekkoChart };

const data = [
  {
    label: 'Q1',
    segments: [
      { label: 'Direct', value: 32 },
      { label: 'Search', value: 24 },
      { label: 'Social', value: 12 }
    ]
  },
  {
    label: 'Q2',
    segments: [
      { label: 'Direct', value: 28 },
      { label: 'Search', value: 30 },
      { label: 'Social', value: 18 }
    ]
  },
  {
    label: 'Q3',
    segments: [
      { label: 'Direct', value: 20 },
      { label: 'Search', value: 34 },
      { label: 'Social', value: 22 }
    ]
  }
];

export function Showcase() {
  return <MekkoChart data={data} ariaLabel="Channel mix by quarter" />;
}

export function WithValueFormatter() {
  return (
    <MekkoChart
      data={data}
      height={360}
      valueFormatter={(value: number) => `${value}k`}
      ariaLabel="Channel mix by quarter in thousands"
    />
  );
}

export function Interactive() {
  return (
    <MekkoChart data={data} ariaLabel="Interactive channel mix" onSegmentClick={() => undefined} />
  );
}
