import React from 'react';
import { Divider } from './Divider';

export default { title: 'Divider', component: Divider };

export function Showcase() {
  return (
    <div>
      <Divider aria-label="Section without label" />
      <Divider aria-label="Section label on the left" label="Section" labelPosition="left" />
      <Divider aria-label="Section label centered" label="Centered section" />
      <Divider
        aria-label="Section label on the right"
        label="Another section"
        labelPosition="right"
      />
    </div>
  );
}

export function Vertical() {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: 120 }}>
      <span>Inbox</span>
      <Divider orientation="vertical" aria-label="Inbox separator" />
      <span>Archive</span>
      <Divider orientation="vertical" aria-label="Archive separator" />
      <span>Trash</span>
    </div>
  );
}

export function CustomSizeAndColor() {
  return (
    <div>
      <Divider aria-label="Thick divider" size={4} color="#3366ff" />
      <Divider aria-label="Labeled divider" label="Custom color" size={2} color="#00d68f" />
      <div style={{ display: 'flex', alignItems: 'stretch', height: 80 }}>
        <span>Left</span>
        <Divider
          orientation="vertical"
          aria-label="Vertical thick divider"
          size={3}
          color="#ff3d71"
        />
        <span>Right</span>
      </div>
    </div>
  );
}
