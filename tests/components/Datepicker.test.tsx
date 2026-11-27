import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as dateFnsModule from 'date-fns';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment, { Moment } from 'moment';
import { Temporal } from '@js-temporal/polyfill';
import {
  DateAdapterProvider,
  Datepicker,
  createDateFnsDateAdapter,
  createDayjsDateAdapter,
  createTemporalDateAdapter
} from '@nebular-react/core';

dayjs.extend(customParseFormat);

describe('Datepicker', () => {
  it('opens the calendar and selects today', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        placeholder="Pick a date"
        inputProps={{ 'aria-label': 'Date' }}
        onDateChange={onDateChange}
      />
    );

    await user.click(screen.getByLabelText('Date'));

    await waitFor(() =>
      expect(document.querySelector('.nebular-base-calendar-root')).not.toBeNull()
    );

    const todayCell = document.querySelector('.day-cell.today') as HTMLElement;
    expect(todayCell).not.toBeNull();

    await user.click(todayCell);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('uses the adapter configured through the provider', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <DateAdapterProvider adapter={createDayjsDateAdapter(dayjs)}>
        <Datepicker
          placeholder="Pick a date"
          inputProps={{ 'aria-label': 'Date' }}
          onDateChange={onDateChange}
        />
      </DateAdapterProvider>
    );

    await user.click(screen.getByLabelText('Date'));
    await waitFor(() => expect(document.querySelector('.day-cell.today')).not.toBeNull());

    await user.click(document.querySelector('.day-cell.today') as HTMLElement);

    expect(dayjs.isDayjs(onDateChange.mock.calls[0][0])).toBe(true);
  });

  it('uses the concrete date-fns adapter', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <DateAdapterProvider adapter={createDateFnsDateAdapter(dateFnsModule)}>
        <Datepicker
          placeholder="Pick a date"
          inputProps={{ 'aria-label': 'Date' }}
          onDateChange={onDateChange}
        />
      </DateAdapterProvider>
    );

    await user.click(screen.getByLabelText('Date'));
    await waitFor(() => expect(document.querySelector('.day-cell.today')).not.toBeNull());

    await user.click(document.querySelector('.day-cell.today') as HTMLElement);

    expect(onDateChange.mock.calls[0][0]).toBeInstanceOf(Date);
  });

  it('uses the concrete Temporal adapter', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <DateAdapterProvider adapter={createTemporalDateAdapter(Temporal)}>
        <Datepicker
          placeholder="Pick a date"
          inputProps={{ 'aria-label': 'Date' }}
          onDateChange={onDateChange}
        />
      </DateAdapterProvider>
    );

    await user.click(screen.getByLabelText('Date'));
    await waitFor(() => expect(document.querySelector('.day-cell.today')).not.toBeNull());

    await user.click(document.querySelector('.day-cell.today') as HTMLElement);

    expect(onDateChange.mock.calls[0][0]).toBeInstanceOf(Temporal.PlainDateTime);
  });

  it('disables dates from a disabledDates array', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        visibleDate={new Date(2024, 0, 10)}
        disabledDates={[new Date(2024, 0, 15)]}
        placeholder="Pick a date"
        inputProps={{ 'aria-label': 'Date' }}
        onDateChange={onDateChange}
      />
    );

    await user.click(screen.getByLabelText('Date'));
    await waitFor(() =>
      expect(document.querySelector('.nebular-base-calendar-root')).not.toBeNull()
    );

    const cell = screen.getByText('15').closest('.day-cell') as HTMLElement;
    expect(cell).toHaveClass('disabled');

    await user.click(cell);

    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('disables dates through a predicate', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        visibleDate={new Date(2024, 0, 10)}
        disabledDates={(date) => date.getDay() === 0}
        placeholder="Pick a date"
        inputProps={{ 'aria-label': 'Date' }}
      />
    );

    await user.click(screen.getByLabelText('Date'));

    await waitFor(() =>
      expect(document.querySelector('.nebular-base-calendar-root')).not.toBeNull()
    );

    expect(screen.getByText('7').closest('.day-cell')).toHaveClass('disabled');
    expect(screen.getByText('8').closest('.day-cell')).not.toHaveClass('disabled');
  });

  it('applies the Today preset', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        presets
        placeholder="Pick a date"
        inputProps={{ 'aria-label': 'Date' }}
        onDateChange={onDateChange}
      />
    );

    await user.click(screen.getByLabelText('Date'));
    await user.click(await screen.findByRole('button', { name: 'Today' }));

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toDateString()).toBe(new Date().toDateString());
  });

  it('has no accessibility violations with presets and disabled dates', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        presets
        disabledDates={[new Date(2024, 0, 15)]}
        visibleDate={new Date(2024, 0, 10)}
        placeholder="Pick a date"
        inputProps={{ 'aria-label': 'Date' }}
      />
    );

    await user.click(screen.getByLabelText('Date'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Datepicker placeholder="Pick a date" inputProps={{ 'aria-label': 'Date' }} />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

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

describe('Datepicker timezone', () => {
  it('parses the wall clock input in America/New_York', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'New York date' }}
      />
    );

    fireEvent.change(screen.getByLabelText('New York date'), {
      target: { value: '15/01/2024' }
    });

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('parses the wall clock input in Europe/London', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="Europe/London"
        format="DD/MM/YYYY"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'London date' }}
      />
    );

    fireEvent.change(screen.getByLabelText('London date'), {
      target: { value: '15/07/2024' }
    });

    // 2024-07-15 00:00 in London (BST, UTC+1) is 23:00Z on the previous day.
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-07-14T23:00:00.000Z');
  });

  it('parses the wall clock input on the London DST transition day', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="Europe/London"
        format="DD/MM/YYYY"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'London DST date' }}
      />
    );

    fireEvent.change(screen.getByLabelText('London DST date'), {
      target: { value: '31/03/2024' }
    });

    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-03-31T00:00:00.000Z');
  });

  it('emits the absolute instant of the selected calendar date', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Select date' }}
      />
    );

    await user.click(screen.getByLabelText('Select date'));
    await waitForOverlay();
    await user.click(getDayCell(15));

    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
    expect((screen.getByLabelText('Select date') as HTMLInputElement).value).toBe('15/01/2024');
  });

  it('emits the absolute instant on the DST fall back day', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        visibleDate={new Date('2024-11-05T12:00:00Z')}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'DST date' }}
      />
    );

    await user.click(screen.getByLabelText('DST date'));
    await waitForOverlay();
    await user.click(getDayCell(3));

    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-11-03T04:00:00.000Z');
  });

  it('renders the configured date as the timezone wall clock', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        timeZone="America/New_York"
        date={new Date('2024-01-15T02:00:00Z')}
        visibleDate={new Date('2024-01-15T02:00:00Z')}
        inputProps={{ 'aria-label': 'Wall clock date' }}
      />
    );

    await user.click(screen.getByLabelText('Wall clock date'));
    await waitForOverlay();

    expect(getDayCell(14)).toHaveClass('selected');
  });

  it('converts the min and max to the timezone wall clock', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        timeZone="Asia/Tokyo"
        visibleDate={new Date('2024-01-05T12:00:00Z')}
        min={new Date('2024-01-10T16:00:00Z')}
        max={new Date('2024-01-20T04:00:00Z')}
        inputProps={{ 'aria-label': 'Min max date' }}
      />
    );

    await user.click(screen.getByLabelText('Min max date'));
    await waitForOverlay();

    expect(getDayCell(10)).toHaveClass('disabled');
    expect(getDayCell(11)).not.toHaveClass('disabled');
    expect(getDayCell(21)).toHaveClass('disabled');
  });

  it('converts preset values to the timezone wall clock', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();
    const presetDate = new Date('2024-01-01T02:00:00Z');

    render(
      <Datepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        presets={[{ label: 'New Year', getValue: () => presetDate }]}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Preset date' }}
      />
    );

    await user.click(screen.getByLabelText('Preset date'));
    await user.click(await screen.findByRole('button', { name: 'New Year' }));

    // 2024-01-01T02:00Z is 2023-12-31 21:00 in New York.
    expect((screen.getByLabelText('Preset date') as HTMLInputElement).value).toBe('31/12/2023');
    expect((onDateChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-01-01T02:00:00.000Z');
  });

  it('keeps the local behavior for an invalid timezone', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="Not/AZone"
        format="DD/MM/YYYY"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Invalid zone date' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Invalid zone date'), {
      target: { value: '15/01/2024' }
    });

    const value = onDateChange.mock.calls[0][0] as Date;
    expect(value.getDate()).toBe(15);
    expect(value.getHours()).toBe(0);
  });

  it('preserves Moment values while parsing in the timezone', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker<Moment>
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        dateType="moment"
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Moment date' }}
      />
    );

    fireEvent.change(screen.getByLabelText('Moment date'), {
      target: { value: '15/01/2024' }
    });

    const value = onDateChange.mock.calls[0][0] as Moment;
    expect(moment.isMoment(value)).toBe(true);
    expect(value.toISOString()).toBe('2024-01-15T05:00:00.000Z');
  });

  it('has no accessibility violations with a timezone', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        timeZone="America/New_York"
        date={new Date('2024-01-15T02:00:00Z')}
        visibleDate={new Date('2024-01-15T02:00:00Z')}
        presets
        inputProps={{ 'aria-label': 'Accessible date' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible date'));
    await waitFor(() => expect(document.querySelector('.overlay-pane')).not.toBeNull());

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});

describe('Datepicker input mask and keyboard edit', () => {
  it('applies the mask progressively while typing', async () => {
    const user = userEvent.setup();
    const onDateChange = jest.fn();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withInputMask
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Masked date' }}
      />
    );

    const input = screen.getByLabelText('Masked date') as HTMLInputElement;
    await user.type(input, '15012024');

    expect(input.value).toBe('15/01/2024');
    expect(onDateChange).toHaveBeenCalled();
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.toDateString()).toBe(new Date(2024, 0, 15).toDateString());
  });

  it('increments the day under the caret and emits the instant in the timezone', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        timeZone="America/New_York"
        format="DD/MM/YYYY"
        withKeyboardEdit
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard day' }}
      />
    );

    const input = screen.getByLabelText('Keyboard day') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024' } });
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('16/01/2024');
    expect(input.selectionStart).toBe(2);
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.toISOString()).toBe('2024-01-16T05:00:00.000Z');
  });

  it('increments the month under the caret', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withKeyboardEdit
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard month' }}
      />
    );

    const input = screen.getByLabelText('Keyboard month') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024' } });
    input.setSelectionRange(4, 4);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('15/02/2024');
    expect(input.selectionStart).toBe(5);
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.getMonth()).toBe(1);
  });

  it('decrements the year under the caret', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withKeyboardEdit
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Keyboard year' }}
      />
    );

    const input = screen.getByLabelText('Keyboard year') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024' } });
    input.setSelectionRange(6, 6);
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(input.value).toBe('15/01/2023');
    expect(input.selectionStart).toBe(10);
    const last = onDateChange.mock.calls[onDateChange.mock.calls.length - 1][0] as Date;
    expect(last.getFullYear()).toBe(2023);
  });

  it('keeps the raw value when the mask is disabled', () => {
    render(
      <Datepicker
        format="DD/MM/YYYY"
        withInputMask={false}
        inputProps={{ 'aria-label': 'Raw date' }}
      />
    );

    const input = screen.getByLabelText('Raw date') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15012024' } });

    expect(input.value).toBe('15012024');
  });

  it('keeps the raw value when no format is provided', () => {
    render(<Datepicker withInputMask inputProps={{ 'aria-label': 'No format date' }} />);

    const input = screen.getByLabelText('No format date') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15012024' } });

    expect(input.value).toBe('15012024');
  });

  it('does not change the value when keyboard edit is disabled', () => {
    const onDateChange = jest.fn();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withKeyboardEdit={false}
        onDateChange={onDateChange}
        inputProps={{ 'aria-label': 'Static date' }}
      />
    );

    const input = screen.getByLabelText('Static date') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15/01/2024' } });
    onDateChange.mockClear();
    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('15/01/2024');
    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('does not break for formats without a numeric mask', () => {
    render(
      <Datepicker
        format="DD MMM YYYY"
        withInputMask
        withKeyboardEdit
        inputProps={{ 'aria-label': 'Textual date' }}
      />
    );

    const input = screen.getByLabelText('Textual date') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15 Jan 2024' } });
    expect(input.value).toBe('15 Jan 2024');

    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('15 Jan 2024');
  });

  it('merges the provided input handlers', () => {
    const onChange = jest.fn();
    const onKeyDown = jest.fn();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withInputMask
        withKeyboardEdit
        inputProps={{ 'aria-label': 'Merged handlers', onChange, onKeyDown }}
      />
    );

    const input = screen.getByLabelText('Merged handlers') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15012024' } });

    expect(input.value).toBe('15/01/2024');
    expect(onChange).toHaveBeenCalledTimes(1);

    input.setSelectionRange(1, 1);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.value).toBe('16/01/2024');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations with the mask and an open dropdown', async () => {
    const user = userEvent.setup();

    render(
      <Datepicker
        format="DD/MM/YYYY"
        withInputMask
        withKeyboardEdit
        visibleDate={new Date(2024, 0, 10)}
        inputProps={{ 'aria-label': 'Accessible masked date' }}
      />
    );

    await user.click(screen.getByLabelText('Accessible masked date'));
    await waitForOverlay();

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
