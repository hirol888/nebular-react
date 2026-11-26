import React from 'react';
import { Watermark } from './Watermark';

export default { title: 'Watermark', component: Watermark };

const panelStyle: React.CSSProperties = {
  minHeight: 240,
  padding: '1.5rem',
  border: '1px solid #e4e9f2',
  borderRadius: 8
};

export function Basic() {
  return (
    <Watermark text="Nebular">
      <div style={panelStyle}>
        <h3>Quarterly report</h3>
        <p>This content is protected by a repeated watermark overlay.</p>
      </div>
    </Watermark>
  );
}

export function CustomStyle() {
  return (
    <Watermark
      text="Draft"
      fontSize={20}
      color="rgba(255, 0, 0, 0.2)"
      rotate={45}
      gapX={80}
      gapY={80}
      zIndex={2}
    >
      <div style={panelStyle}>
        <h3>Draft document</h3>
        <p>Custom font size, color, rotation and spacing.</p>
      </div>
    </Watermark>
  );
}

export function Dense() {
  return (
    <Watermark text="Confidential" gapX={60} gapY={60} fontSize={12} opacity={0.5}>
      <div style={panelStyle}>
        <h3>Confidential notes</h3>
        <p>A denser watermark pattern for highly sensitive content.</p>
      </div>
    </Watermark>
  );
}
