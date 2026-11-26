import React, { useState } from 'react';
import { Textarea } from './Textarea';

export default { title: 'Textarea', component: Textarea };

export function Showcase() {
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 420 }}>
      <Textarea
        aria-label="Description"
        placeholder="Write a description"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        minRows={3}
        autosize
        fullWidth
      />
      <span>{value.length} characters</span>
    </div>
  );
}

export function AutosizeWithLimits() {
  const [value, setValue] = useState('This textarea grows as you type.');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 420 }}>
      <Textarea
        aria-label="Release notes"
        placeholder="Describe the changes"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autosize
        minRows={2}
        maxRows={6}
        fullWidth
      />
      <span>Grows between 2 and 6 rows</span>
    </div>
  );
}

export function Statuses() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 420 }}>
      <Textarea aria-label="Default comment" placeholder="Default" status="basic" />
      <Textarea aria-label="Invalid comment" placeholder="Invalid" status="danger" />
      <Textarea aria-label="Successful comment" placeholder="Success" status="success" />
      <Textarea aria-label="Disabled comment" placeholder="Disabled" disabled />
    </div>
  );
}
