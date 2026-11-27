import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MonthRange, MonthRangePicker } from '@nebular-react/core';

const NEW_YORK = 'America/New_York';

function monthRange(start: Date | null, end: Date | null): MonthRange<Date> {
  return { start, end };
}

describe('MonthRangePicker', () => {
  it('MonthRangePicker_Render_ShouldDisplayLabelDescriptionAndFormattedRange', () => {
    render(
      <MonthRangePicker
        label="Period"
        description="Choose the months"
        value={monthRange(new Date(2024, 2, 1), new Date(2024, 5, 1))}
      />
    );

    expect(screen.getByLabelText('Period')).toHaveValue('Mar 2024 - Jun 2024');
    expect(screen.getByText('Choose the months')).toBeInTheDocument();
  });

  it('MonthRangePicker_Apply_ShouldEmitTheSelectedMonthRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: 'March 2024' }));
    await user.click(screen.getByRole('button', { name: 'June 2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const range = onChange.mock.calls[0][0] as MonthRange<Date>;
    expect(range.start?.getFullYear()).toBe(2024);
    expect(range.start?.getMonth()).toBe(2);
    expect(range.start?.getDate()).toBe(1);
    expect(range.end?.getMonth()).toBe(5);
    expect(range.end?.getDate()).toBe(1);

    expect(screen.getByLabelText('Period')).toHaveValue('Mar 2024 - Jun 2024');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MonthRangePicker_DefaultValue_ShouldUpdateTheUncontrolledRange', async () => {
    const user = userEvent.setup();

    render(
      <MonthRangePicker
        defaultValue={monthRange(new Date(2024, 0, 1), new Date(2024, 2, 1))}
        visibleDate={new Date(2024, 0, 15)}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'September 2024' }));
    await user.click(screen.getByRole('button', { name: 'December 2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByLabelText('Period')).toHaveValue('Sep 2024 - Dec 2024');
  });

  it('MonthRangePicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        value={monthRange(new Date(2024, 2, 1), new Date(2024, 5, 1))}
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'September 2024' }));
    await user.click(screen.getByRole('button', { name: 'December 2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Period')).toHaveValue('Mar 2024 - Jun 2024');
  });

  it('MonthRangePicker_Validation_ShouldRestartWhenTheSecondMonthIsBeforeTheStart', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: 'June 2024' }));
    await user.click(screen.getByRole('button', { name: 'March 2024' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'May 2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const range = onChange.mock.calls[0][0] as MonthRange<Date>;
    expect(range.start?.getMonth()).toBe(2);
    expect(range.end?.getMonth()).toBe(4);
  });

  it('MonthRangePicker_MinMax_ShouldDisableMonthsOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <MonthRangePicker
        visibleDate={new Date(2024, 2, 15)}
        min={new Date(2024, 2, 1)}
        max={new Date(2024, 8, 30)}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'January 2024' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'February 2024' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'March 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'September 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'October 2024' })).toBeDisabled();
  });

  it('MonthRangePicker_TimeZone_ShouldDisplayAndEmitAbsoluteMonths', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        timeZone={NEW_YORK}
        defaultValue={monthRange(
          new Date('2024-03-01T05:00:00.000Z'),
          new Date('2024-06-01T04:00:00.000Z')
        )}
        visibleDate={new Date('2024-03-15T12:00:00.000Z')}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    expect(screen.getByLabelText('Period')).toHaveValue('Mar 2024 - Jun 2024');

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'April 2024' }));
    await user.click(screen.getByRole('button', { name: 'July 2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const range = onChange.mock.calls[0][0] as MonthRange<Date>;
    expect(range.start?.toISOString()).toBe('2024-04-01T04:00:00.000Z');
    expect(range.end?.toISOString()).toBe('2024-07-01T04:00:00.000Z');
    expect(screen.getByLabelText('Period')).toHaveValue('Apr 2024 - Jul 2024');
  });

  it('MonthRangePicker_Clear_ShouldEmitAnEmptyRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        defaultValue={monthRange(new Date(2024, 2, 1), new Date(2024, 5, 1))}
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onChange).toHaveBeenCalledWith({ start: null, end: null });
    expect(screen.getByLabelText('Period')).toHaveValue('');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MonthRangePicker_Keyboard_ShouldSelectTheRangeWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <MonthRangePicker
        visibleDate={new Date(2024, 2, 15)}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    const trigger = screen.getByLabelText('Period');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    await user.keyboard('{ArrowRight}{Enter}{ArrowRight}{Enter}');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const range = onChange.mock.calls[0][0] as MonthRange<Date>;
    expect(range.start?.getMonth()).toBe(1);
    expect(range.end?.getMonth()).toBe(2);

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('MonthRangePicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MonthRangePicker
        label="Period"
        description="Choose the months"
        value={monthRange(new Date(2024, 2, 1), new Date(2024, 5, 1))}
        visibleDate={new Date(2024, 2, 15)}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
