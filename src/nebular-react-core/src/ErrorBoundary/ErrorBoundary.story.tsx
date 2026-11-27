import React, { useState } from 'react';
import { Button } from '../Button';
import { ErrorBoundary } from './ErrorBoundary';

export default { title: 'ErrorBoundary', component: ErrorBoundary };

function Bomb() {
  const [explode, setExplode] = useState<boolean>(false);

  if (explode) {
    throw new Error('Storybook demo error');
  }

  return <Button onClick={() => setExplode(true)}>Trigger error</Button>;
}

export function DefaultFallback() {
  return (
    <ErrorBoundary>
      <Bomb />
    </ErrorBoundary>
  );
}

export function CustomFallback() {
  return (
    <ErrorBoundary
      fallback={
        <div role="alert" style={{ padding: '1rem', backgroundColor: '#fff5f5' }}>
          <strong>The widget could not be rendered.</strong>
        </div>
      }
    >
      <Bomb />
    </ErrorBoundary>
  );
}

export function FallbackWithReset() {
  return (
    <ErrorBoundary
      ariaLabel="Widget error"
      fallback={(error, reset) => (
        <div role="alert" style={{ padding: '1rem', backgroundColor: '#fff5f5' }}>
          <p style={{ margin: 0 }}>{error.message}</p>
          <Button size="small" onClick={reset}>
            Recover widget
          </Button>
        </div>
      )}
    >
      <Bomb />
    </ErrorBoundary>
  );
}
