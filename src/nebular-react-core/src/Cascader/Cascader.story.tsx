import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { Cascader } from './Cascader';
import type { CascaderOption } from './Cascader';

export default { title: 'Cascader', component: Cascader };

const options: CascaderOption[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' }
    ]
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    children: [
      {
        value: 'carrot',
        label: 'Carrot',
        children: [{ value: 'orange-carrot', label: 'Orange Carrot' }]
      },
      { value: 'potato', label: 'Potato', disabled: true }
    ]
  },
  {
    value: 'grains',
    label: 'Grains',
    children: [
      { value: 'rice', label: 'Rice' },
      { value: 'wheat', label: 'Wheat' }
    ]
  }
];

export function Showcase() {
  const [value, setValue] = useState<string[]>(['vegetables', 'carrot', 'orange-carrot']);

  return (
    <ExampleItemsCol>
      <Cascader
        options={options}
        label="Product"
        description="Select a product path"
        placeholder="Select a product"
        value={value}
        onChange={setValue}
      />
      <span>Selected: {value.length > 0 ? value.join(' / ') : 'none'}</span>
    </ExampleItemsCol>
  );
}

export function ChangeOnSelect() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <Cascader
      options={options}
      label="Change on select"
      placeholder="Select any level"
      changeOnSelect
      clearable
      value={value}
      onChange={setValue}
    />
  );
}

export function Searchable() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <ExampleItemsCol>
      <Cascader
        options={options}
        label="Searchable"
        description="Type to filter options by label"
        placeholder="Select a product"
        searchable
        clearable
        value={value}
        onChange={setValue}
      />
      <span>Selected: {value.length > 0 ? value.join(' / ') : 'none'}</span>
    </ExampleItemsCol>
  );
}

const asyncOptions: CascaderOption[] = [
  { value: 'reports', label: 'Reports', hasChildren: true },
  { value: 'users', label: 'Users', hasChildren: true }
];

const asyncChildren: Record<string, CascaderOption[]> = {
  reports: [
    { value: 'sales', label: 'Sales report' },
    { value: 'inventory', label: 'Inventory report' }
  ],
  users: [
    { value: 'admins', label: 'Administrators' },
    { value: 'guests', label: 'Guests' }
  ]
};

const loadAsyncOptions = (option: CascaderOption): Promise<CascaderOption[]> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(asyncChildren[option.value] ?? []), 700);
  });

export function AsyncLoading() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <ExampleItemsCol>
      <Cascader
        options={asyncOptions}
        label="Async loading"
        description="Children are loaded when a node is expanded"
        placeholder="Select a report"
        loadData={loadAsyncOptions}
        clearable
        value={value}
        onChange={setValue}
      />
      <span>Selected: {value.length > 0 ? value.join(' / ') : 'none'}</span>
    </ExampleItemsCol>
  );
}
