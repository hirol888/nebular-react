import React from 'react';
import { Container } from './Container';

export default { title: 'Container', component: Container };

const boxStyle: React.CSSProperties = {
  padding: '1rem',
  borderRadius: '0.25rem',
  backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
  border: '1px dashed var(--border-basic-color-3, #e4e9f2)',
  color: 'var(--text-basic-color, #222b45)',
  textAlign: 'center'
};

export function Sizes() {
  return (
    <div>
      {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((size) => (
        <Container key={size} size={size} padding="sm">
          <div style={boxStyle}>size: {size}</div>
        </Container>
      ))}
    </div>
  );
}

export function Padding() {
  return (
    <Container padding="xl">
      <div style={boxStyle}>Container with extra large padding</div>
    </Container>
  );
}

export function NotCentered() {
  return (
    <Container size="sm" centered={false}>
      <div style={boxStyle}>Aligned to the start of the viewport</div>
    </Container>
  );
}
