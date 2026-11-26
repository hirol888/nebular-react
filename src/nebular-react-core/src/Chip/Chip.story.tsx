import React, { useState } from 'react';
import { Chip, ChipGroup } from './Chip';

export default { title: 'Chip', component: Chip };

const tags = [
  'React',
  'TypeScript',
  'Nebular',
  { value: 'disabled', label: 'Disabled', disabled: true }
];

export function Showcase() {
  const [value, setValue] = useState<string[]>(['React']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ChipGroup
        label="Technologies"
        description="Select every technology you use"
        data={tags}
        multiple
        value={value}
        onChange={(next) => setValue(next as string[])}
      />

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Chip defaultChecked>Default</Chip>
        <Chip variant="outline" status="success">
          Outline
        </Chip>
        <Chip variant="light" status="warning">
          Light
        </Chip>
        <Chip status="danger" disabled>
          Disabled
        </Chip>
      </div>
    </div>
  );
}

export function SingleSelection() {
  const [value, setValue] = useState('medium');

  return (
    <ChipGroup
      label="Plan"
      data={['small', 'medium', 'large']}
      value={value}
      onChange={(next) => setValue(next as string)}
      required
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <Chip size="sm" defaultChecked>
        Small
      </Chip>
      <Chip size="md" defaultChecked>
        Medium
      </Chip>
      <Chip size="lg" defaultChecked>
        Large
      </Chip>
    </div>
  );
}
