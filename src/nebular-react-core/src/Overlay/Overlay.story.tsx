import React, { useState } from 'react';
import { Button } from '../Button';
import { Overlay } from './Overlay';

export default { title: 'Overlay', component: Overlay };

export function Showcase() {
  const [visible, setVisible] = useState(true);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 220,
        overflow: 'hidden',
        borderRadius: 8,
        background: 'linear-gradient(135deg, #3366ff, #00d68f)'
      }}
    >
      <div style={{ padding: '2rem', color: '#fff' }}>Content behind the overlay</div>

      {visible && (
        <Overlay fixed={false} color="#101426" opacity={0.65} blur={2} center>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderRadius: 8,
              background: '#fff'
            }}
          >
            <strong>Unsaved changes</strong>
            <span>Do you want to keep editing?</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button size="small" status="primary" onClick={() => setVisible(false)}>
                Continue
              </Button>
              <Button size="small" status="basic" onClick={() => setVisible(false)}>
                Dismiss
              </Button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

export function OpacityAndColor() {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {[0.25, 0.5, 0.75].map((opacity) => (
        <div
          key={opacity}
          style={{
            position: 'relative',
            width: 140,
            height: 100,
            overflow: 'hidden',
            borderRadius: 8,
            background: '#edf1f7'
          }}
        >
          <Overlay
            fixed={false}
            opacity={opacity}
            color="#3366ff"
            ariaLabel={`Overlay ${opacity}`}
          />
        </div>
      ))}
    </div>
  );
}
