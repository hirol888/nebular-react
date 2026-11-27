import React from 'react';
import { SunburstChart } from './SunburstChart';

export default { title: 'Charts/SunburstChart', component: SunburstChart };

const data = [
  {
    label: 'Electronics',
    children: [
      { label: 'Phones', value: 320 },
      { label: 'Laptops', value: 210 },
      { label: 'Audio', value: 90 }
    ]
  },
  {
    label: 'Fashion',
    color: '#00d68f',
    children: [
      { label: 'Shoes', value: 160 },
      { label: 'Bags', value: 120 }
    ]
  },
  {
    label: 'Home',
    children: [
      { label: 'Kitchen', value: 140 },
      { label: 'Decor', value: 80 }
    ]
  }
];

export function Showcase() {
  return <SunburstChart data={data} ariaLabel="Sales by category" />;
}

export function WithInnerRadius() {
  return (
    <SunburstChart
      data={data}
      size={360}
      innerRadius={90}
      valueFormatter={(value: number) => `$${value}k`}
      ariaLabel="Sales by category as a ring"
    />
  );
}

export function Interactive() {
  return (
    <SunburstChart
      data={data}
      showLabels={false}
      onSegmentClick={() => undefined}
      ariaLabel="Interactive sales sunburst"
    />
  );
}
