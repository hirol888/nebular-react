import React, { useState } from 'react';
import { Button } from '../Button';
import { ExampleItemsCol, OptionInternal, OptionGroup } from '../Shared';
import { Autocomplete } from './Autocomplete';

export default { title: 'Autocomplete' };

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
