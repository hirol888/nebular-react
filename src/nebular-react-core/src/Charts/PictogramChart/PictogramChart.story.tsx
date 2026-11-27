import React from 'react';
import { PictogramChart } from './PictogramChart';

export default { title: 'Charts/PictogramChart', component: PictogramChart };

const data = [
  { label: 'Direct', value: 44, color: '#3366ff' },
  { label: 'Organic', value: 31, color: '#00d68f' },
  { label: 'Referral', value: 15, color: '#ffaa00' },
  { label: 'Social', value: 10, color: '#ff3d71' }
];

function PersonIcon() {
  return (
    <g>
      <circle cx={16} cy={11} r={6} />
      <rect x={5} y={19} width={22} height={13} rx={6.5} />
    </g>
  );
}

export function Showcase() {
  return <PictogramChart data={data} ariaLabel="Traffic sources" />;
}

export function CustomIcons() {
  return (
    <PictogramChart
      data={data.map((item) => ({ ...item, icon: <PersonIcon /> }))}
      maxUnits={20}
      columns={10}
      ariaLabel="Traffic sources per person"
      valueFormatter={(value: number) => `${value}%`}
      onItemClick={(datum) => {
        // eslint-disable-next-line no-console
        console.log(datum.label);
      }}
    />
  );
}

export function Empty() {
  return <PictogramChart data={[]} ariaLabel="Empty pictogram chart" />;
}
