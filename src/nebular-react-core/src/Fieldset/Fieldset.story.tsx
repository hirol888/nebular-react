import React, { useId } from 'react';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { Fieldset } from './Fieldset';

export default { title: 'Fieldset', component: Fieldset };

export function Showcase() {
  const id = useId();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 480 }}>
      <Fieldset legend="Account" description="Basic information used across the app.">
        <FormControl label="Name" htmlFor={`${id}-name`}>
          <Input id={`${id}-name`} placeholder="Jane Doe" fullWidth />
        </FormControl>
        <FormControl label="Email" htmlFor={`${id}-email`}>
          <Input id={`${id}-email`} type="email" placeholder="jane@example.com" fullWidth />
        </FormControl>
      </Fieldset>

      <Fieldset legend="Filled variant" variant="filled">
        <FormControl label="Company" htmlFor={`${id}-company`}>
          <Input id={`${id}-company`} placeholder="Nebular" fullWidth />
        </FormControl>
      </Fieldset>

      <Fieldset legend="Without border" withBorder={false}>
        <FormControl label="Nickname" htmlFor={`${id}-nickname`}>
          <Input id={`${id}-nickname`} placeholder="nebular" fullWidth />
        </FormControl>
      </Fieldset>
    </div>
  );
}

export function Disabled() {
  const id = useId();

  return (
    <Fieldset legend="Disabled section" description="All controls are disabled." disabled>
      <FormControl label="Name" htmlFor={`${id}-name`}>
        <Input id={`${id}-name`} placeholder="Jane Doe" fullWidth />
      </FormControl>
      <FormControl label="Email" htmlFor={`${id}-email`}>
        <Input id={`${id}-email`} type="email" placeholder="jane@example.com" fullWidth />
      </FormControl>
    </Fieldset>
  );
}
