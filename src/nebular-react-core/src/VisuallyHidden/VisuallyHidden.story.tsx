import React from 'react';
import { Button } from '../Button';
import { VisuallyHidden } from './VisuallyHidden';

export default { title: 'VisuallyHidden', component: VisuallyHidden };

export function ScreenReaderOnly() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Button status="primary">Save</Button>
      <VisuallyHidden>Save the current document</VisuallyHidden>
      <span>Visible copy stays unchanged for sighted users.</span>
    </div>
  );
}

export function BlockElement() {
  return (
    <div>
      <p>Visible description.</p>
      <VisuallyHidden as="div">Extra context announced by screen readers only.</VisuallyHidden>
    </div>
  );
}

export function FocusableSkipLink() {
  return (
    <div style={{ padding: '1rem' }}>
      <VisuallyHidden focusable>
        <a href="#main-content">Skip to main content</a>
      </VisuallyHidden>
      <Button>Press Tab to reveal the skip link</Button>
      <p id="main-content">Main content target.</p>
    </div>
  );
}
