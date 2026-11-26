import React from 'react';
import { TreeMapChart } from './TreeMapChart';

export default { title: 'Charts/TreeMapChart', component: TreeMapChart };

const data = [
  { label: 'Electronics', value: 980 },
  { label: 'Fashion', value: 720 },
  { label: 'Home', value: 540 },
  { label: 'Sports', value: 380 },
  { label: 'Books', value: 260 }
];

export function Showcase() {
  return <TreeMapChart data={data} ariaLabel="Sales by category" />;
}

export function WithChildren() {
  return (
    <TreeMapChart
      data={[
        {
          label: 'Electronics',
          value: 520,
          children: [
            { label: 'Phones', value: 300 },
            { label: 'Laptops', value: 180 },
            { label: 'Audio', value: 40 }
          ]
        },
        {
          label: 'Fashion',
          value: 320,
          color: '#00d68f',
          children: [
            { label: 'Shoes', value: 160 },
            { label: 'Bags', value: 100 },
            { label: 'Accessories', value: 60 }
          ]
        },
        { label: 'Home', value: 260, color: '#ffaa00' }
      ]}
      height={320}
      valueFormatter={(value: number) => `$${value}k`}
      ariaLabel="Sales by category and subcategory"
    />
  );
}

export function Interactive() {
  return (
    <TreeMapChart
      data={data}
      showValues={false}
      onItemClick={() => undefined}
      ariaLabel="Interactive sales treemap"
    />
  );
}
