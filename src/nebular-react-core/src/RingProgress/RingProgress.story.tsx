import React from 'react';
import { RingProgress } from './RingProgress';

export default { title: 'RingProgress', component: RingProgress };

export function Showcase() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '2rem'
      }}
    >
      <RingProgress value={72} label="72%" ariaLabel="Storage used" />
      <RingProgress
        value={45}
        status="success"
        roundCaps
        label={
          <div>
            <strong>45%</strong>
            <div style={{ fontSize: '0.7em', fontWeight: 400 }}>completed</div>
          </div>
        }
        ariaLabel="Tasks completed"
      />
      <RingProgress
        sections={[
          { value: 40, color: 'var(--color-primary-500, #3366ff)' },
          { value: 25, color: 'var(--color-success-500, #00d68f)' },
          { value: 15, color: 'var(--color-warning-500, #ffaa00)' }
        ]}
        label="3/5"
        ariaLabel="Workspace usage by team"
      />
      <RingProgress value={0} size={80} thickness={8} ariaLabel="Empty progress" />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <RingProgress value={25} size={64} thickness={6} ariaLabel="Small" />
      <RingProgress value={50} size={96} thickness={9} ariaLabel="Medium" />
      <RingProgress value={75} size={140} thickness={14} ariaLabel="Large" />
    </div>
  );
}
