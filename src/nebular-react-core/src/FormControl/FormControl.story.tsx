import React from 'react';
import { Input } from '../Input';
import { FormControl } from './FormControl';

export default { title: 'FormControl', component: FormControl };

export function Showcase() {
  return (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '24rem' }}>
      <FormControl label="Name" htmlFor="form-control-name" description="Your full name">
        <Input id="form-control-name" fullWidth placeholder="Jane Doe" />
      </FormControl>

      <FormControl
        label="Email"
        htmlFor="form-control-email"
        orientation="horizontal"
        description="We never share your email"
      >
        <Input id="form-control-email" type="email" fullWidth placeholder="jane@example.com" />
      </FormControl>
    </form>
  );
}

export function WithError() {
  return (
    <FormControl
      label="Email"
      htmlFor="form-control-email-with-error"
      error="Please enter a valid email address"
    >
      <Input
        id="form-control-email-with-error"
        type="email"
        status="danger"
        fullWidth
        defaultValue="not-an-email"
      />
    </FormControl>
  );
}

export function Required() {
  return (
    <FormControl
      label="Password"
      htmlFor="form-control-password"
      description="At least 8 characters"
      required
    >
      <Input id="form-control-password" type="password" fullWidth placeholder="********" />
    </FormControl>
  );
}
