import React from 'react';
import { VirtualList } from './VirtualList';

export default { title: 'VirtualList', component: VirtualList };

const rows = Array.from({ length: 1000 }, (_, index) => `Row ${index + 1}`);

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '0 0.75rem',
  borderBottom: '1px solid #e4e9f2',
  fontSize: '0.8125rem'
};

export function Basic() {
  return (
    <VirtualList
      items={rows}
      height={240}
      itemHeight={32}
      renderItem={(item) => <div style={rowStyle}>{item}</div>}
    />
  );
}

export function WithEndReached() {
  const [items, setItems] = React.useState(() => rows.slice(0, 20));
  const pagesRef = React.useRef(1);

  const handleEndReached = () => {
    const nextPage = pagesRef.current;

    if (nextPage > 4) {
      return;
    }

    pagesRef.current += 1;
    setItems((current) => [...current, ...rows.slice(current.length, current.length + 20)]);
  };

  return (
    <VirtualList
      items={items}
      height={240}
      itemHeight={32}
      overscan={4}
      onEndReached={handleEndReached}
      ariaLabel="Lazy loaded rows"
      renderItem={(item, index) => <div style={rowStyle}>{`${index + 1}. ${item}`}</div>}
    />
  );
}

export function WithCustomKeys() {
  const people = React.useMemo(
    () =>
      Array.from({ length: 200 }, (_, index) => ({
        id: `person-${index}`,
        name: `Person ${index + 1}`
      })),
    []
  );

  return (
    <VirtualList
      items={people}
      height={200}
      itemHeight={28}
      getKey={(person) => person.id}
      renderItem={(person) => <div style={rowStyle}>{person.name}</div>}
    />
  );
}
