import React, { useId, useState } from 'react';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { PasswordStrength } from './PasswordStrength';

export default { title: 'PasswordStrength', component: PasswordStrength };

export function Showcase() {
  const id = useId();
  const [value, setValue] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
      <FormControl label="Password" htmlFor={id}>
        <Input
          id={id}
          type="password"
          autoComplete="new-password"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          fullWidth
        />
      </FormControl>
      <PasswordStrength value={value} />
    </div>
  );
}

export function CustomLabels() {
  const id = useId();
  const [value, setValue] = useState('Nebular#2026');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
      <FormControl label="Password" htmlFor={id}>
        <Input
          id={id}
          type="password"
          autoComplete="new-password"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          fullWidth
        />
      </FormControl>
      <PasswordStrength
        value={value}
        minLength={10}
        labels={['Muito fraca', 'Fraca', 'Boa', 'Excelente']}
      />
    </div>
  );
}
