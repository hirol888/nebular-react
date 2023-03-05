import React from 'react';
import { Icon } from '../Icon';
import { ControlStatusExample, ExampleItemsCol, ExampleItemsRows } from '../Shared';
import { Input } from './Input';

export default { title: 'Input' };

export function Showcase() {
  return (
    <ExampleItemsRows>
      <Input type="text" placeholder="Text field" />
      <Input type="text" placeholder="Disabled Text field" disabled />
    </ExampleItemsRows>
  );
}

export function Color() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <Input type="text" fullWidth status="basic" placeholder="Default" />
      <Input type="text" fullWidth status="primary" placeholder="Primary" />
      <Input type="text" fullWidth status="info" placeholder="Info" />
      <Input type="text" fullWidth status="success" placeholder="Success" />
      <Input type="text" fullWidth status="warning" placeholder="Warning" />
      <Input type="text" fullWidth status="danger" placeholder="Danger" />
      <ControlStatusExample>
        <Input type="text" fullWidth status="control" placeholder="Control" />
      </ControlStatusExample>
    </ExampleItemsCol>
  );
}

export function Shape() {
  return (
    <ExampleItemsCol>
      <Input type="text" fullWidth shape="rectangle" placeholder="Rectangle" />
      <Input type="text" fullWidth shape="semiround" placeholder="Semi round" />
      <Input type="text" fullWidth shape="round" placeholder="Round" />
    </ExampleItemsCol>
  );
}

export function Size() {
  return (
    <ExampleItemsRows>
      <Input type="text" size="tiny" placeholder="Tiny" />
      <Input type="text" size="small" placeholder="Small" />
      <Input type="text" size="medium" placeholder="Medium" />
      <Input type="text" size="large" placeholder="Large" />
      <Input type="text" size="giant" placeholder="Giant" />
    </ExampleItemsRows>
  );
}

export function WithIcon() {
  return (
    <ExampleItemsRows>
      <Input status="primary" prefixIcon={<Icon icon="star" />} />
      <Input status="success" suffixIcon={<Icon icon="star" />} />
    </ExampleItemsRows>
  );
}
