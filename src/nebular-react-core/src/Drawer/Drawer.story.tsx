import React, { useState } from 'react';
import { Button } from '../Button';
import { Drawer } from './Drawer';

export default { title: 'Drawer', component: Drawer };

export function Showcase() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open drawer</Button>
      <Drawer opened={opened} onClose={() => setOpened(false)} title="Filters">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span>Use the drawer to configure filters without leaving the page.</span>
          <Button size="small" onClick={() => setOpened(false)}>
            Apply filters
          </Button>
        </div>
      </Drawer>
    </>
  );
}

export function Positions() {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState<'left' | 'right' | 'top' | 'bottom'>('right');

  const openAt = (nextPosition: 'left' | 'right' | 'top' | 'bottom') => {
    setPosition(nextPosition);
    setOpened(true);
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {(['left', 'right', 'top', 'bottom'] as const).map((value) => (
        <Button key={value} onClick={() => openAt(value)}>
          Open {value}
        </Button>
      ))}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position={position}
        size={position === 'top' || position === 'bottom' ? 200 : 320}
        title={`${position} drawer`}
      >
        <p style={{ margin: 0 }}>This drawer opens from the {position} side of the viewport.</p>
      </Drawer>
    </div>
  );
}

export function Persistent() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open persistent drawer</Button>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Persistent drawer"
        withOverlay={false}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        size={360}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <span>This drawer only closes through its own controls.</span>
          <Button size="small" onClick={() => setOpened(false)}>
            Close drawer
          </Button>
        </div>
      </Drawer>
    </>
  );
}
