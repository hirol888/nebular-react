import React from 'react';
import { Card } from '../Card';
import { Badge } from './Badge';

export default { title: 'Badge' };

export function Showcase() {
  return (
    <Card>
      <Card.Header style={{ position: 'relative' }}>
        <Badge text="new" status="success" position="top right" />
        <Badge text="99+" status="danger" position="top left" />
      </Card.Header>
      <Card.Body>Card body.</Card.Body>
    </Card>
  );
}
