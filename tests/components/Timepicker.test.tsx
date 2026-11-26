import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment, { Moment } from 'moment';
import { axe } from 'jest-axe';
import { Timepicker } from '@nebular-react/core';

const NEW_YORK = 'America/New_York';
const TOKYO = 'Asia/Tokyo';
const INSTANT = new Date('2024-01-15T12:00:00Z');

const getListItem = (text: string): HTMLElement =>
  screen.getByText(text).closest('[role="listitem"]') as HTMLElement;

describe('Timepicker timeZone', () => {
  it('Timepicker_TimeZone_ShouldDisplayWallClockInTrigger', () => {
    render(
      <>
        <Timepicker
          timeZone={NEW_YORK}
          date={INSTANT}
          inputProps={{ 'aria-label': 'New York time' }}
        />
        <Timepicker timeZone={TOKYO} date={INSTANT} inputProps={{ 'aria-label': 'Tokyo time' }} />
      </>
    );

    expect(screen.getByLabelText('New York time')).toHaveValue('07:00');
    expect(screen.getByLabelText('Tokyo time')).toHaveValue('21:00');
  });

  it('Timepicker_TimeZone_ShouldParseInputInTimeZone', () => {
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'New York time' }}
      />
    );

    fireEvent.change(screen.getByLabelText('New York time'), {
      target: { value: '09:30' }
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T14:30:00.000Z');
  });

  it('Timepicker_TimeZone_ShouldParseInputInTokyoTimeZone', () => {
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={TOKYO}
        date={INSTANT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Tokyo time' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Tokyo time'), {
      target: { value: '22:30' }
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T13:30:00.000Z');
  });

  it('Timepicker_TimeZone_ShouldEmitAbsoluteInstantOnSelection', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        onDateChange={onDateChange}
        timeListProps={{ singleColumn: true, step: 60, showFooter: false }}
        inputProps={{ 'aria-label': 'New York time' }}
      />
    );

    await user.click(screen.getByLabelText('New York time'));
    await user.click(screen.getByText('08:00'));

    expect(onDateChange).toHaveBeenCalled();
    expect(
      (onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date).toISOString()
    ).toBe('2024-01-15T13:00:00.000Z');
    expect(screen.getByLabelText('New York time')).toHaveValue('08:00');
  });

  it('Timepicker_TimeZone_ShouldRespectMinAndMaxInZone', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        min={new Date('2024-01-15T12:00:00Z')}
        max={new Date('2024-01-15T14:00:00Z')}
        onDateChange={onDateChange}
        timeListProps={{ singleColumn: true, step: 60, showFooter: false }}
        inputProps={{ 'aria-label': 'New York time' }}
      />
    );

    await user.click(screen.getByLabelText('New York time'));

    expect(getListItem('06:00')).toHaveClass('disabled');
    expect(getListItem('07:00')).not.toHaveClass('disabled');
    expect(getListItem('09:00')).not.toHaveClass('disabled');
    expect(getListItem('10:00')).toHaveClass('disabled');

    await user.click(screen.getByText('10:00'));

    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('Timepicker_TimeZone_ShouldIgnoreInvalidTimeZone', () => {
    const onDateChange = jest.fn();
    const localValue = new Date(2024, 0, 15, 7, 0, 0, 0);

    render(
      <Timepicker
        timeZone="Not/AZone"
        date={localValue}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Invalid zone time' }}
      />
    );

    expect(screen.getByLabelText('Invalid zone time')).toHaveValue('07:00');

    fireEvent.change(screen.getByLabelText('Invalid zone time'), {
      target: { value: '09:30' }
    });

    const value = onDateChange.mock.calls[0][0] as Date;

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(value).toBeInstanceOf(Date);
    expect(value.getHours()).toBe(9);
    expect(value.getMinutes()).toBe(30);
  });

  it('Timepicker_TimeZone_ShouldPreserveMomentValues', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Timepicker<Moment>
        timeZone={NEW_YORK}
        dateType="moment"
        date={moment.utc('2024-01-15T12:00:00Z')}
        onDateChange={onDateChange}
        timeListProps={{ singleColumn: true, step: 60, showFooter: false }}
        inputProps={{ 'aria-label': 'Moment time' }}
      />
    );

    expect(screen.getByLabelText('Moment time')).toHaveValue('07:00');

    await user.click(screen.getByLabelText('Moment time'));
    await user.click(screen.getByText('08:00'));

    const value = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Moment;

    expect(moment.isMoment(value)).toBe(true);
    expect(value.toISOString()).toBe('2024-01-15T13:00:00.000Z');
  });

  it('Timepicker_TimeZone_ShouldHaveNoAccessibilityViolations', async () => {
    const user = userEvent.setup();

    render(
      <Timepicker
        timeZone="Europe/London"
        date={INSTANT}
        inputProps={{ 'aria-label': 'London time' }}
      />
    );

    await user.click(screen.getByLabelText('London time'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});

describe('Timepicker columns and footer', () => {
  const current = new Date(2024, 4, 15, 13, 29, 35);

  it('preserves minute and second when switching between AM and PM', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    render(
      <Timepicker
        date={current}
        timeListProps={{
          twelveHoursFormat: true,
          withSeconds: true,
          calendarActionsProps: { applyButtonText: 'Apply' }
        }}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Time with seconds' }}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Time with seconds' });
    await user.click(input);
    await user.click(await screen.findByText('AM'));
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2024, 4, 15, 1, 29, 35));
    expect(input).toHaveFocus();
    await user.click(screen.getByText('PM'));
    expect(onDateChange).toHaveBeenLastCalledWith(current);

    const [, , seconds] = await screen.findAllByRole('list');
    await user.click(within(seconds).getByText('40'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onDateChange).toHaveBeenLastCalledWith(new Date(2024, 4, 15, 13, 29, 40));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull());
  });

  it('disables hours, minutes and seconds that would cross the allowed window', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    const picker = (min: Date, max: Date) => (
      <Timepicker
        date={current}
        min={min}
        max={max}
        timeListProps={{ withSeconds: true }}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Bounded time' }}
      />
    );
    const { rerender } = render(
      picker(new Date(2024, 4, 15, 13, 25, 20), new Date(2024, 4, 15, 13, 35, 45))
    );

    await user.click(screen.getByRole('textbox', { name: 'Bounded time' }));
    const [hours, minutes] = await screen.findAllByRole('list');
    const expectBounds = (column: HTMLElement, below: string, valid: string, above: string) => {
      const item = (text: string) => within(column).getByText(text).closest('[role="listitem"]');
      expect(item(below)).toHaveClass('disabled');
      expect(item(above)).toHaveClass('disabled');
      expect(item(valid)).not.toHaveClass('disabled');
      fireEvent.click(within(column).getByText(above));
    };

    expectBounds(hours, '12', '13', '14');
    expectBounds(minutes, '24', '25', '36');
    rerender(picker(new Date(2024, 4, 15, 13, 29, 20), new Date(2024, 4, 15, 13, 29, 45)));
    const [, , seconds] = await screen.findAllByRole('list');
    expectBounds(seconds, '19', '20', '46');
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('applies the current local time from the footer', async () => {
    const now = new Date(2024, 4, 15, 7, 46, 15);
    jest.useFakeTimers({ now });

    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const onDateChange = jest.fn();
      render(
        <Timepicker
          date={current}
          timeListProps={{
            calendarActionsProps: {
              showCurrentTimeButton: true,
              currentTimeButtonText: 'Current Time'
            }
          }}
          onDateChange={onDateChange}
          inputProps={{ 'aria-label': 'Local time' }}
        />
      );

      await user.click(screen.getByRole('textbox', { name: 'Local time' }));
      const currentTime = await screen.findByRole('button', { name: 'Current Time' });
      jest.setSystemTime(now);
      fireEvent.click(currentTime);
      expect(onDateChange).toHaveBeenLastCalledWith(now);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('Timepicker mask and keyboard edit', () => {
  it('Timepicker_InputMask_ShouldApplyProgressiveMask', () => {
    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        withInputMask
        inputProps={{ 'aria-label': 'Masked time' }}
      />
    );

    const input = screen.getByLabelText('Masked time') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue('0');

    fireEvent.change(input, { target: { value: '09' } });
    expect(input).toHaveValue('09');

    fireEvent.change(input, { target: { value: '093' } });
    expect(input).toHaveValue('09:3');

    fireEvent.change(input, { target: { value: '0930' } });
    expect(input).toHaveValue('09:30');
  });

  it('Timepicker_InputMask_ShouldEmitMaskedValueAndPreserveCaret', () => {
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        withInputMask
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Masked New York time' }}
      />
    );

    const input = screen.getByLabelText('Masked New York time') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '0930' } });

    expect(input).toHaveValue('09:30');
    expect(input.selectionStart).toBe(5);
    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T14:30:00.000Z');

    fireEvent.change(input, { target: { value: '09:305' } });

    expect(input).toHaveValue('09:30');
    expect(input.selectionStart).toBe(5);
  });

  it('Timepicker_InputMask_ShouldNotMaskWhenDisabled', () => {
    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        inputProps={{ 'aria-label': 'Unmasked time' }}
      />
    );

    const input = screen.getByLabelText('Unmasked time') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '0930' } });

    expect(input).toHaveValue('0930');
  });

  it('Timepicker_KeyboardEdit_ShouldAdjustHourAndMinute', () => {
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard New York time' }}
      />
    );

    const input = screen.getByLabelText('Keyboard New York time') as HTMLInputElement;

    expect(input).toHaveValue('07:00');

    input.setSelectionRange(0, 0);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('08:00');
    expect(input.selectionStart).toBe(2);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T13:00:00.000Z');

    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('08:01');
    expect(input.selectionStart).toBe(5);
    expect((onDateChange.mock.calls[1][0] as Date).toISOString()).toBe('2024-01-15T13:01:00.000Z');
  });

  it('Timepicker_KeyboardEdit_ShouldWrapSegments', () => {
    render(
      <Timepicker timeZone={NEW_YORK} date={INSTANT} inputProps={{ 'aria-label': 'Wrap time' }} />
    );

    const input = screen.getByLabelText('Wrap time') as HTMLInputElement;

    input.setSelectionRange(3, 3);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(input).toHaveValue('07:59');
  });

  it('Timepicker_KeyboardEdit_ShouldPreserveTimeZone', () => {
    const onDateChange = jest.fn();

    render(
      <Timepicker
        timeZone={TOKYO}
        date={INSTANT}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Tokyo keyboard time' }}
      />
    );

    const input = screen.getByLabelText('Tokyo keyboard time') as HTMLInputElement;

    expect(input).toHaveValue('21:00');

    input.setSelectionRange(0, 0);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('22:00');
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T13:00:00.000Z');
  });

  it('Timepicker_KeyboardEdit_ShouldNotAdjustWhenDisabled', () => {
    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        withKeyboardEdit={false}
        inputProps={{ 'aria-label': 'No keyboard time' }}
      />
    );

    const input = screen.getByLabelText('No keyboard time') as HTMLInputElement;

    input.setSelectionRange(0, 0);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('07:00');
  });

  it('Timepicker_InputProps_ShouldMergeHandlers', () => {
    const onChange = jest.fn();
    const onKeyDown = jest.fn();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        withInputMask
        inputProps={{ 'aria-label': 'Merged time', onChange, onKeyDown }}
      />
    );

    const input = screen.getByLabelText('Merged time') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '0930' } });
    expect(onChange).toHaveBeenCalledTimes(1);

    input.setSelectionRange(0, 0);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('Timepicker_MaskAndKeyboard_ShouldHaveNoAccessibilityViolations', async () => {
    const user = userEvent.setup();

    render(
      <Timepicker
        timeZone={NEW_YORK}
        date={INSTANT}
        withInputMask
        withKeyboardEdit
        timeListProps={{ showFooter: false }}
        inputProps={{ 'aria-label': 'Accessible masked time' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible masked time'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
