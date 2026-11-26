import React from 'react';
import { WaffleChart } from './WaffleChart';

export default { title: 'Charts/WaffleChart', component: WaffleChart };

const data = [
  { label: 'Direct', value: 44, color: '#3366ff' },
  { label: 'Organic', value: 31, color: '#00d68f' },
  { label: 'Referral', value: 15, color: '#ffaa00' },
  { label: 'Social', value: 10, color: '#ff3d71' }
];

export function Showcase() {
  return <WaffleChart data={data} ariaLabel="Traffic sources" />;
}

export function CustomGrid() {
  return (
    <WaffleChart
      data={data}
      rows={8}
      columns={14}
      ariaLabel="Traffic sources on a larger grid"
      valueFormatter={(value: number) => `${value}%`}
      onCellClick={(datum) => {
        // eslint-disable-next-line no-console
        console.log(datum.label);
      }}
    />
  );
}

export function Empty() {
  return <WaffleChart data={[]} ariaLabel="Empty waffle chart" />;
}
