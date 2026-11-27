import React from 'react';
import { ExampleItemsCol, ExampleItemsRows } from '../Shared';
import { PinInput } from './PinInput';

export default { title: 'PinInput', component: PinInput };

export function Showcase() {
  return (
    <ExampleItemsRows>
      <PinInput length={4} ariaLabel="Four digit code" />
      <PinInput length={6} type="alphanumeric" ariaLabel="Alphanumeric code" />
    </ExampleItemsRows>
  );
}

export function Masked() {
  return (
    <ExampleItemsCol>
      <PinInput length={4} mask ariaLabel="Masked code" />
      <PinInput length={6} mask oneTimeCode ariaLabel="One time code" />
    </ExampleItemsCol>
  );
}

export function Disabled() {
  return (
    <ExampleItemsCol>
      <PinInput length={4} disabled defaultValue="1234" label="Disabled code" />
      <PinInput length={4} disabled mask defaultValue="12" label="Disabled masked code" />
    </ExampleItemsCol>
  );
}
