import React, { useState } from 'react';
import { Button } from '../Button';
import { Portal } from './Portal';

export default { title: 'Portal', component: Portal };

export function Showcase() {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setVisible((current) => !current)}>
        {visible ? 'Hide portaled content' : 'Show portaled content'}
      </Button>
      <span>The content below is rendered into the default overlay container.</span>
      {visible && (
        <Portal>
          <div
            role="status"
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              backgroundColor: '#3366ff',
              color: '#ffffff'
            }}
          >
            Portaled content is mounted outside this component tree.
          </div>
        </Portal>
      )}
    </div>
  );
}

export function TargetContainer() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setVisible((current) => !current)}>
        {visible ? 'Hide target content' : 'Show target content'}
      </Button>
      <div
        ref={setContainer}
        aria-label="Portal target container"
        style={{
          minHeight: 80,
          padding: '0.75rem',
          border: '1px dashed #c5cee0',
          borderRadius: 8
        }}
      >
        <span>Portal target</span>
        {visible && container && (
          <Portal target={container}>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
              This content is portaled into the dashed container.
            </div>
          </Portal>
        )}
      </div>
    </div>
  );
}
