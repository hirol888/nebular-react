import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DateTimeRangePicker } from '@nebular-react/core';

const FORMAT = 'DD/MM/YYYY HH:mm';

const JANUARY_2024 = new Date(2024, 0, 5);

function getDayCell(day: number): HTMLElement {
  return Array.from(document.querySelectorAll('.day-cell')).find(
    (cell) => cell.textContent === String(day) && !cell.classList.contains('bounding-month')
  ) as HTMLElement;
}

describe('DateTimeRangePicker', () => {
  it('DateTimeRangePicker_Render_ShouldDisplayLabelDescriptionAndFormattedRange', () => {
    render(
      <DateTimeRangePicker
        label="Period"
        description="Choose the period"
        format={FORMAT}
        value={{
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 17, 0)
        }}
      />
    );

    expect(screen.getByLabelText('Period')).toHaveValue('15/01/2024 09:00 - 15/01/2024 17:00');
    expect(screen.getByText('Choose the period')).toBeInTheDocument();
  });

  it('DateTimeRangePicker_Apply_ShouldEmitSelectedDateAndTimeRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DateTimeRangePicker
        format={FORMAT}
        visibleDate={JANUARY_2024}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(getDayCell(10));
    await user.click(getDayCell(15));

    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '17:00' } });

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const range = onChange.mock.calls[0][0];
    expect(range.start.getFullYear()).toBe(2024);
    expect(range.start.getMonth()).toBe(0);
    expect(range.start.getDate()).toBe(10);
    expect(range.start.getHours()).toBe(9);
    expect(range.start.getMinutes()).toBe(0);
    expect(range.end.getDate()).toBe(15);
    expect(range.end.getHours()).toBe(17);

    expect(screen.getByLabelText('Period')).toHaveValue('10/01/2024 09:00 - 15/01/2024 17:00');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('DateTimeRangePicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DateTimeRangePicker
        format={FORMAT}
        value={{
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 17, 0)
        }}
        visibleDate={JANUARY_2024}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await user.click(await screen.findByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Period')).toHaveValue('15/01/2024 09:00 - 15/01/2024 17:00');
  });

  it('DateTimeRangePicker_MinMax_ShouldDisableDatesOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <DateTimeRangePicker
        format={FORMAT}
        visibleDate={JANUARY_2024}
        min={new Date(2024, 0, 10)}
        max={new Date(2024, 0, 20)}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(getDayCell(9)).toHaveClass('disabled');
    expect(getDayCell(10)).not.toHaveClass('disabled');
    expect(getDayCell(20)).not.toHaveClass('disabled');
    expect(getDayCell(21)).toHaveClass('disabled');
  });

  it('DateTimeRangePicker_Validation_ShouldBlockApplyWhenStartIsAfterEnd', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DateTimeRangePicker
        format={FORMAT}
        visibleDate={JANUARY_2024}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(getDayCell(10));
    await user.click(getDayCell(10));

    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('End time'), { target: { value: '09:00' } });

    expect(screen.getByRole('alert')).toHaveTextContent(/end/i);
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '08:00' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
  });

  it('DateTimeRangePicker_Presets_ShouldApplyACustomPreset', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const start = new Date(2024, 0, 1, 8, 0);
    const end = new Date(2024, 0, 10, 18, 0);

    render(
      <DateTimeRangePicker
        format={FORMAT}
        presets={[{ label: 'Fiscal period', getValue: () => ({ start, end }) }]}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await user.click(await screen.findByRole('button', { name: 'Fiscal period' }));

    expect(onChange).toHaveBeenCalledWith({ start, end });
    expect(screen.getByLabelText('Period')).toHaveValue('01/01/2024 08:00 - 10/01/2024 18:00');
  });

  it('DateTimeRangePicker_TimeZone_ShouldDisplayAndEmitAbsoluteInstants', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const visibleDate = new Date('2024-01-05T12:00:00Z');

    render(
      <DateTimeRangePicker
        timeZone="America/New_York"
        format={FORMAT}
        visibleDate={visibleDate}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(getDayCell(10));
    await user.click(getDayCell(15));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const range = onChange.mock.calls[0][0];
    expect((range.start as Date).toISOString()).toBe('2024-01-10T05:00:00.000Z');
    expect((range.end as Date).toISOString()).toBe('2024-01-15T05:00:00.000Z');
    expect(screen.getByLabelText('Period')).toHaveValue('10/01/2024 00:00 - 15/01/2024 00:00');
  });

  it('DateTimeRangePicker_Clear_ShouldEmitAnEmptyRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DateTimeRangePicker
        format={FORMAT}
        defaultValue={{
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 17, 0)
        }}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await user.click(await screen.findByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    expect(screen.getByLabelText('Period')).toHaveValue('');
  });

  it('DateTimeRangePicker_Keyboard_ShouldOpenAndCloseWithTheKeyboard', async () => {
    const user = userEvent.setup();

    render(<DateTimeRangePicker format={FORMAT} visibleDate={JANUARY_2024} ariaLabel="Period" />);

    const trigger = screen.getByLabelText('Period');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');

    const dialog = await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.tab();
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('DateTimeRangePicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DateTimeRangePicker
        label="Period"
        description="Choose the period"
        format={FORMAT}
        value={{
          start: new Date(2024, 0, 15, 9, 0),
          end: new Date(2024, 0, 15, 17, 0)
        }}
        visibleDate={JANUARY_2024}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
