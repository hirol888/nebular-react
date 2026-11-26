import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment, { Moment } from 'moment';
import { axe } from 'jest-axe';
import { MonthPicker } from '@nebular-react/core';

const MONTH_FORMAT = 'MMMM YYYY';

function getMonthCell(label: string): HTMLElement {
  return Array.from(document.querySelectorAll('.month-cell')).find(
    (cell) => cell.textContent === label
  ) as HTMLElement;
}

describe('MonthPicker', () => {
  it('MonthPicker_Render_ShouldDisplayLabelDescriptionAndFormattedValue', () => {
    render(
      <MonthPicker
        label="Month"
        description="Choose a month"
        format={MONTH_FORMAT}
        value={new Date(2023, 0, 15)}
      />
    );

    expect(screen.getByLabelText('Month')).toHaveValue('January 2023');
    expect(screen.getByText('Choose a month')).toBeInTheDocument();
  });

  it('MonthPicker_Select_ShouldEmitTheFirstDayOfTheMonth', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthPicker
        format={MONTH_FORMAT}
        defaultValue={new Date(2023, 0, 15)}
        visibleDate={new Date(2023, 0, 15)}
        onChange={onChange}
        ariaLabel="Month"
      />
    );

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');
    await user.click(getMonthCell('Mar'));

    expect(onChange).toHaveBeenCalledTimes(1);

    const selected = onChange.mock.calls[0][0] as Date;
    expect(selected.getFullYear()).toBe(2023);
    expect(selected.getMonth()).toBe(2);
    expect(selected.getDate()).toBe(1);

    expect(screen.getByLabelText('Month')).toHaveValue('March 2023');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MonthPicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthPicker
        format={MONTH_FORMAT}
        value={new Date(2024, 0, 15)}
        visibleDate={new Date(2024, 0, 15)}
        onChange={onChange}
        ariaLabel="Month"
      />
    );

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');
    await user.click(getMonthCell('Jun'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(5);
    expect(screen.getByLabelText('Month')).toHaveValue('January 2024');
  });

  it('MonthPicker_MinMax_ShouldDisableMonthsOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <MonthPicker
        format={MONTH_FORMAT}
        visibleDate={new Date(2024, 3, 15)}
        min={new Date(2024, 2, 1)}
        max={new Date(2024, 8, 30)}
        ariaLabel="Month"
      />
    );

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');

    expect(getMonthCell('Jan')).toHaveClass('disabled');
    expect(getMonthCell('Feb')).toHaveClass('disabled');
    expect(getMonthCell('Mar')).not.toHaveClass('disabled');
    expect(getMonthCell('Sep')).not.toHaveClass('disabled');
    expect(getMonthCell('Oct')).toHaveClass('disabled');
  });

  it('MonthPicker_TimeZone_ShouldEmitTheAbsoluteMonthStart', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const instant = new Date('2024-02-01T02:00:00Z');

    render(
      <MonthPicker
        timeZone="America/New_York"
        format={MONTH_FORMAT}
        defaultValue={instant}
        visibleDate={instant}
        onChange={onChange}
        ariaLabel="Month"
      />
    );

    // 2024-02-01T02:00Z is 2024-01-31 21:00 in New York.
    expect(screen.getByLabelText('Month')).toHaveValue('January 2024');

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');
    await user.click(getMonthCell('Mar'));

    expect((onChange.mock.calls[0][0] as Date).toISOString()).toBe('2024-03-01T05:00:00.000Z');
    expect(screen.getByLabelText('Month')).toHaveValue('March 2024');
  });

  it('MonthPicker_Moment_ShouldPreserveMomentValues', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthPicker<Moment>
        dateType="moment"
        format={MONTH_FORMAT}
        value={moment('2024-03-15')}
        visibleDate={moment('2024-03-15')}
        onChange={onChange}
        ariaLabel="Month"
      />
    );

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');
    await user.click(getMonthCell('Jul'));

    const selected = onChange.mock.calls[0][0] as Moment;
    expect(moment.isMoment(selected)).toBe(true);
    expect(selected.month()).toBe(6);
    expect(selected.date()).toBe(1);
  });

  it('MonthPicker_Clear_ShouldEmitNull', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthPicker
        format={MONTH_FORMAT}
        clearable
        defaultValue={new Date(2024, 0, 15)}
        onChange={onChange}
        ariaLabel="Month"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Month')).toHaveValue('');
  });

  it('MonthPicker_Keyboard_ShouldCloseWithEscape', async () => {
    const user = userEvent.setup();

    render(
      <MonthPicker
        format={MONTH_FORMAT}
        defaultValue={new Date(2024, 0, 15)}
        visibleDate={new Date(2024, 0, 15)}
        ariaLabel="Month"
      />
    );

    const trigger = screen.getByLabelText('Month');
    await user.click(trigger);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('MonthPicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MonthPicker
        label="Month"
        description="Choose a month"
        clearable
        value={new Date(2024, 0, 15)}
        visibleDate={new Date(2024, 0, 15)}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Month'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
