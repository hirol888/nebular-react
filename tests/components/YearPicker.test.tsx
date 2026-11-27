import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { YearPicker } from '@nebular-react/core';

const YEAR_FORMAT = 'YYYY';

function getYearCell(label: string): HTMLElement {
  return Array.from(document.querySelectorAll('.year-cell')).find(
    (cell) => cell.textContent === label
  ) as HTMLElement;
}

describe('YearPicker', () => {
  it('YearPicker_Render_ShouldDisplayLabelDescriptionAndFormattedValue', () => {
    render(
      <YearPicker
        label="Year"
        description="Choose a year"
        format={YEAR_FORMAT}
        value={new Date(2023, 5, 15)}
        dateType="native"
      />
    );

    expect(screen.getByLabelText('Year')).toHaveValue('2023');
    expect(screen.getByText('Choose a year')).toBeInTheDocument();
  });

  it('YearPicker_Select_ShouldEmitTheFirstDayOfTheYear', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <YearPicker
        format={YEAR_FORMAT}
        defaultValue={new Date(2024, 5, 15)}
        visibleDate={new Date(2024, 5, 15)}
        onChange={onChange}
        ariaLabel="Year"
      />
    );

    await user.click(screen.getByLabelText('Year'));
    await screen.findByRole('dialog');
    await user.click(getYearCell('2021'));

    expect(onChange).toHaveBeenCalledTimes(1);

    const selected = onChange.mock.calls[0][0] as Date;
    expect(selected.getFullYear()).toBe(2021);
    expect(selected.getMonth()).toBe(0);
    expect(selected.getDate()).toBe(1);

    expect(screen.getByLabelText('Year')).toHaveValue('2021');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('YearPicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <YearPicker
        format={YEAR_FORMAT}
        value={new Date(2024, 5, 15)}
        visibleDate={new Date(2024, 5, 15)}
        onChange={onChange}
        ariaLabel="Year"
      />
    );

    await user.click(screen.getByLabelText('Year'));
    await screen.findByRole('dialog');
    await user.click(getYearCell('2022'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getFullYear()).toBe(2022);
    expect(screen.getByLabelText('Year')).toHaveValue('2024');
  });

  it('YearPicker_MinMax_ShouldDisableYearsOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <YearPicker
        format={YEAR_FORMAT}
        visibleDate={new Date(2024, 5, 15)}
        min={new Date(2020, 5, 1)}
        max={new Date(2024, 5, 1)}
        ariaLabel="Year"
      />
    );

    await user.click(screen.getByLabelText('Year'));
    await screen.findByRole('dialog');

    expect(getYearCell('2019')).toHaveClass('disabled');
    expect(getYearCell('2020')).not.toHaveClass('disabled');
    expect(getYearCell('2024')).not.toHaveClass('disabled');
    expect(getYearCell('2025')).toHaveClass('disabled');
  });

  it('YearPicker_TimeZone_ShouldEmitTheAbsoluteYearStart', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const instant = new Date('2024-01-01T02:00:00Z');

    render(
      <YearPicker
        timeZone="America/New_York"
        format={YEAR_FORMAT}
        defaultValue={instant}
        visibleDate={instant}
        onChange={onChange}
        ariaLabel="Year"
      />
    );

    // 2024-01-01T02:00Z is 2023-12-31 21:00 in New York.
    expect(screen.getByLabelText('Year')).toHaveValue('2023');

    await user.click(screen.getByLabelText('Year'));
    await screen.findByRole('dialog');
    await user.click(getYearCell('2021'));

    expect((onChange.mock.calls[0][0] as Date).toISOString()).toBe('2021-01-01T05:00:00.000Z');
    expect(screen.getByLabelText('Year')).toHaveValue('2021');
  });

  it('YearPicker_Clear_ShouldEmitNull', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <YearPicker
        format={YEAR_FORMAT}
        clearable
        defaultValue={new Date(2024, 5, 15)}
        onChange={onChange}
        ariaLabel="Year"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Year')).toHaveValue('');
  });

  it('YearPicker_Keyboard_ShouldCloseWithEscape', async () => {
    const user = userEvent.setup();

    render(
      <YearPicker
        format={YEAR_FORMAT}
        defaultValue={new Date(2024, 5, 15)}
        visibleDate={new Date(2024, 5, 15)}
        ariaLabel="Year"
      />
    );

    const trigger = screen.getByLabelText('Year');
    await user.click(trigger);
    await screen.findByRole('dialog');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('YearPicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <YearPicker
        label="Year"
        description="Choose a year"
        clearable
        value={new Date(2024, 5, 15)}
        visibleDate={new Date(2024, 5, 15)}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Year'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
