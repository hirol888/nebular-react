import React, { useState } from 'react';
import { Button } from '../Button';
import { ExampleItemsCol, OptionInternal, OptionGroup } from '../Shared';
import { Autocomplete } from './Autocomplete';

export default { title: 'Autocomplete', component: Autocomplete };

const initialData = [
  'Apple',
  'Orange',
  'Banana',
  'Mango',
  'Cherry',
  'Grape',
  'Lemon',
  'Plum',
  'Pear',
  'Strawberry',
  'Peach',
  'Raspberry'
];

export function Showcase() {
  const [data, setData] = useState<string[]>(initialData);

  const inputChangeHandler = (value: string) => {
    const newData = initialData.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    setData(newData);
  };

  return (
    <Autocomplete data={data} placeholder="Enter value" type="text" onChange={inputChangeHandler} />
  );
}

export function ActiveFirst() {
  const [data, setData] = useState<string[]>(initialData);

  const inputChangeHandler = (value: string) => {
    const newData = initialData.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    setData(newData);
  };

  return (
    <Autocomplete
      data={data}
      placeholder="Enter value"
      type="text"
      activeFirst
      onChange={inputChangeHandler}
    />
  );
}

export function LocalFilter() {
  return (
    <Autocomplete
      data={initialData}
      placeholder="Type to filter"
      aria-label="Type to filter"
      type="text"
    />
  );
}

export function Virtualized() {
  const longData = Array.from({ length: 1000 }, (_, index) => `Option ${index}`);

  return (
    <Autocomplete
      data={longData}
      placeholder="Virtualized autocomplete"
      aria-label="Virtualized autocomplete"
      type="text"
      virtualized
      virtualizedMaxHeight={320}
    />
  );
}

export function AsyncSearch() {
  const [data, setData] = useState<string[]>(initialData);
  const [loading, setLoading] = useState(false);

  const handleSearch = (query: string) => {
    setLoading(true);

    setTimeout(() => {
      setData(initialData.filter((item) => item.toLowerCase().includes(query.toLowerCase())));
      setLoading(false);
    }, 300);
  };

  return (
    <Autocomplete
      data={data}
      placeholder="Async search"
      aria-label="Async search"
      type="text"
      loading={loading}
      onSearchChange={handleSearch}
    />
  );
}

export function Empty() {
  return (
    <Autocomplete
      data={[]}
      placeholder="Empty"
      aria-label="Empty"
      type="text"
      nothingFoundMessage="Nothing found"
    />
  );
}

export function CustomDisplay() {
  const [data, setData] = useState<string[]>(initialData);

  const inputChangeHandler = (value: string) => {
    const newData = initialData.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    setData(newData);
  };

  return (
    <Autocomplete
      data={data}
      placeholder="Enter value"
      type="text"
      displayFn={(value) => value.toUpperCase()}
      onChange={inputChangeHandler}
    />
  );
}

const fruitDescriptions: Record<string, string> = {
  Apple: 'Crisp and sweet',
  Orange: 'Citrus favorite',
  Banana: 'Rich in potassium',
  Mango: 'Tropical treat',
  Cherry: 'Sweet and tart',
  Grape: 'Great for snacking'
};

const optionAvatarStyle: React.CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-primary-transparent-300, rgba(51, 102, 255, 0.16))',
  borderRadius: '50%',
  color: 'var(--color-primary-500, #3366ff)',
  display: 'inline-flex',
  flex: '0 0 auto',
  fontSize: '0.75rem',
  fontWeight: 700,
  height: '2rem',
  justifyContent: 'center',
  width: '2rem'
};

export function RenderOption() {
  return (
    <Autocomplete
      data={initialData.slice(0, 6)}
      placeholder="Search a fruit"
      aria-label="Search a fruit"
      type="text"
      renderOption={(option) => (
        <span style={{ alignItems: 'center', display: 'flex', gap: '0.75rem' }}>
          <span style={optionAvatarStyle}>{option.value.charAt(0).toUpperCase()}</span>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{option.label}</strong>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
              {fruitDescriptions[option.value] ?? 'Fresh fruit'}
            </span>
          </span>
        </span>
      )}
    />
  );
}

export function Disabled() {
  const [data, setData] = useState<string[]>(initialData);
  const [disabled, setDisabled] = useState<boolean>(true);

  const inputChangeHandler = (value: string) => {
    const newData = initialData.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
    setData(newData);
  };

  return (
    <ExampleItemsCol>
      <Button onClick={() => setDisabled(!disabled)}>Toggle disabled</Button>
      <label>
        <span style={{ display: 'block', marginBottom: '0.5rem' }}>
          Disabled: <i>{disabled.toString()}</i>
        </span>
        <Autocomplete
          data={data}
          placeholder="Enter value"
          type="text"
          disabled={disabled}
          onChange={inputChangeHandler}
        />
      </label>
    </ExampleItemsCol>
  );
}

export function Group() {
  const groupData: (OptionInternal | OptionGroup)[] = [
    {
      type: 'group',
      label: 'Group 1',
      options: [
        { type: 'option', label: 'Apple', value: 'Apple' },
        { type: 'option', label: 'Orange', value: 'Orange' },
        { type: 'option', label: 'Banana', value: 'Banana', disabled: true },
        { type: 'option', label: 'Mango', value: 'Mango' }
      ]
    },
    {
      type: 'group',
      label: 'Group 2',
      disabled: true,
      options: [
        { type: 'option', label: 'Cherry', value: 'Cherry' },
        { type: 'option', label: 'Grape', value: 'Grape' },
        { type: 'option', label: 'Lemon', value: 'Lemon' },
        { type: 'option', label: 'Plum', value: 'Plum' }
      ]
    },
    {
      type: 'group',
      label: 'Group 3',
      options: [
        { type: 'option', label: 'Pear', value: 'Pear' },
        { type: 'option', label: 'Strawberry', value: 'Strawberry' },
        { type: 'option', label: 'Peach', value: 'Peach', disabled: true },
        { type: 'option', label: 'Raspberry', value: 'Raspberry' }
      ]
    }
  ];

  const [data, setData] = useState<(OptionInternal | OptionGroup)[]>(groupData);

  const inputChangeHandler = (value: string) => {
    const newData = groupData.filter((item) => {
      if (item.type === 'group') {
        item.options = item.options.filter((_item) =>
          _item.label.toLowerCase().includes(value.toLowerCase())
        );
        if (item.options.length > 0) {
          return true;
        }
        return false;
      }
      return item.label.toLowerCase().includes(value.toLowerCase());
    });
    setData(newData);
  };

  return (
    <Autocomplete placeholder="Enter value" type="text" data={data} onChange={inputChangeHandler} />
  );
}
