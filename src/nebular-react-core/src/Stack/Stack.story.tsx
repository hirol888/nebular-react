import React from 'react';
import { Stack } from './Stack';

export default { title: 'Stack', component: Stack };

const boxStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
  border: '1px solid var(--border-basic-color-3, #e4e9f2)',
  color: 'var(--text-basic-color, #222b45)'
};

export function Column() {
  return (
    <Stack gap="md">
      <div style={boxStyle}>First item</div>
      <div style={boxStyle}>Second item</div>
      <div style={boxStyle}>Third item</div>
    </Stack>
  );
}

export function Row() {
  return (
    <Stack direction="row" gap="sm">
      <div style={boxStyle}>One</div>
      <div style={boxStyle}>Two</div>
      <div style={boxStyle}>Three</div>
    </Stack>
  );
}

export function Alignment() {
  return (
    <Stack direction="row" align="center" justify="space-between" gap="lg" wrap="wrap">
      <div style={boxStyle}>Start</div>
      <div style={{ ...boxStyle, paddingBlock: '1.5rem' }}>Center</div>
      <div style={boxStyle}>End</div>
    </Stack>
  );
}
