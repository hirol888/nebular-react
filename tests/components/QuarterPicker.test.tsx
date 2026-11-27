import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { QuarterPicker, QuarterValue } from '@nebular-react/core';

describe('QuarterPicker', () => {
  it('QuarterPicker_Render_ShouldDisplayLabelDescriptionAndFormattedQuarter', () => {
    render(
      <QuarterPicker
        label="Quarter"
        description="Choose a quarter"
        value={{ year: 2024, quarter: 2 }}
      />
    );

    expect(screen.getByLabelText('Quarter')).toHaveValue('Q2 2024');
    expect(screen.getByText('Choose a quarter')).toBeInTheDocument();
  });

  it('QuarterPicker_Select_ShouldEmitTheQuarterAndClose', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<QuarterPicker visibleYear={2024} onChange={onChange} ariaLabel="Quarter" />);

    await user.click(screen.getByLabelText('Quarter'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Q3 2024' }));

    expect(onChange).toHaveBeenCalledWith({ year: 2024, quarter: 3 });
    expect(screen.getByLabelText('Quarter')).toHaveValue('Q3 2024');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('QuarterPicker_Controlled_ShouldKeepValueUntilTheParentUpdatesIt', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <QuarterPicker value={{ year: 2024, quarter: 2 }} onChange={onChange} ariaLabel="Quarter" />
    );

    await user.click(screen.getByLabelText('Quarter'));
    await screen.findByRole('dialog');
    await user.click(screen.getByRole('button', { name: 'Q4 2024' }));

    expect(onChange).toHaveBeenCalledWith({ year: 2024, quarter: 4 });
    expect(screen.getByLabelText('Quarter')).toHaveValue('Q2 2024');
  });

  it('QuarterPicker_MinMax_ShouldDisableQuartersOutsideTheBounds', async () => {
    const user = userEvent.setup();

    render(
      <QuarterPicker
        visibleYear={2024}
        min={{ year: 2024, quarter: 2 }}
        max={{ year: 2024, quarter: 3 }}
        ariaLabel="Quarter"
      />
    );

    await user.click(screen.getByLabelText('Quarter'));
    await screen.findByRole('dialog');

    expect(screen.getByRole('button', { name: 'Q1 2024' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Q2 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Q3 2024' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Q4 2024' })).toBeDisabled();
  });

  it('QuarterPicker_YearNavigation_ShouldChangeTheDisplayedYear', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<QuarterPicker visibleYear={2024} onChange={onChange} ariaLabel="Quarter" />);

    await user.click(screen.getByLabelText('Quarter'));
    await screen.findByRole('dialog');

    await user.click(screen.getByRole('button', { name: 'Next year' }));
    await user.click(screen.getByRole('button', { name: 'Next year' }));
    expect(screen.getByText('2026')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Q1 2026' }));

    expect(onChange).toHaveBeenCalledWith({ year: 2026, quarter: 1 });
    expect(screen.getByLabelText('Quarter')).toHaveValue('Q1 2026');
  });

  it('QuarterPicker_Clear_ShouldEmitNull', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <QuarterPicker
        clearable
        defaultValue={{ year: 2024, quarter: 2 }}
        onChange={onChange}
        ariaLabel="Quarter"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Clear selection' }));

    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByLabelText('Quarter')).toHaveValue('');
  });

  it('QuarterPicker_Keyboard_ShouldNavigateAndSelectWithKeyboard', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <QuarterPicker value={{ year: 2024, quarter: 2 }} onChange={onChange} ariaLabel="Quarter" />
    );

    const trigger = screen.getByLabelText('Quarter');
    act(() => trigger.focus());
    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');

    await user.keyboard('{ArrowRight}{Enter}');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0] as QuarterValue).toEqual({ year: 2024, quarter: 3 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.keyboard('{Enter}');
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('QuarterPicker_Accessibility_ShouldHaveNoViolations', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <QuarterPicker
        label="Quarter"
        description="Choose a quarter"
        value={{ year: 2024, quarter: 2 }}
      />
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByLabelText('Quarter'));
    await screen.findByRole('dialog');

    expect(await axe(document.querySelector('.overlay-pane') as HTMLElement)).toHaveNoViolations();
  });
});
