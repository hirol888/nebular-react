import React from 'react';
import { Sparkline } from './Sparkline';

export default { title: 'Charts/Sparkline', component: Sparkline };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 220 }}>
      <Sparkline data={[4, 8, 6, 12, 10, 15, 13, 18]} ariaLabel="Weekly active users" />
      <Sparkline data={[18, 14, 16, 11, 13, 9, 7]} area color="#ff3d71" ariaLabel="Error trend" />
    </div>
  );
}
