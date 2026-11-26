import React from 'react';
import { Masonry } from './Masonry';

export default { title: 'Masonry', component: Masonry };

const cards = [
  { title: 'Card one', height: 120 },
  { title: 'Card two', height: 180 },
  { title: 'Card three', height: 90 },
  { title: 'Card four', height: 150 },
  { title: 'Card five', height: 110 },
  { title: 'Card six', height: 200 },
  { title: 'Card seven', height: 80 }
];

const cardStyle = (height: number): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height,
  border: '1px solid var(--border-basic-color-3, #e4e9f2)',
  borderRadius: '0.375rem',
  backgroundColor: 'var(--background-basic-color-2, #f7f9fc)',
  color: 'var(--text-basic-color, #222b45)',
  fontSize: '0.8125rem',
  fontWeight: 600
});

export function Showcase() {
  return (
    <Masonry columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={16} ariaLabel="Gallery">
      {cards.map((card) => (
        <div key={card.title} style={cardStyle(card.height)}>
          {card.title}
        </div>
      ))}
    </Masonry>
  );
}

export function FixedColumns() {
  return (
    <Masonry columns={2} gap={24} ariaLabel="Two column gallery">
      {cards.map((card) => (
        <div key={card.title} style={cardStyle(card.height)}>
          {card.title}
        </div>
      ))}
    </Masonry>
  );
}

export function TightSpacing() {
  return (
    <Masonry columns={3} gap={4} ariaLabel="Compact gallery">
      {cards.map((card) => (
        <div key={card.title} style={cardStyle(card.height)}>
          {card.title}
        </div>
      ))}
    </Masonry>
  );
}
