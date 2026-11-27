import React from 'react';
import { Gauge } from './Gauge';

export default { title: 'Charts/Gauge', component: Gauge };

export function Showcase() {
  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Gauge value={72} ariaLabel="CPU usage" />
      <Gauge value={45} ariaLabel="Memory usage" color="#00d68f" />
      <Gauge value={91} ariaLabel="Disk usage" color="#ff3d71" size={220} thickness={18} />
    </div>
  );
}

export function WithLabel() {
  return (
    <Gauge
      value={64}
      label="Requests per second"
      valueFormatter={(value: number) => value.toLocaleString('en-US')}
      ariaLabel="Requests per second"
      size={220}
    />
  );
}
