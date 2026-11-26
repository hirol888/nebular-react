/**
 * @jest-environment node
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  Badge,
  Button,
  Datepicker,
  DatetimePicker,
  Menu,
  PhoneInput,
  Popover,
  Rangepicker,
  Select,
  Timepicker,
  Tooltip
} from '@nebular-react/core';

describe('server-side rendering', () => {
  const triggerRef = React.createRef<HTMLButtonElement>();

  const cases: [string, React.ReactElement][] = [
    ['Button', <Button>Hello</Button>],
    ['Badge', <Badge text="new" />],
    ['Tooltip', <Tooltip triggerRef={triggerRef} content="tip" />],
    ['Popover', <Popover triggerRef={triggerRef} content="popover" />],
    ['Select', <Select options={[{ type: 'option', label: 'Option', value: 'option' }]} />],
    ['Datepicker', <Datepicker />],
    ['Rangepicker', <Rangepicker />],
    ['DatetimePicker', <DatetimePicker />],
    ['Timepicker', <Timepicker />],
    ['PhoneInput', <PhoneInput country="BR" defaultValue="11987654321" />],
    ['Menu', <Menu />]
  ];

  it.each(cases)('renders %s without browser globals', (_name, element) => {
    expect(() => renderToStaticMarkup(element)).not.toThrow();
  });
});
