import React, { useState } from 'react';
import { SegmentedControl } from './SegmentedControl';

export default { title: 'SegmentedControl', component: SegmentedControl };

export function Showcase() {
  const [value, setValue] = useState('list');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SegmentedControl
        ariaLabel="Layout mode"
        value={value}
        onChange={setValue}
        data={[
          { label: 'List', value: 'list' },
          { label: 'Grid', value: 'grid' },
          { label: 'Board', value: 'board' }
        ]}
      />
      <span>Selected layout: {value}</span>
    </div>
  );
}

export function Sizes() {
  const [value, setValue] = useState('medium');
  const sizes = ['small', 'medium', 'large'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 420 }}>
      {sizes.map((size) => (
        <SegmentedControl
          key={size}
          ariaLabel={`${size} segmented control`}
          size={size}
          fullWidth
          value={value}
          onChange={setValue}
          data={['Day', 'Week', 'Month']}
        />
      ))}
      <span>Selected period: {value}</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SegmentedControl
        ariaLabel="Disabled segmented control"
        disabled
        defaultValue="grid"
        data={['List', 'Grid']}
      />
      <SegmentedControl
        ariaLabel="Partially disabled segmented control"
        defaultValue="draft"
        data={[
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Archived', value: 'archived', disabled: true }
        ]}
      />
    </div>
  );
}
