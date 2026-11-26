import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  CRON_PRESETS,
  CronInput,
  describeCron,
  isValidCron
} from '@nebular-react/core';

describe('CronInput', () => {
  describe('isValidCron', () => {
    it('CronInput_isValidCron_ShouldAcceptSupportedExpressions', () => {
      expect(isValidCron('* * * * *')).toBe(true);
      expect(isValidCron('*/15 * * * *')).toBe(true);
      expect(isValidCron('0 9 * * 1')).toBe(true);
      expect(isValidCron('0 0 1 1 *')).toBe(true);
      expect(isValidCron('1,2,3 4-6 * * *')).toBe(true);
      expect(isValidCron('0 0 * * 0')).toBe(true);
      expect(isValidCron('  0   9   *   *   1  ')).toBe(true);
      expect(isValidCron('0 0 1-15/2 * *')).toBe(true);
    });

    it('CronInput_isValidCron_ShouldRejectInvalidExpressions', () => {
      expect(isValidCron('')).toBe(false);
      expect(isValidCron('invalid')).toBe(false);
      expect(isValidCron('* * * *')).toBe(false);
      expect(isValidCron('* * * * * *')).toBe(false);
      expect(isValidCron('60 * * * *')).toBe(false);
      expect(isValidCron('* 24 * * *')).toBe(false);
      expect(isValidCron('* * 32 * *')).toBe(false);
      expect(isValidCron('* * 0 * *')).toBe(false);
      expect(isValidCron('* * * 13 *')).toBe(false);
      expect(isValidCron('* * * * 8')).toBe(false);
      expect(isValidCron('*/0 * * * *')).toBe(false);
      expect(isValidCron('5-1 * * * *')).toBe(false);
      expect(isValidCron('a * * * *')).toBe(false);
      expect(isValidCron('0 9 * * MON')).toBe(false);
    });
  });

  describe('describeCron', () => {
    it('CronInput_describeCron_ShouldDescribeFrequenciesInPortuguese', () => {
      expect(describeCron('* * * * *')).toBe('A cada minuto');
      expect(describeCron('*/15 * * * *')).toBe('A cada 15 minutos');
      expect(describeCron('0 * * * *')).toBe('A cada hora');
      expect(describeCron('0 9 * * *')).toBe('Todos os dias às 09:00');
      expect(describeCron('30 8 * * 1')).toBe('Toda segunda-feira às 08:30');
      expect(describeCron('0 0 1 * *')).toBe('Todo mês no dia 1 às 00:00');
    });

    it('CronInput_describeCron_ShouldDescribeFrequenciesInEnglish', () => {
      expect(describeCron('* * * * *', 'en-US')).toBe('Every minute');
      expect(describeCron('*/15 * * * *', 'en-US')).toBe('Every 15 minutes');
      expect(describeCron('0 * * * *', 'en-US')).toBe('Every hour');
      expect(describeCron('0 9 * * *', 'en-US')).toBe('Every day at 09:00');
      expect(describeCron('30 8 * * 1', 'en-US')).toBe('Every Monday at 08:30');
    });

    it('CronInput_describeCron_ShouldFallbackToTheExpression', () => {
      expect(describeCron('invalid')).toBe('invalid');
      expect(describeCron('5 4 3 2 1')).toBe('5 4 3 2 1');
    });
  });

  it('CronInput_Presets_ShouldExposeTheDefaultPresetList', () => {
    const values = CRON_PRESETS.map((preset) => preset.value);

    expect(values).toContain('* * * * *');
    expect(values).toContain('0 * * * *');
    expect(values).toContain('0 9 * * *');
    expect(values).toContain('30 8 * * 1');
    expect(values).toContain('0 0 1 * *');
  });

  it('CronInput_DefaultValue_ShouldRenderTheExpression', () => {
    render(<CronInput label="Schedule" defaultValue="*/15 * * * *" />);

    expect(screen.getByLabelText('Schedule')).toHaveValue('*/15 * * * *');
  });

  it('CronInput_PresetClick_ShouldUpdateValueAndReportChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CronInput label="Schedule" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Every hour' }));

    expect(onChange).toHaveBeenLastCalledWith('0 * * * *');
    expect(screen.getByLabelText('Schedule')).toHaveValue('0 * * * *');

    await user.click(screen.getByRole('button', { name: 'Weekly on Monday' }));

    expect(onChange).toHaveBeenLastCalledWith('30 8 * * 1');
    expect(screen.getByLabelText('Schedule')).toHaveValue('30 8 * * 1');
  });

  it('CronInput_PresetsDisabled_ShouldHideThePresetButtons', () => {
    render(<CronInput label="Schedule" presets={false} />);

    expect(screen.queryByRole('button', { name: 'Every hour' })).not.toBeInTheDocument();
  });

  it('CronInput_InvalidExpression_ShouldShowAnError', async () => {
    const user = userEvent.setup();

    render(<CronInput label="Schedule" />);

    const input = screen.getByLabelText('Schedule');
    await user.type(input, 'invalid');

    expect(input).toHaveValue('invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('Expressão cron inválida');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('CronInput_ValidExpression_ShouldNotShowAnError', async () => {
    const user = userEvent.setup();

    render(<CronInput label="Schedule" />);

    await user.type(screen.getByLabelText('Schedule'), '0 9 * * *');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('CronInput_InvalidExpressionEnglish_ShouldShowAnEnglishError', () => {
    render(<CronInput label="Schedule" locale="en-US" defaultValue="invalid" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid cron expression');
  });

  it('CronInput_ExplicitError_ShouldOverrideTheValidationMessage', () => {
    render(<CronInput label="Schedule" error="Server rejected this schedule" defaultValue="bad" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Server rejected this schedule');
  });

  it('CronInput_Controlled_ShouldFollowValueProp', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <CronInput label="Schedule" value="0 9 * * *" onChange={onChange} presets={false} />
    );

    const input = screen.getByLabelText('Schedule');
    expect(input).toHaveValue('0 9 * * *');

    fireEvent.change(input, { target: { value: '*/30 * * * *' } });

    expect(onChange).toHaveBeenLastCalledWith('*/30 * * * *');
    expect(input).toHaveValue('0 9 * * *');

    rerender(
      <CronInput label="Schedule" value="*/30 * * * *" onChange={onChange} presets={false} />
    );

    expect(input).toHaveValue('*/30 * * * *');
  });

  it('CronInput_Description_ShouldRenderTheHelperText', () => {
    render(<CronInput label="Schedule" description="Runs in UTC" defaultValue="0 9 * * *" />);

    expect(screen.getByText('Runs in UTC')).toBeInTheDocument();
  });

  it('CronInput_Required_ShouldMarkTheLabel', () => {
    render(<CronInput label="Schedule" required defaultValue="0 9 * * *" />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('CronInput_hasNoA11yViolations', async () => {
    const { container } = render(
      <div>
        <CronInput label="Schedule" defaultValue="*/15 * * * *" />
        <CronInput label="Disabled schedule" disabled presets={false} />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
