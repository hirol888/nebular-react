import { NbCard, NbCardHeader, NbList, NbListItem } from '@nebular-react';
import './simple-list-showcase.scoped.scss';

export function SimpleListShowcase() {
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

  return (
    <NbCard size="medium">
      <NbCardHeader>Some fruits</NbCardHeader>
      <NbList>
        {fruits.map((fruit) => {
          return <NbListItem>{fruit}</NbListItem>;
        })}
      </NbList>
    </NbCard>
  );
}
