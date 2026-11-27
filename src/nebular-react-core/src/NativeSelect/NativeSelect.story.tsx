import React, { useState } from 'react';
import { NativeSelect } from './NativeSelect';

export default { title: 'NativeSelect', component: NativeSelect };

const fruits = ['Apple', 'Banana', 'Orange'];

export function Showcase() {
  const [value, setValue] = useState('Banana');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 360 }}>
      <NativeSelect
        label="Favorite fruit"
        description="Rendered with the browser native select element."
        placeholder="Pick one"
        data={fruits}
        value={value}
        onChange={setValue}
        required
      />

      <NativeSelect label="Disabled" data={fruits} defaultValue="Apple" disabled />

      <NativeSelect label="With error" data={fruits} error="Please select a fruit" />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 360 }}>
      <NativeSelect label="Small" size="sm" data={fruits} />
      <NativeSelect label="Medium" size="md" data={fruits} />
      <NativeSelect label="Large" size="lg" data={fruits} />
    </div>
  );
}
