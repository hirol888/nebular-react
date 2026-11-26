import React, { useEffect, useState } from 'react';
import { Button } from '../Button';
import { LoadingBar } from './LoadingBar';

export default { title: 'LoadingBar', component: LoadingBar };

export function Determinate() {
  const [value, setValue] = useState<number>(35);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
      <LoadingBar value={value} ariaLabel="Upload progress" />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button onClick={() => setValue((current) => Math.max(0, current - 10))}>-10%</Button>
        <Button onClick={() => setValue((current) => Math.min(100, current + 10))}>+10%</Button>
        <span>{value}%</span>
      </div>
    </div>
  );
}

export function Indeterminate() {
  return (
    <div style={{ paddingTop: '1rem' }}>
      <LoadingBar ariaLabel="Loading data" />
    </div>
  );
}

export function Inline() {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!loading) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setLoading(false), 2000);

    return () => window.clearTimeout(timeout);
  }, [loading]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '20rem' }}>
      <LoadingBar
        position="inline"
        height={6}
        loading={loading}
        color="#3366ff"
        ariaLabel="Section loading"
      />
      <span>{loading ? 'Loading section…' : 'Section loaded'}</span>
    </div>
  );
}
