import React from 'react';
import { ComponentStatus } from '@nebular-react/styles';
import { Icon } from './Icon';
import { ControlStatusExample, ExampleItemsRows } from '../Shared';

export default { title: 'Icon' };

export function Status() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Icon key={index} icon="heart-outline" status={status} />
  ));
  return (
    <ExampleItemsRows>
      <Icon icon="heart-outline" />
      <Icon icon="heart-outline" status="basic" />
      {items}
      <ControlStatusExample>
        <Icon icon="heart-outline" status="control" />
      </ControlStatusExample>
    </ExampleItemsRows>
  );
}

export function Showcase() {
  return (
    <ExampleItemsRows>
      <Icon icon="heart-outline" />
      <Icon icon="star" />
    </ExampleItemsRows>
  );
}
