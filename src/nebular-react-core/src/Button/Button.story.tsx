import React from 'react';
import { ComponentSize, ComponentStatus } from '@nebular-react/styles';
import { Button } from './Button';
import { ExampleItemsRows, ControlStatusExample } from '../Shared';
import { Icon } from '../Icon';

export default { title: 'Button' };

export function Status() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Button key={index} status={status}>
      {status}
    </Button>
  ));
  return (
    <ExampleItemsRows>
      <Button status="basic">basic</Button>
      {items}
      <ControlStatusExample>
        <Button status="control">control</Button>
      </ControlStatusExample>
    </ExampleItemsRows>
  );
}

export function FullWidth() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Button key={index} status={status} fullWidth>
      {status}
    </Button>
  ));
  return <ExampleItemsRows>{items}</ExampleItemsRows>;
}

export function Hero() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Button key={index} status={status} appearance="hero">
      {status}
    </Button>
  ));
  return <ExampleItemsRows>{items}</ExampleItemsRows>;
}

export function Outline() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Button key={index} status={status} appearance="outline">
      {status}
    </Button>
  ));
  return <ExampleItemsRows>{items}</ExampleItemsRows>;
}

export function Ghost() {
  const statuses: ComponentStatus[] = ['primary', 'success', 'info', 'warning', 'danger'];
  const items = statuses.map((status, index) => (
    <Button key={index} status={status} appearance="ghost">
      {status}
    </Button>
  ));
  return <ExampleItemsRows>{items}</ExampleItemsRows>;
}

export function Shape() {
  return (
    <ExampleItemsRows>
      <Button status="primary" shape="rectangle">
        rectangle
      </Button>
      <Button status="info" shape="semiround">
        semi-round
      </Button>
      <Button status="success" shape="round">
        round
      </Button>
    </ExampleItemsRows>
  );
}

export function Size() {
  const sizes: ComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];
  const items = sizes.map((size, index) => (
    <Button key={index} size={size} status="primary">
      {size}
    </Button>
  ));
  return <ExampleItemsRows>{items}</ExampleItemsRows>;
}

export function WithIcon() {
  return (
    <ExampleItemsRows>
      <Button status="primary" prefixIcon={<Icon icon="star" />}>
        primary
      </Button>
      <Button status="success" prefixIcon={<Icon icon="star" />} />
      <Button status="info" suffixIcon={<Icon icon="star" />}>
        primary
      </Button>
    </ExampleItemsRows>
  );
}

export function Showcase() {
  return (
    <ExampleItemsRows>
      <Button>Active</Button>
      <Button disabled>Disabled</Button>
    </ExampleItemsRows>
  );
}

export function LinkButton() {
  return (
    <ExampleItemsRows>
      <Button component="a" status="primary" href="https://www.google.com">
        Google
      </Button>
      <Button component="a" status="primary" disabled href="https://www.google.com">
        Google
      </Button>
    </ExampleItemsRows>
  );
}
