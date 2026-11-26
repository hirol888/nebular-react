import React, { useState } from 'react';
import { CheckboxGroup } from './CheckboxGroup';

export default { title: 'CheckboxGroup', component: CheckboxGroup };

const fruits = ['Apple', 'Banana', 'Orange'];

export function Showcase() {
  const [value, setValue] = useState<string[]>(['Apple']);

  return (
    <CheckboxGroup
      label="Fruits"
      description="Choose your favorite fruits"
      data={fruits}
      value={value}
      onChange={setValue}
      required
    />
  );
}

export function Horizontal() {
  return (
    <CheckboxGroup
      label="Fruits"
      orientation="horizontal"
      data={fruits}
      defaultValue={['Banana']}
    />
  );
}

export function Disabled() {
  return (
    <CheckboxGroup
      label="Fruits"
      description="This group is disabled"
      data={[
        { label: 'Apple', value: 'apple', disabled: true },
        { label: 'Banana', value: 'banana' },
        { label: 'Orange', value: 'orange' }
      ]}
      disabled
    />
  );
}
