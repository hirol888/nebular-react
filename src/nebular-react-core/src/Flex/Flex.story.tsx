import React from 'react';
import { Flex } from './Flex';

export default { title: 'Flex', component: Flex };

const boxStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
  border: '1px solid var(--border-basic-color-3, #e4e9f2)',
  color: 'var(--text-basic-color, #222b45)'
};

export function Row() {
  return (
    <Flex gap="sm">
      <div style={boxStyle}>One</div>
      <div style={boxStyle}>Two</div>
      <div style={boxStyle}>Three</div>
    </Flex>
  );
}

export function Inline() {
  return (
    <p>
      Status:{' '}
      <Flex inline gap="xs" align="center">
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00d68f' }} />
        <span>Online</span>
      </Flex>
    </p>
  );
}

export function Wrapping() {
  return (
    <Flex gap="sm" wrap="wrap" style={{ maxWidth: 320 }}>
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} style={boxStyle}>
          Item {index + 1}
        </div>
      ))}
    </Flex>
  );
}
