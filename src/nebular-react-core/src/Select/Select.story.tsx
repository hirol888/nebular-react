import React, { useState } from 'react';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { ExampleItemsCol, OptionGroup, Option } from '../Shared';
import { Select } from './Select';

export default { title: 'Select' };

const data: Option[] = [
  { type: 'option', label: 'Apple', value: 'Apple' },
  { type: 'option', label: 'Orange', value: 'Orange' },
  { type: 'option', label: 'Banana', value: 'Banana' },
  { type: 'option', label: 'Mango', value: 'Mango' },
  { type: 'option', label: 'Cherry', value: 'Cherry' },
  { type: 'option', label: 'Grape', value: 'Grape' },
  { type: 'option', label: 'Lemon', value: 'Lemon' },
  { type: 'option', label: 'Plum', value: 'Plum' },
  { type: 'option', label: 'Strawberry', value: 'Strawberry' },
  { type: 'option', label: 'Peach', value: 'Peach' },
  { type: 'option', label: 'Raspberry', value: 'Raspberry' }
];

export function Showcase() {
  return (
    <Select
      options={data}
      defaultSelected={{ type: 'option', label: 'Apple', value: 'Apple' }}
      placeholder="select"
    />
  );
}

export function Disabled() {
  const optionsDisabledData: Option[] = [
    { type: 'option', label: 'Option 0', value: '0' },
    { type: 'option', label: 'Option 1', value: '1' },
    { type: 'option', label: 'Option 2', value: '2', disabled: true },
    { type: 'option', label: 'Option 3', value: '3' },
    { type: 'option', label: 'Option 4', value: '4', disabled: true }
  ];
  return (
    <Card>
      <Card.Body>
        <ExampleItemsCol>
          <Select options={data} appearance="hero" placeholder="Disabled" disabled />
          <Select options={optionsDisabledData} placeholder="Disabled Options" />
        </ExampleItemsCol>
      </Card.Body>
    </Card>
  );
}

export function Filled() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="filled" />
      <Select options={data} placeholder="Info" status="info" appearance="filled" />
      <Select options={data} placeholder="Success" status="success" appearance="filled" />
      <Select options={data} placeholder="Warning" status="warning" appearance="filled" />
      <Select options={data} placeholder="Danger" status="danger" appearance="filled" />
    </ExampleItemsCol>
  );
}

export function Hero() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="hero" />
      <Select options={data} placeholder="Info" status="info" appearance="hero" />
      <Select options={data} placeholder="Success" status="success" appearance="hero" />
      <Select options={data} placeholder="Warning" status="warning" appearance="hero" />
      <Select options={data} placeholder="Danger" status="danger" appearance="hero" />
    </ExampleItemsCol>
  );
}

export function Outline() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Primary" status="primary" appearance="outline" />
      <Select options={data} placeholder="Info" status="info" appearance="outline" />
      <Select options={data} placeholder="Success" status="success" appearance="outline" />
      <Select options={data} placeholder="Warning" status="warning" appearance="outline" />
      <Select options={data} placeholder="Danger" status="danger" appearance="outline" />
    </ExampleItemsCol>
  );
}

export function Size() {
  return (
    <ExampleItemsCol>
      <Select options={data} placeholder="Tiny" size="tiny" />
      <Select options={data} placeholder="Small" size="small" />
      <Select options={data} placeholder="Medium" size="medium" />
      <Select options={data} placeholder="Large" size="large" />
      <Select options={data} placeholder="Giant" size="giant" />
    </ExampleItemsCol>
  );
}

export function Multiple() {
  return <Select options={data} placeholder="Multiple Select" multiple />;
}

export function Deselect() {
  return <Select options={data} placeholder="select" allowDeselect initiallyOpened />;
}

export function Group() {
  const groupData: (Option | OptionGroup)[] = [
    {
      type: 'group',
      label: 'Group 1',
      options: [
        { type: 'option', label: 'Option 11', value: '11' },
        { type: 'option', label: 'Option 12', value: '12' },
        { type: 'option', label: 'Option 13', value: '13', disabled: true },
        { type: 'option', label: 'Option 14', value: '14' }
      ]
    },
    {
      type: 'group',
      label: 'Group 2',
      disabled: true,
      options: [
        { type: 'option', label: 'Option 21', value: '21' },
        { type: 'option', label: 'Option 22', value: '22' },
        { type: 'option', label: 'Option 23', value: '23' },
        { type: 'option', label: 'Option 24', value: '24' }
      ]
    },
    {
      type: 'group',
      label: 'Group 3',
      options: [
        { type: 'option', label: 'Option 31', value: '31' },
        { type: 'option', label: 'Option 32', value: '32' },
        { type: 'option', label: 'Option 33', value: '33', disabled: true },
        { type: 'option', label: 'Option 34', value: '34' }
      ]
    }
  ];

  return <Select options={groupData} placeholder="Select Groups" />;
}

export function CustomLabel() {
  const [selectedValue, setSelectedValue] = useState<string>(null);

  const handler = (selectedOptions: Option[]) => {
    setSelectedValue(selectedOptions.length > 0 ? selectedOptions[0].value : null);
  };

  return (
    <Select
      options={data}
      placeholder="Custom Label"
      allowDeselect
      onSelect={handler}
      customLabel={<div>Selected: {selectedValue}</div>}
    />
  );
}

export function WithIcon() {
  return <Select options={data} placeholder="With Icon" icon={<Icon icon="star" />} />;
}
