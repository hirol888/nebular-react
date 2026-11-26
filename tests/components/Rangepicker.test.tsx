import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import moment, { Moment } from 'moment';
import { Rangepicker } from '@nebular-react/core';

function getDayCell(day: number): HTMLElement {
  return Array.from(document.querySelectorAll('.day-cell')).find(
    (cell) => cell.textContent === String(day) && !cell.classList.contains('bounding-month')
  ) as HTMLElement;
}

async function waitForOverlay() {
  await waitFor(() =>
    expect(
      (document.querySelector('.overlay-pane')?.parentElement as HTMLElement).style.display
    ).toBe('flex')
  );
}

describe('Rangepicker', () => {
  it('applies the built-in Last 7 days preset', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        presets
        placeholder="Pick a range"
        inputProps={{ 'aria-label': 'Range' }}
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Range'));
    await waitFor(() =>
      expect(
        (document.querySelector('.overlay-pane')?.parentElement as HTMLElement).style.display
      ).toBe('flex')
    );

    await user.click(await screen.findByRole('button', { name: 'Last 7 days' }));

    expect(onRangeChange).toHaveBeenCalledTimes(1);

    const { start, end } = onRangeChange.mock.calls[0][0];
    expect(start).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(Math.round((end.getTime() - start.getTime()) / 86400000)).toBe(6);
    expect((screen.getByLabelText('Range') as HTMLInputElement).value).toContain(' - ');
  });

  it('applies the This month preset', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        presets
        placeholder="Pick a range"
        inputProps={{ 'aria-label': 'Range' }}
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Range'));
    await waitFor(() =>
      expect(
        (document.querySelector('.overlay-pane')?.parentElement as HTMLElement).style.display
      ).toBe('flex')
    );

    await user.click(await screen.findByRole('button', { name: 'This month' }));

    const { start, end } = onRangeChange.mock.calls[0][0];
    expect(start.getDate()).toBe(1);
    expect(end.toDateString()).toBe(new Date().toDateString());
  });

  it('accepts custom presets', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 10);

    render(
      <Rangepicker
        presets={[
          {
            label: 'Fiscal period',
            getValue: () => ({ start, end })
          }
        ]}
        placeholder="Pick a range"
        inputProps={{ 'aria-label': 'Range' }}
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Range'));
    await waitFor(() =>
      expect(
        (document.querySelector('.overlay-pane')?.parentElement as HTMLElement).style.display
      ).toBe('flex')
    );

    await user.click(await screen.findByRole('button', { name: 'Fiscal period' }));

    expect(onRangeChange).toHaveBeenCalledWith({ start, end });
  });

  it('disables dates in the range calendar', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        visibleDate={new Date(2024, 0, 10)}
        disabledDates={[new Date(2024, 0, 15)]}
        placeholder="Pick a range"
        inputProps={{ 'aria-label': 'Range' }}
        onRangeChange={onRangeChange}
      />
    );

    await user.click(screen.getByLabelText('Range'));
    await waitFor(() =>
      expect(
        (document.querySelector('.overlay-pane')?.parentElement as HTMLElement).style.display
      ).toBe('flex')
    );

    const cell = screen.getByText('15').closest('.day-cell') as HTMLElement;
    expect(cell).toHaveClass('disabled');

    await user.click(cell);

    expect(onRangeChange).not.toHaveBeenCalled();
  });

  it('has no accessibility violations with presets', async () => {
    const user = userEvent.setup();

    render(
      <Rangepicker presets placeholder="Pick a range" inputProps={{ 'aria-label': 'Range' }} />
    );

    await user.click(screen.getByLabelText('Range'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});

describe('Rangepicker timezone', () => {
  it('emits the absolute instants of the selected range', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Timezone range' }}
      />
    );

    await user.click(screen.getByLabelText('Timezone range'));
    await waitForOverlay();
    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).toISOString()).toBe('2024-01-10T05:00:00.000Z');
    expect((lastRange.end as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
    expect((screen.getByLabelText('Timezone range') as HTMLInputElement).value).toBe(
      '10/01/2024 - 15/01/2024'
    );
  });

  it('renders the configured range as the timezone wall clock', async () => {
    const user = userEvent.setup();

    render(
      <Rangepicker
        timeZone="America/New_York"
        range={{
          start: new Date('2024-01-10T05:00:00Z'),
          end: new Date('2024-01-12T05:00:00Z')
        }}
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        inputProps={{ 'aria-label': 'Wall clock range' }}
      />
    );

    await user.click(screen.getByLabelText('Wall clock range'));
    await waitForOverlay();

    expect(getDayCell(10)).toHaveClass('start');
    expect(getDayCell(11)).toHaveClass('in-range');
    expect(getDayCell(12)).toHaveClass('end');
  });

  it('converts the min and max to the timezone wall clock', async () => {
    const user = userEvent.setup();

    render(
      <Rangepicker
        timeZone="Asia/Tokyo"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        min={new Date('2024-01-10T16:00:00Z')}
        max={new Date('2024-01-20T04:00:00Z')}
        inputProps={{ 'aria-label': 'Range min max' }}
      />
    );

    await user.click(screen.getByLabelText('Range min max'));
    await waitForOverlay();

    expect(getDayCell(10)).toHaveClass('disabled');
    expect(getDayCell(11)).not.toHaveClass('disabled');
    expect(getDayCell(21)).toHaveClass('disabled');
  });

  it('converts the range preset to the timezone wall clock', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();
    const start = new Date('2024-01-01T02:00:00Z');
    const end = new Date('2024-01-05T02:00:00Z');

    render(
      <Rangepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        presets={[{ label: 'Fiscal period', getValue: () => ({ start, end }) }]}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Preset range' }}
      />
    );

    await user.click(screen.getByLabelText('Preset range'));
    await user.click(await screen.findByRole('button', { name: 'Fiscal period' }));

    expect((screen.getByLabelText('Preset range') as HTMLInputElement).value).toBe(
      '31/12/2023 - 04/01/2024'
    );
    expect(onRangeChange).toHaveBeenCalledWith({ start, end });
  });

  it('emits the absolute instants across the DST transition', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        timeZone="America/New_York"
        visibleDate={new Date('2024-03-05T12:00:00Z')}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'DST range' }}
      />
    );

    await user.click(screen.getByLabelText('DST range'));
    await waitForOverlay();
    await user.click(getDayCell(9));
    await user.click(getDayCell(11));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).toISOString()).toBe('2024-03-09T05:00:00.000Z');
    expect((lastRange.end as Date).toISOString()).toBe('2024-03-11T04:00:00.000Z');
  });

  it('keeps the local behavior for an invalid timezone', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        timeZone="Not/AZone"
        format="DD/MM/YYYY"
        visibleDate={new Date(2024, 0, 5)}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Invalid zone range' }}
      />
    );

    await user.click(screen.getByLabelText('Invalid zone range'));
    await waitForOverlay();
    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).getDate()).toBe(10);
    expect((lastRange.start as Date).getHours()).toBe(0);
    expect((lastRange.end as Date).getDate()).toBe(15);
  });

  it('preserves Moment values while converting the range', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker<Moment>
        timeZone="America/New_York"
        dateType="moment"
        visibleDate={moment('2024-01-05T12:00:00Z')}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Moment range' }}
      />
    );

    await user.click(screen.getByLabelText('Moment range'));
    await waitForOverlay();
    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect(moment.isMoment(lastRange.start)).toBe(true);
    expect(moment.isMoment(lastRange.end)).toBe(true);
    expect((lastRange.start as Moment).toISOString()).toBe('2024-01-10T05:00:00.000Z');
    expect((lastRange.end as Moment).toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('has no accessibility violations with a timezone', async () => {
    const user = userEvent.setup();

    render(
      <Rangepicker
        timeZone="America/New_York"
        range={{
          start: new Date('2024-01-10T05:00:00Z'),
          end: new Date('2024-01-12T05:00:00Z')
        }}
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        presets
        inputProps={{ 'aria-label': 'Accessible range' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible range'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});

describe('Rangepicker mask and keyboard edit', () => {
  it('Rangepicker_InputMask_ShouldApplyProgressiveMask', () => {
    render(
      <Rangepicker
        format="DD/MM/YYYY"
        withInputMask
        inputProps={{ 'aria-label': 'Masked range' }}
      />
    );

    const input = screen.getByLabelText('Masked range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1' } });
    expect(input).toHaveValue('1');

    fireEvent.change(input, { target: { value: '15' } });
    expect(input).toHaveValue('15');

    fireEvent.change(input, { target: { value: '150' } });
    expect(input).toHaveValue('15/0');

    fireEvent.change(input, { target: { value: '15012024' } });
    expect(input).toHaveValue('15/01/2024');

    fireEvent.change(input, { target: { value: '1501202415012024' } });
    expect(input).toHaveValue('15/01/2024 - 15/01/2024');
  });

  it('Rangepicker_InputMask_ShouldPreserveCaret', () => {
    render(
      <Rangepicker format="DD/MM/YYYY" withInputMask inputProps={{ 'aria-label': 'Caret range' }} />
    );

    const input = screen.getByLabelText('Caret range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '15012024' } });
    expect(input.selectionStart).toBe(10);

    input.setSelectionRange(5, 5);
    fireEvent.change(input);

    expect(input).toHaveValue('15/01/2024');
    expect(input.selectionStart).toBe(5);
  });

  it('Rangepicker_InputMask_ShouldEmitParsedRange', () => {
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        format="DD/MM/YYYY"
        withInputMask
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Parsed range' }}
      />
    );

    const input = screen.getByLabelText('Parsed range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10012024' } });

    const startOnly = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((startOnly.start as Date).getDate()).toBe(10);
    expect(startOnly.end).toBeUndefined();

    fireEvent.change(input, { target: { value: '1001202415012024' } });

    const fullRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((fullRange.start as Date).getDate()).toBe(10);
    expect((fullRange.end as Date).getDate()).toBe(15);
  });

  it('Rangepicker_InputMask_ShouldNotMaskWhenDisabled', () => {
    render(<Rangepicker format="DD/MM/YYYY" inputProps={{ 'aria-label': 'Plain range' }} />);

    const input = screen.getByLabelText('Plain range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '15012024' } });

    expect(input).toHaveValue('15012024');
  });

  it('Rangepicker_KeyboardEdit_ShouldAdjustStartAndEndSegments', async () => {
    const user = userEvent.setup();
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        format="DD/MM/YYYY"
        visibleDate={new Date(2024, 0, 5)}
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Keyboard range' }}
      />
    );

    const input = screen.getByLabelText('Keyboard range') as HTMLInputElement;

    await user.click(input);
    await waitForOverlay();
    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    expect(input).toHaveValue('10/01/2024 - 15/01/2024');

    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('11/01/2024 - 15/01/2024');
    expect(input.selectionStart).toBe(2);

    const startCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((startCall.start as Date).getDate()).toBe(11);
    expect((startCall.end as Date).getDate()).toBe(15);

    input.setSelectionRange(14, 14);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('11/01/2024 - 16/01/2024');

    const endCall = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((endCall.start as Date).getDate()).toBe(11);
    expect((endCall.end as Date).getDate()).toBe(16);
  });

  it('Rangepicker_KeyboardEdit_ShouldPreserveTimeZone', () => {
    const onRangeChange = jest.fn();

    render(
      <Rangepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        withInputMask
        onRangeChange={onRangeChange}
        inputProps={{ 'aria-label': 'Timezone keyboard range' }}
      />
    );

    const input = screen.getByLabelText('Timezone keyboard range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1001202415012024' } });
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('11/01/2024 - 15/01/2024');

    const lastRange = onRangeChange.mock.calls[onRangeChange.mock.calls.length - 1][0];
    expect((lastRange.start as Date).toISOString()).toBe('2024-01-11T05:00:00.000Z');
    expect((lastRange.end as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('Rangepicker_KeyboardEdit_ShouldNotAdjustWhenDisabled', () => {
    render(
      <Rangepicker
        format="DD/MM/YYYY"
        withInputMask
        withKeyboardEdit={false}
        inputProps={{ 'aria-label': 'No keyboard range' }}
      />
    );

    const input = screen.getByLabelText('No keyboard range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '15012024' } });
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input).toHaveValue('15/01/2024');
  });

  it('Rangepicker_InputProps_ShouldMergeHandlers', () => {
    const onChange = jest.fn();
    const onKeyDown = jest.fn();

    render(
      <Rangepicker
        format="DD/MM/YYYY"
        withInputMask
        inputProps={{ 'aria-label': 'Merged range', onChange, onKeyDown }}
      />
    );

    const input = screen.getByLabelText('Merged range') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '15012024' } });
    expect(onChange).toHaveBeenCalledTimes(1);

    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('Rangepicker_MaskAndKeyboard_ShouldHaveNoAccessibilityViolations', async () => {
    const user = userEvent.setup();

    render(
      <Rangepicker
        format="DD/MM/YYYY"
        withInputMask
        withKeyboardEdit
        visibleDate={new Date(2024, 0, 5)}
        inputProps={{ 'aria-label': 'Accessible masked range' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible masked range'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
