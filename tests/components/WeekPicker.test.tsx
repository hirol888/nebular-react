import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { WeekPicker, WeekRange } from '@nebular-react/core';

const NEW_YORK = 'America/New_York';

function weekRange(start: Date, end: Date, weekNumber: number, year: number): WeekRange {
  return { start, end, weekNumber, year };
}

describe('WeekPicker', () => {
  it('WeekPicker_Render_ShouldDisplayLabelDescriptionAndFormattedWeek', () => {
    render(
      <WeekPicker
        label="Week"
        description="Choose a week"
        value={weekRange(new Date(2024, 2, 18), new Date(2024, 2, 24, 23, 59, 59, 999), 12, 2024)}
      />
    );

    expect(screen.getByLabelText('Week')).toHaveValue('W12 2024: Mar 18 - Mar 24');
    expect(screen.getByText('Choose a week')).toBeInTheDocument();
  });

  it('WeekPicker_SelectDay_ShouldEmitTheIsoWeekOfThatDay', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<WeekPicker visibleDate={new Date(2024, 2, 15)} onChange={onChange} ariaLabel="Week" />);

    await user.click(screen.getByLabelText('Week'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Wednesday, March 20, 2024' }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const range = onChange.mock.calls[0][0] as WeekRange;
    expect(range.weekNumber).toBe(12);
    expect(range.year).toBe(2024);
    expect(range.start.getFullYear()).toBe(2024);
    expect(range.start.getMonth()).toBe(2);
    expect(range.start.getDate()).toBe(18);
    expect(range.start.getHours()).toBe(0);
    expect(range.end.getDate()).toBe(24);
    expect(range.end.getHours()).toBe(23);
    expect(range.end.getMinutes()).toBe(59);

    expect(screen.getByLabelText('Week')).toHaveValue('W12 2024: Mar 18 - Mar 24');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('WeekPicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <WeekPicker
        value={weekRange(new Date(2024, 2, 11), new Date(2024, 2, 17, 23, 59, 59, 999), 11, 2024)}
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Week"
      />
    );

    await user.click(screen.getByLabelText('Week'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Wednesday, March 20, 2024' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as WeekRange).weekNumber).toBe(12);
    expect(screen.getByLabelText('Week')).toHaveValue('W11 2024: Mar 11 - Mar 17');
  });

  it('WeekPicker_MinMax_ShouldDisableWeeksOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <WeekPicker
        visibleDate={new Date(2024, 2, 15)}
        min={new Date(2024, 2, 4)}
        max={new Date(2024, 2, 24)}
        ariaLabel="Week"
      />
    );

    await user.click(screen.getByLabelText('Week'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Friday, March 1, 2024' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Monday, March 4, 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Sunday, March 24, 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Monday, March 25, 2024' })).toBeDisabled();
  });

  it('WeekPicker_TimeZone_ShouldDisplayAndEmitAbsoluteWeeks', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <WeekPicker
        timeZone={NEW_YORK}
        value={weekRange(
          new Date('2024-03-18T04:00:00.000Z'),
          new Date('2024-03-25T03:59:59.999Z'),
          12,
          2024
        )}
        visibleDate={new Date('2024-03-15T12:00:00.000Z')}
        onChange={onChange}
        ariaLabel="Week"
      />
    );

    expect(screen.getByLabelText('Week')).toHaveValue('W12 2024: Mar 18 - Mar 24');

    await user.click(screen.getByLabelText('Week'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Wednesday, March 20, 2024' }));

    const range = onChange.mock.calls[0][0] as WeekRange;
    expect(range.start.toISOString()).toBe('2024-03-18T04:00:00.000Z');
    expect(range.end.toISOString()).toBe('2024-03-25T03:59:59.999Z');
    expect(range.weekNumber).toBe(12);
    expect(range.year).toBe(2024);
  });

  it('WeekPicker_Clear_ShouldEmitNull', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <WeekPicker
        clearable
        defaultValue={weekRange(
          new Date(2024, 2, 18),
          new Date(2024, 2, 24, 23, 59, 59, 999),
          12,
          2024
        )}
        onChange={onChange}
        ariaLabel="Week"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Week')).toHaveValue('');
  });

  it('WeekPicker_Keyboard_ShouldNavigateAndSelectWithKeyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <WeekPicker
        defaultValue={weekRange(
          new Date(2024, 2, 11),
          new Date(2024, 2, 17, 23, 59, 59, 999),
          11,
          2024
        )}
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Week"
      />
    );

    const trigger = screen.getByLabelText('Week');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    // The selected week start is focused; move one row down (next week) and select.
    await user.keyboard('{ArrowDown}{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as WeekRange).weekNumber).toBe(12);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('WeekPicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <WeekPicker
        label="Week"
        description="Choose a week"
        clearable
        defaultValue={weekRange(
          new Date(2024, 2, 18),
          new Date(2024, 2, 24, 23, 59, 59, 999),
          12,
          2024
        )}
        visibleDate={new Date(2024, 2, 15)}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Week'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
