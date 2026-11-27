import React, { useState } from 'react';
import { Combobox } from './Combobox';
import { Input } from '../Input';

export default { title: 'Combobox', component: Combobox };

const countries = [
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' }
];

export function CountrySelector() {
  const [country, setCountry] = useState<string | null>('br');
  return (
    <Combobox
      aria-label="Shipping country"
      value={country}
      onChange={setCountry}
      options={countries}
      fullWidth
    />
  );
}

const tags = [
  { value: 'bug', label: 'Bug' },
  { value: 'docs', label: 'Documentation' },
  { value: 'planned', label: 'Planned', disabled: true }
];

export function IssueLabels() {
  const [query, setQuery] = useState('');
  return (
    <Combobox
      aria-label="Issue label"
      inputValue={query}
      onInputChange={setQuery}
      options={tags}
      renderInput={(inputProps) => <Input {...inputProps} placeholder="Find a label" />}
      renderOption={(option) => (
        <span>
          <strong>{option.label}</strong>
          {option.disabled && ' · unavailable'}
        </span>
      )}
    />
  );
}
