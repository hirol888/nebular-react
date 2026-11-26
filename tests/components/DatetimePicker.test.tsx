import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment, { Moment } from 'moment';
import { axe } from 'jest-axe';
import { DatetimePicker } from '@nebular-react/core';

const FORMAT = 'DD/MM/YYYY HH:mm';

describe('DatetimePicker timezone', () => {
  it('parses wall-clock input in the selected timezone', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        timeZone="America/New_York"
        format={FORMAT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Datetime' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Datetime'), {
      target: { value: '15/01/2024 07:00' }
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T12:00:00.000Z');
  });

  it('preserves Moment values while parsing in the timezone', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker<Moment>
        timeZone="America/New_York"
        format={FORMAT}
        dateType="moment"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Datetime moment' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Datetime moment'), {
      target: { value: '15/07/2024 08:30' }
    });

    const value = onDateChange.mock.calls[0][0] as Moment;

    expect(moment.isMoment(value)).toBe(true);
    expect(value.toISOString()).toBe('2024-07-15T12:30:00.000Z');
  });

  it('ignores invalid timezones and keeps local behavior', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        timeZone="Not/AZone"
        format={FORMAT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Datetime invalid zone' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Datetime invalid zone'), {
      target: { value: '15/01/2024 07:00' }
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).getHours()).toBe(7);
  });

  it('opens the calendar with timezone display and has no a11y violations', async () => {
    const user = userEvent.setup();

    render(
      <DatetimePicker
        timeZone="Europe/London"
        date={new Date('2024-07-15T12:00:00Z')}
        inputProps={{ 'aria-label': 'Datetime accessible' }}
      />
    );

    await user.click(screen.getByLabelText('Datetime accessible'));

    expect(document.querySelector('.overlay-pane')).toBeInTheDocument();
    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});

describe('DatetimePicker input mask and keyboard edit', () => {
  it('applies the mask progressively while typing', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        timeZone="America/New_York"
        format={FORMAT}
        withInputMask
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Masked datetime' }}
      />
    );

    const input = screen.getByLabelText('Masked datetime') as HTMLInputElement;
    await user.type(input, '150120240730');

    expect(input.value).toBe('15/01/2024 07:30');
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.toISOString()).toBe('2024-01-15T12:30:00.000Z');
  });

  it('increments the hour under the caret and emits the instant in the timezone', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        timeZone="America/New_York"
        format={FORMAT}
        withKeyboardEdit
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard hour' }}
      />
    );

    const input = screen.getByLabelText('Keyboard hour') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024 07:30' } });
    input.setSelectionRange(12, 12);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('15/01/2024 08:30');
    expect(input.selectionStart).toBe(13);
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.toISOString()).toBe('2024-01-15T13:30:00.000Z');
  });

  it('decrements the minute under the caret', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        format={FORMAT}
        withKeyboardEdit
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard minute' }}
      />
    );

    const input = screen.getByLabelText('Keyboard minute') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024 07:30' } });
    input.setSelectionRange(14, 14);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(input.value).toBe('15/01/2024 07:29');
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.getMinutes()).toBe(29);
  });

  it('keeps the raw value when the mask is disabled', () => {
    render(
      <DatetimePicker
        format={FORMAT}
        withInputMask={false}
        inputProps={{ 'aria-label': 'Raw datetime' }}
      />
    );

    const input = screen.getByLabelText('Raw datetime') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '150120240730' } });

    expect(input.value).toBe('150120240730');
  });

  it('does not change the value when keyboard edit is disabled', () => {
    const onDateChange = jest.fn();

    render(
      <DatetimePicker
        format={FORMAT}
        withKeyboardEdit={false}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Static datetime' }}
      />
    );

    const input = screen.getByLabelText('Static datetime') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024 07:30' } });
    onDateChange.mockClear();
    input.setSelectionRange(9, 9);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('15/01/2024 07:30');
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations with the mask and an open dropdown', async () => {
    const user = userEvent.setup();

    render(
      <DatetimePicker
        format={FORMAT}
        withInputMask
        withKeyboardEdit
        date={new Date('2024-07-15T12:00:00Z')}
        inputProps={{ 'aria-label': 'Accessible masked datetime' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible masked datetime'));

    expect(document.querySelector('.overlay-pane')).toBeInTheDocument();
    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
