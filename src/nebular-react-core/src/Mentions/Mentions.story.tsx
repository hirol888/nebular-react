import React, { useState } from 'react';
import { Mentions } from './Mentions';

const people = [
  { id: 'ana', label: 'Ana Silva' },
  { id: 'bruno', label: 'Bruno Costa' },
  { id: 'carla', label: 'Carla Dias' }
];

export default { title: 'Mentions', component: Mentions };

export function Basic() {
  return (
    <Mentions
      data={people}
      label="Comment"
      ariaLabel="Comment"
      placeholder="Type @ to mention someone"
    />
  );
}

export function CustomTrigger() {
  return (
    <Mentions
      data={people}
      trigger="#"
      label="Tags"
      ariaLabel="Tags"
      placeholder="Type # to reference a tag"
    />
  );
}

export function Controlled() {
  const [value, setValue] = useState('Hello @an');

  return (
    <Mentions
      value={value}
      onChange={setValue}
      data={people}
      label="Controlled comment"
      ariaLabel="Controlled comment"
      maxSuggestions={2}
    />
  );
}
