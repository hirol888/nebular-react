import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { NumberFormatter, formatNumber } from '@nebular-react/core';

describe('formatNumber', () => {
  it('formatNumber_Value_ShouldUseLocaleFormatting', () => {
    expect(formatNumber(1234.5, 'en-US')).toBe('1,234.5');
    expect(formatNumber(1234.5, 'pt-BR')).toBe('1.234,5');
  });

  it('formatNumber_Options_ShouldApplyIntlOptions', () => {
    expect(
      formatNumber(0.4281, 'en-US', { style: 'percent', maximumFractionDigits: 1 })
    ).toBe('42.8%');
  });

  it('formatNumber_InvalidValue_ShouldReturnEmptyString', () => {
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber(Number.NaN)).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('');
  });

  it('formatNumber_InvalidLocale_ShouldFallBackToTheRawValue', () => {
    expect(formatNumber(12, 'not-a-locale')).toBe('12');
  });
});

describe('NumberFormatter', () => {
  it('NumberFormatter_Value_ShouldRenderFormattedNumber', () => {
    render(<NumberFormatter value={1234.5} locale="en-US" />);

    expect(screen.getByText('1,234.5')).toBeInTheDocument();
  });

  it('NumberFormatter_PrefixAndSuffix_ShouldWrapTheValue', () => {
    render(<NumberFormatter value={-42.5} locale="en-US" prefix="$" suffix=" USD" />);

    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('-42.5')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
  });

  it('NumberFormatter_Fallback_ShouldReplaceInvalidValues', () => {
    const { rerender } = render(<NumberFormatter value={Number.NaN} fallback="Not available" />);

    expect(screen.getByText('Not available')).toBeInTheDocument();

    rerender(<NumberFormatter value={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('NumberFormatter_Zero_ShouldBeFormattedInsteadOfFallback', () => {
    render(<NumberFormatter value={0} fallback="Empty" />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('Empty')).not.toBeInTheDocument();
  });

  it('NumberFormatter_As_ShouldRenderTheRequestedElement', () => {
    render(<NumberFormatter value={42} as="strong" />);

    expect(screen.getByText('42').parentElement?.tagName).toBe('STRONG');
  });

  it('NumberFormatter_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <div>
        <NumberFormatter value={1234.5} locale="en-US" prefix="$" />
        <NumberFormatter value={Number.NaN} fallback="Not available" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
