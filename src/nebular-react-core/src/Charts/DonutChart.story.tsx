import React from 'react';
import { DonutChart } from './DonutChart';

export default { title: 'Charts/DonutChart', component: DonutChart };

export function Showcase() {
  return (
    <DonutChart
      data={[
        { label: 'Direct', value: 420 },
        { label: 'Organic', value: 310 },
        { label: 'Referral', value: 160 },
        { label: 'Social', value: 110 }
      ]}
      centerLabel="Total"
      ariaLabel="Traffic sources"
    />
  );
}

export function CustomCenter() {
  return (
    <DonutChart
      size={220}
      thickness={28}
      data={[
        { label: 'Active', value: 78, color: '#00d68f' },
        { label: 'Inactive', value: 22, color: '#8f9bb3' }
      ]}
      centerValue="78%"
      ariaLabel="Active users"
    />
  );
}
