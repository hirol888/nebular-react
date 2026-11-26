import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { YearRange, YearRangePicker } from '@nebular-react/core';

function yearRange(start: number | null, end: number | null): YearRange {
  return { start, end };
}

describe('YearRangePicker', () => {
  it('YearRangePicker_Render_ShouldDisplayLabelDescriptionAndFormattedRange', () => {
    render(
      <YearRangePicker
        label="Period"
        description="Choose the years"
        value={yearRange(2020, 2024)}
      />
    );

    expect(screen.getByLabelText('Period')).toHaveValue('2020 - 2024');
    expect(screen.getByText('Choose the years')).toBeInTheDocument();
  });

  it('YearRangePicker_Apply_ShouldEmitTheSelectedYearRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<YearRangePicker visibleYear={2020} onChange={onChange} ariaLabel="Period" />);

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: '2020' }));
    await user.click(screen.getByRole('button', { name: '2024' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ start: 2020, end: 2024 });
    expect(screen.getByLabelText('Period')).toHaveValue('2020 - 2024');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('YearRangePicker_DefaultValue_ShouldUpdateTheUncontrolledRange', async () => {
    const user = userEvent.setup();

    render(
      <YearRangePicker defaultValue={yearRange(2016, 2018)} visibleYear={2020} ariaLabel="Period" />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: '2017' }));
    await user.click(screen.getByRole('button', { name: '2019' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByLabelText('Period')).toHaveValue('2017 - 2019');
  });

  it('YearRangePicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <YearRangePicker
        value={yearRange(2020, 2024)}
        visibleYear={2020}
        onChange={onChange}
        ariaLabel="Period"
      />
    );

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: '2017' }));
    await user.click(screen.getByRole('button', { name: '2019' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ start: 2017, end: 2019 });
    expect(screen.getByLabelText('Period')).toHaveValue('2020 - 2024');
  });

  it('YearRangePicker_Validation_ShouldRestartWhenTheSecondYearIsBeforeTheStart', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<YearRangePicker visibleYear={2020} onChange={onChange} ariaLabel="Period" />);

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: '2024' }));
    await user.click(screen.getByRole('button', { name: '2020' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '2022' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ start: 2020, end: 2022 });
  });

  it('YearRangePicker_MinMax_ShouldDisableYearsOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(<YearRangePicker visibleYear={2020} min={2020} max={2024} ariaLabel="Period" />);

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: '2019' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '2020' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '2025' })).toBeDisabled();
  });

  it('YearRangePicker_YearNavigation_ShouldChangeTheDisplayedYears', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<YearRangePicker visibleYear={2020} onChange={onChange} ariaLabel="Period" />);

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(screen.getByText('2016 - 2027')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next years' }));
    expect(screen.getByText('2028 - 2039')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous years' }));
    expect(screen.getByText('2016 - 2027')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next years' }));
    await user.click(screen.getByRole('button', { name: '2030' }));
    await user.click(screen.getByRole('button', { name: '2033' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ start: 2030, end: 2033 });
  });

  it('YearRangePicker_Clear_ShouldEmitAnEmptyRange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <YearRangePicker
        defaultValue={yearRange(2020, 2024)}
        visibleYear={2020}
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

  it('YearRangePicker_Keyboard_ShouldSelectTheRangeWithTheKeyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<YearRangePicker visibleYear={2020} onChange={onChange} ariaLabel="Period" />);

    const trigger = screen.getByLabelText('Period');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    await user.keyboard('{ArrowRight}{Enter}{ArrowRight}{Enter}');
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onChange).toHaveBeenCalledWith({ start: 2017, end: 2018 });

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('YearRangePicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <YearRangePicker
        label="Period"
        description="Choose the years"
        value={yearRange(2020, 2024)}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Period'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
