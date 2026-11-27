import React, { useState } from 'react';
import { ColorSwatch } from './ColorSwatch';

export default { title: 'ColorSwatch', component: ColorSwatch };

const palette = ['#3366ff', '#00d68f', '#ffaa00', '#ff3d71', '#8f9bb3', 'transparent'];

export function Showcase() {
  const [color, setColor] = useState('#3366ff');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {palette.map((item) => (
          <ColorSwatch
            key={item}
            color={item}
            checked={item === color}
            ariaLabel={`Select ${item}`}
            onClick={() => setColor(item)}
          />
        ))}
      </div>
      <span>Selected: {color}</span>
    </div>
  );
}

export function SizesAndRadius() {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <ColorSwatch color="#3366ff" size={20} radius="sm" ariaLabel="Small" />
      <ColorSwatch color="#3366ff" size={28} radius="md" ariaLabel="Medium" />
      <ColorSwatch color="#3366ff" size={40} radius="xl" ariaLabel="Large" />
      <ColorSwatch color="#3366ff" size={32} radius={16} withBorder={false} ariaLabel="Custom" />
    </div>
  );
}
