import React, { useState } from 'react';
import { RangeSlider } from './RangeSlider';

export default { title: 'RangeSlider', component: RangeSlider };

export function Showcase() {
  const [value, setValue] = useState<[number, number]>([20, 80]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 420 }}>
      <RangeSlider label="Price" value={value} onChange={setValue} ariaLabel="Price range" />
      <span>
        Selected range: {value[0]} - {value[1]}
      </span>
    </div>
  );
}

export function Statuses() {
  const [success, setSuccess] = useState<[number, number]>([10, 45]);
  const [danger, setDanger] = useState<[number, number]>([55, 95]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 420 }}>
      <RangeSlider label="Safe zone" status="success" value={success} onChange={setSuccess} />
      <RangeSlider label="Alert zone" status="danger" value={danger} onChange={setDanger} />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 420 }}>
      <RangeSlider label="Locked range" defaultValue={[25, 75]} disabled />
      <RangeSlider
        label="Hidden values"
        defaultValue={[0, 100]}
        showValue={false}
        disabled
        ariaLabel="Hidden values range"
      />
    </div>
  );
}
