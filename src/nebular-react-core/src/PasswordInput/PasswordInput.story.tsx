import React, { useState } from 'react';
import { PasswordInput } from './PasswordInput';

export default { title: 'PasswordInput', component: PasswordInput };

export function Showcase() {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 320 }}>
      <PasswordInput
        aria-label="Password"
        placeholder="Enter your password"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        visible={visible}
        onVisibleChange={setVisible}
      />
      <span>
        {value.length} characters - {visible ? 'visible' : 'hidden'}
      </span>
    </div>
  );
}

export function CustomLabels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320 }}>
      <PasswordInput
        aria-label="API token"
        placeholder="Paste your API token"
        defaultVisible
        showPasswordLabel="Reveal token"
        hidePasswordLabel="Mask token"
      />
      <span>The toggle button label changes with the visibility state</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 320 }}>
      <PasswordInput
        aria-label="Password"
        defaultValue="super-secret"
        placeholder="Disabled password"
        disabled
      />
    </div>
  );
}
