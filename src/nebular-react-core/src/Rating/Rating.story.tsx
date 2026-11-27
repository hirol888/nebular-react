import React, { useState } from 'react';
import { Rating } from './Rating';

export default { title: 'Rating', component: Rating };

export function Showcase() {
  const [value, setValue] = useState(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating aria-label="Product rating" value={value} onChange={setValue} />
      <span>Rating: {value} of 5</span>
    </div>
  );
}

export function CustomCount() {
  const [value, setValue] = useState(7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Rating
        aria-label="Satisfaction score"
        value={value}
        onChange={setValue}
        count={10}
        size={20}
        color="#3366ff"
      />
      <span>Score: {value} of 10</span>
    </div>
  );
}

export function ReadOnly() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Rating aria-label="Average rating" defaultValue={4} readOnly />
      <Rating aria-label="Disabled rating" defaultValue={2} disabled />
      <span>Read-only and disabled ratings do not change on interaction</span>
    </div>
  );
}
