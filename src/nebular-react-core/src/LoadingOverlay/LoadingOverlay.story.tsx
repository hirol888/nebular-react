import React, { useState } from 'react';
import { Button } from '../Button';
import { LoadingOverlay } from './LoadingOverlay';

export default { title: 'LoadingOverlay', component: LoadingOverlay };

export function Showcase() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button size="small" onClick={() => setVisible((current) => !current)}>
        {visible ? 'Hide overlay' : 'Show overlay'}
      </Button>
      <LoadingOverlay visible={visible} message="Loading dashboard">
        <div style={{ padding: '2rem', border: '1px solid #e4e9f2', borderRadius: 8 }}>
          Dashboard content behind the overlay
        </div>
      </LoadingOverlay>
    </div>
  );
}

export function WithoutBlur() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button size="small" onClick={() => setVisible((current) => !current)}>
        {visible ? 'Hide overlay' : 'Show overlay'}
      </Button>
      <LoadingOverlay visible={visible} message="Syncing records" blur={0} opacity={0.9}>
        <div style={{ padding: '2rem', border: '1px solid #e4e9f2', borderRadius: 8 }}>
          Records stay readable while the sync finishes
        </div>
      </LoadingOverlay>
    </div>
  );
}

export function MessageOnly() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button size="small" onClick={() => setVisible((current) => !current)}>
        {visible ? 'Stop loading' : 'Start loading'}
      </Button>
      <LoadingOverlay visible={visible} message="Preparing the report" />
      <span>{visible ? 'Report is being prepared' : 'Report ready'}</span>
    </div>
  );
}
