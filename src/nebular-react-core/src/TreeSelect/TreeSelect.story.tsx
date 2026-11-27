import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { TreeSelect } from './TreeSelect';
import type { TreeSelectNode } from './TreeSelect';

export default { title: 'TreeSelect', component: TreeSelect };

const data: TreeSelectNode[] = [
  {
    value: 'fruits',
    label: 'Fruits',
    children: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry', disabled: true }
    ]
  },
  {
    value: 'vegetables',
    label: 'Vegetables',
    children: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'potato', label: 'Potato' }
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
  const [value, setValue] = useState<string | null>('apple');

  return (
    <ExampleItemsCol>
      <TreeSelect
        data={data}
        label="Category"
        description="Select a leaf category"
        placeholder="Select a category"
        value={value}
        onChange={setValue}
      />
      <span>Selected: {value ?? 'none'}</span>
    </ExampleItemsCol>
  );
}

export function Searchable() {
  return (
    <TreeSelect
      data={data}
      label="Searchable category"
      placeholder="Type to filter"
      searchable
      defaultExpandedValues={['fruits']}
      nothingFoundMessage="No categories found"
    />
  );
}

export function Clearable() {
  return (
    <TreeSelect
      data={data}
      label="Clearable category"
      placeholder="Select a category"
      defaultValue="carrot"
      clearable
    />
  );
}

export function Checkable() {
  const [checked, setChecked] = useState<string[]>(['apple', 'banana']);

  return (
    <ExampleItemsCol>
      <TreeSelect
        data={data}
        label="Categories"
        description="Select one or more categories"
        placeholder="Select categories"
        checkable
        clearable
        defaultExpandedValues={['fruits']}
        checkedValues={checked}
        onCheckedChange={setChecked}
      />
      <span>Checked: {checked.join(', ') || 'none'}</span>
    </ExampleItemsCol>
  );
}

export function AsyncLoading() {
  return (
    <TreeSelect
      data={[
        { value: 'remote-fruits', label: 'Fruits', hasChildren: true },
        { value: 'remote-vegetables', label: 'Vegetables', hasChildren: true }
      ]}
      label="Remote categories"
      placeholder="Select a category"
      loadingLabel="Loading categories"
      loadData={(node) =>
        new Promise<TreeSelectNode[]>((resolve) => {
          setTimeout(() => {
            resolve([
              { value: `${node.value}-first`, label: `${node.label} first` },
              { value: `${node.value}-second`, label: `${node.label} second` }
            ]);
          }, 600);
        })
      }
    />
  );
}
