import React from 'react';
import { Card } from '../Card';
import { AspectRatio } from './AspectRatio';

export default { title: 'AspectRatio', component: AspectRatio };

const boxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  borderRadius: 'var(--card-border-radius, 0.25rem)',
  backgroundColor: 'var(--background-basic-color-3, #edf1f7)',
  color: 'var(--text-hint-color, #8f9bb3)',
  fontSize: '1.25rem'
};

export function Showcase() {
  return (
    <>
      <Card>
        <Card.Body>
          <p>16 / 9</p>
          <AspectRatio ratio={16 / 9}>
            <div style={boxStyle}>16 / 9</div>
          </AspectRatio>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>1 / 1</p>
          <AspectRatio ratio={1}>
            <div style={boxStyle}>1 / 1</div>
          </AspectRatio>
        </Card.Body>
      </Card>
    </>
  );
}
