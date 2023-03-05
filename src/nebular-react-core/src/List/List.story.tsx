import React from 'react';
import { List } from './List';

export default { title: 'List' };

const fruits: string[] = [
  'Lemons',
  'Raspberries',
  'Strawberries',
  'Blackberries',
  'Kiwis',
  'Grapefruit',
  'Avocado',
  'Watermelon',
  'Cantaloupe',
  'Oranges',
  'Peaches'
];

export function SimpleListShowcase() {
  return (
    <List>
      {fruits.map((fruit, index) => (
        <List.Item key={index}>{fruit}</List.Item>
      ))}
    </List>
  );
}
