import React from 'react';
import { FloatButton } from './FloatButton';

export default { title: 'FloatButton', component: FloatButton };

export function Basic() {
  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <p>The action stays fixed to the bottom end corner of the viewport.</p>
      <FloatButton icon={<span>+</span>} label="Compose" onClick={() => {}} />
    </div>
  );
}

export function ShapesAndSizes() {
  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <FloatButton
        icon={<span>+</span>}
        position="bottom-start"
        shape="square"
        size="sm"
        ariaLabel="Small square action"
      />
      <FloatButton
        icon={<span>★</span>}
        position="bottom-end"
        shape="circle"
        size="lg"
        badge={5}
        ariaLabel="Favorites"
      />
    </div>
  );
}

export function AsLink() {
  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <p>The floating action can behave as a regular link.</p>
      <FloatButton href="https://example.com" target="_blank" label="Docs" position="top-end" />
    </div>
  );
}
