import React from 'react';
import { Kbd } from './Kbd';

export default { title: 'Kbd', component: Kbd };

export function Showcase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Pressione</span>
        <Kbd>Ctrl</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
        <span>para abrir a busca.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Kbd size="small">Esc</Kbd>
        <Kbd size="medium">Enter</Kbd>
        <Kbd size="small">Shift</Kbd>
        <Kbd size="medium">Cmd</Kbd>
      </div>
    </div>
  );
}
