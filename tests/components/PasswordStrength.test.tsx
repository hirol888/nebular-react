import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { PasswordStrength, getPasswordStrength } from '@nebular-react/core';

describe('getPasswordStrength', () => {
  it('getPasswordStrength_Empty_ShouldReturnZeroScore', () => {
    expect(getPasswordStrength('')).toEqual({ score: 0, label: '', percentage: 0 });
  });

  it('getPasswordStrength_Weak_ShouldReturnOne', () => {
    expect(getPasswordStrength('abc')).toEqual({
      score: 1,
      label: 'Weak',
      percentage: 25
    });
  });

  it('getPasswordStrength_Fair_ShouldRequireMinimumLength', () => {
    expect(getPasswordStrength('abcdefgh').score).toBe(2);
  });

  it('getPasswordStrength_Good_ShouldRequireVariety', () => {
    expect(getPasswordStrength('Abcdef1!').score).toBe(3);
  });

  it('getPasswordStrength_Strong_ShouldRequireLengthAndVariety', () => {
    expect(getPasswordStrength('Abcdefghij1!').score).toBe(4);
  });

  it('getPasswordStrength_MinLength_ShouldAffectTheScore', () => {
    expect(getPasswordStrength('Abcdefghij1', 10).score).toBe(3);
    expect(getPasswordStrength('Abcdefghij1', 12).score).toBe(2);
  });

  it('getPasswordStrength_CustomLabels_ShouldBeUsedInTheResult', () => {
    expect(
      getPasswordStrength('Abcdefghij1!', 8, ['Muito fraca', 'Fraca', 'Boa', 'Excelente'])
    ).toEqual({ score: 4, label: 'Excelente', percentage: 100 });
  });
});

describe('PasswordStrength', () => {
  it('PasswordStrength_Value_ShouldRenderMeterAttributes', () => {
    render(<PasswordStrength value="abc" />);

    const meter = screen.getByRole('meter', { name: 'Password strength' });
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '4');
    expect(meter).toHaveAttribute('aria-valuenow', '1');
    expect(meter).toHaveAttribute('aria-valuetext', 'Weak');
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('PasswordStrength_ShowLabel_ShouldHideTheTextWhenDisabled', () => {
    render(<PasswordStrength value="abc" showLabel={false} />);

    expect(screen.queryByText('Weak')).not.toBeInTheDocument();
  });

  it('PasswordStrength_Empty_ShouldRenderAnEmptyMeter', () => {
    render(<PasswordStrength value="" />);

    const meter = screen.getByRole('meter', { name: 'Password strength' });
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(meter).not.toHaveAttribute('aria-valuetext');
  });

  it('PasswordStrength_OnStrengthChange_ShouldReportTheCurrentScore', () => {
    const onStrengthChange = jest.fn();
    const { rerender } = render(
      <PasswordStrength value="abc" onStrengthChange={onStrengthChange} />
    );

    expect(onStrengthChange).toHaveBeenLastCalledWith(1);

    rerender(<PasswordStrength value="Abcdefghij1!" onStrengthChange={onStrengthChange} />);
    expect(onStrengthChange).toHaveBeenLastCalledWith(4);
  });

  it('PasswordStrength_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<PasswordStrength value="Abcdef1!" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
