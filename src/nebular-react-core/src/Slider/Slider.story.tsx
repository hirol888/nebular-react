import React, { useState } from 'react';
import { Slider } from './Slider';

export default { title: 'Slider', component: Slider };

export function Showcase() {
  const [value, setValue] = useState(40);
  const [committed, setCommitted] = useState(40);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 420 }}>
      <Slider
        label="Opacity"
        value={value}
        onChange={setValue}
        onChangeEnd={setCommitted}
        ariaLabel="Opacity"
      />
      <span>
        Current: {value} - committed: {committed}
      </span>
    </div>
  );
}

export function Statuses() {
  const [primary, setPrimary] = useState(30);
  const [success, setSuccess] = useState(60);
  const [danger, setDanger] = useState(85);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 420 }}>
      <Slider label="Primary" status="primary" value={primary} onChange={setPrimary} />
      <Slider label="Success" status="success" value={success} onChange={setSuccess} />
      <Slider label="Danger" status="danger" value={danger} onChange={setDanger} />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 420 }}>
      <Slider label="Volume" defaultValue={70} disabled />
      <Slider label="Zoom" defaultValue={25} showValue={false} disabled />
    </div>
  );
}
