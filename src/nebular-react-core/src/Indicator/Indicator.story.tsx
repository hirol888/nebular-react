import React from 'react';
import { Button } from '../Button';
import { Card } from '../Card';
import { Indicator } from './Indicator';

export default { title: 'Indicator', component: Indicator };

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '2.5rem',
  padding: '1rem 0'
};

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <div style={rowStyle}>
          <Indicator label={5}>
            <Button>Inbox</Button>
          </Indicator>
          <Indicator label="99+">
            <Button>Notifications</Button>
          </Indicator>
          <Indicator label={0} showZero>
            <Button>Zero</Button>
          </Indicator>
        </div>
      </Card.Body>
    </Card>
  );
}

export function Dot() {
  return (
    <Card>
      <Card.Body>
        <div style={rowStyle}>
          <Indicator dot size={10}>
            <Button>Online</Button>
          </Indicator>
          <Indicator dot size={16} color="#00d68f">
            <Button>Available</Button>
          </Indicator>
        </div>
      </Card.Body>
    </Card>
  );
}

export function Positions() {
  return (
    <Card>
      <Card.Body>
        <div style={rowStyle}>
          <Indicator label={1} position="top-start">
            <Button>top-start</Button>
          </Indicator>
          <Indicator label={2} position="top-end">
            <Button>top-end</Button>
          </Indicator>
          <Indicator label={3} position="bottom-start">
            <Button>bottom-start</Button>
          </Indicator>
          <Indicator label={4} position="bottom-end">
            <Button>bottom-end</Button>
          </Indicator>
        </div>
      </Card.Body>
    </Card>
  );
}
