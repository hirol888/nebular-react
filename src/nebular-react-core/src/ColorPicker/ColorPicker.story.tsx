import React, { useState } from 'react';
import { ColorPicker } from './ColorPicker';

export default { title: 'ColorPicker', component: ColorPicker };

export function Showcase() {
  const [color, setColor] = useState('#3366ff');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320 }}>
      <ColorPicker
        label="Accent color"
        ariaLabel="Accent color"
        value={color}
        onChange={setColor}
      />
      <span>Selected color: {color}</span>
    </div>
  );
}

export function CustomSwatches() {
  const [color, setColor] = useState('#00d68f');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320 }}>
      <ColorPicker
        label="Brand color"
        ariaLabel="Brand color"
        value={color}
        onChange={setColor}
        swatches={['#00d68f', '#0095ff', '#ffaa00', '#ff3d71']}
      />
      <span>Selected color: {color}</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 320 }}>
      <ColorPicker label="Locked color" ariaLabel="Locked color" defaultValue="#222b45" disabled />
    </div>
  );
}
