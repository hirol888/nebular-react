import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MultiSelect, MultiSelectGroup, MultiSelectItem } from './MultiSelect';

export default { title: 'MultiSelect', component: MultiSelect };

const fruits = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango', disabled: true }
];

const groupedFruits: MultiSelectGroup[] = [
  {
    type: 'group',
    label: 'Citrus',
    options: [
      { label: 'Orange', value: 'orange' },
      { label: 'Lemon', value: 'lemon' },
      { label: 'Lime', value: 'lime' }
    ]
  },
  {
    type: 'group',
    label: 'Berries',
    options: [
      { label: 'Strawberry', value: 'strawberry' },
      { label: 'Blueberry', value: 'blueberry' },
      { label: 'Raspberry', value: 'raspberry', disabled: true }
    ]
  },
  {
    type: 'group',
    label: 'Tropical',
    disabled: true,
    options: [
      { label: 'Pineapple', value: 'pineapple' },
      { label: 'Mango', value: 'mango' }
    ]
  }
];

export function Basic() {
  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={fruits}
        label="Fruits"
        description="Pick as many fruits as you like"
        placeholder="Select fruits"
        defaultValue={['apple']}
      />
    </div>
  );
}

export function SearchableAndClearable() {
  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={fruits}
        label="Fruits"
        placeholder="Search and select"
        searchable
        clearable
        nothingFoundMessage="No fruit matches your search"
        maxValues={3}
      />
    </div>
  );
}

export function Controlled() {
  const [value, setValue] = useState<string[]>(['banana']);

  return (
    <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 360 }}>
      <MultiSelect
        data={fruits}
        label="Fruits"
        placeholder="Select fruits"
        value={value}
        onChange={setValue}
        clearable
      />
      <code>value: {JSON.stringify(value)}</code>
    </div>
  );
}

export function Grouped() {
  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={groupedFruits}
        label="Fruits"
        description="Options grouped by category"
        placeholder="Select fruits"
        searchable
        clearable
        defaultValue={['orange']}
      />
    </div>
  );
}

export function AsyncSearch() {
  const allOptions = useMemo(
    () =>
      Array.from({ length: 40 }, (_item, index) => ({
        label: `Option ${index + 1}`,
        value: String(index + 1)
      })),
    []
  );

  const [options, setOptions] = useState<MultiSelectItem[]>(() => allOptions.slice(0, 10));
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const handleSearch = (query: string) => {
    setLoading(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setOptions(
        allOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
      );
      setLoading(false);
    }, 400);
  };

  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={options}
        label="Async fruits"
        description="Results are filtered by a fake remote search"
        placeholder="Type to search"
        searchable
        clearable
        loading={loading}
        onSearchChange={handleSearch}
        nothingFoundMessage="No results"
      />
    </div>
  );
}

export function Virtualized() {
  const data = useMemo(
    () =>
      Array.from({ length: 1000 }, (_item, index) => ({
        label: `Option ${index + 1}`,
        value: String(index + 1)
      })),
    []
  );

  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={data}
        label="Large list"
        description="Only the visible rows are rendered"
        placeholder="Select options"
        searchable
        clearable
        virtualized
        virtualizedMaxHeight={320}
        itemHeight={36}
        overscan={5}
      />
    </div>
  );
}

export function RenderOption() {
  return (
    <div style={{ maxWidth: 360 }}>
      <MultiSelect
        data={fruits}
        label="Fruits"
        description="Custom option content keeps the accessible label"
        placeholder="Select fruits"
        searchable
        clearable
        renderOption={(option) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span aria-hidden="true">{option.label.slice(0, 1)}</span>
            <strong>{option.label}</strong>
          </span>
        )}
      />
    </div>
  );
}
