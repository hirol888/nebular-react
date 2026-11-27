import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { CurrencyInput, parseCurrencyValue } from '@nebular-react/core';

const normalise = (value: string) => value.replace(/\u00a0/g, ' ');

const inputValue = (element: HTMLElement) => normalise((element as HTMLInputElement).value);

describe('CurrencyInput', () => {
  describe('parseCurrencyValue', () => {
    it('CurrencyInput_parseCurrencyValue_ShouldParseLocaleFormattedText', () => {
      expect(parseCurrencyValue('R$ 1.234,56', { locale: 'pt-BR' })).toBe(1234.56);
      expect(parseCurrencyValue('$1,234.56', { locale: 'en-US' })).toBe(1234.56);
      expect(parseCurrencyValue('2500', { locale: 'pt-BR' })).toBe(2500);
      expect(parseCurrencyValue('12,5', { locale: 'pt-BR' })).toBe(12.5);
    });

    it('CurrencyInput_parseCurrencyValue_ShouldHandleNegativeValues', () => {
      expect(parseCurrencyValue('-R$ 42,50', { locale: 'pt-BR' })).toBe(-42.5);
      expect(parseCurrencyValue('(R$ 42,50)', { locale: 'pt-BR' })).toBe(-42.5);
    });

    it('CurrencyInput_parseCurrencyValue_ShouldReturnNullWhenThereIsNoNumber', () => {
      expect(parseCurrencyValue('', { locale: 'pt-BR' })).toBeNull();
      expect(parseCurrencyValue('abc', { locale: 'pt-BR' })).toBeNull();
      expect(parseCurrencyValue('R$ ', { locale: 'pt-BR' })).toBeNull();
    });
  });

  it('CurrencyInput_DefaultValue_ShouldRenderFormattedCurrency', () => {
    render(<CurrencyInput aria-label="Amount" defaultValue={1234.5} />);

    expect(inputValue(screen.getByLabelText('Amount'))).toBe('R$ 1.234,50');
  });

  it('CurrencyInput_CurrencyAndLocale_ShouldFormatWithTheGivenCurrency', () => {
    render(
      <CurrencyInput aria-label="Price" currency="USD" locale="en-US" defaultValue={1234.5} />
    );

    expect(inputValue(screen.getByLabelText('Price'))).toBe('$1,234.50');
  });

  it('CurrencyInput_DecimalsAndPrefix_ShouldFormatDisplay', () => {
    render(<CurrencyInput aria-label="Total" decimals={0} prefix="Total: " defaultValue={10.6} />);

    expect(inputValue(screen.getByLabelText('Total'))).toBe('Total: R$ 11');
  });

  it('CurrencyInput_Change_ShouldReportParsedNumberAndFormatDisplay', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" defaultValue={0} onChange={onChange} />);

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: 'R$ 2.500,75' } });

    expect(onChange).toHaveBeenLastCalledWith(2500.75);
    expect(inputValue(input)).toBe('R$ 2.500,75');
  });

  it('CurrencyInput_Change_ShouldClampValueToMax', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" max={1000} onChange={onChange} />);

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: 'R$ 5.000,00' } });

    expect(onChange).toHaveBeenLastCalledWith(1000);
    expect(inputValue(input)).toBe('R$ 1.000,00');
  });

  it('CurrencyInput_Change_ShouldClampValueToMin', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" min={10} allowNegative onChange={onChange} />);

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '-50,00' } });

    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(inputValue(input)).toBe('R$ 10,00');
  });

  it('CurrencyInput_Change_ShouldRejectNegativeValuesWhenAllowNegativeIsFalse', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '-50,00' } });

    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('CurrencyInput_Change_ShouldAcceptNegativeValuesWhenAllowNegativeIsEnabled', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" allowNegative onChange={onChange} />);

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '-42,50' } });

    expect(onChange).toHaveBeenLastCalledWith(-42.5);
    expect(inputValue(input)).toBe('-R$ 42,50');
  });

  it('CurrencyInput_Change_ShouldReportNullWhenTextHasNoNumber', () => {
    const onChange = jest.fn();

    render(<CurrencyInput aria-label="Amount" defaultValue={10} onChange={onChange} />);

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(inputValue(input)).toBe('');
  });

  it('CurrencyInput_Blur_ShouldKeepValueNormalised', () => {
    const onChange = jest.fn();
    const onBlur = jest.fn();

    render(
      <CurrencyInput aria-label="Amount" defaultValue={10} onChange={onChange} onBlur={onBlur} />
    );

    const input = screen.getByLabelText('Amount');
    fireEvent.change(input, { target: { value: '12,3' } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenLastCalledWith(12.3);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(inputValue(input)).toBe('R$ 12,30');
  });

  it('CurrencyInput_Controlled_ShouldFollowValueProp', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <CurrencyInput aria-label="Amount" value={100} onChange={onChange} />
    );

    const input = screen.getByLabelText('Amount');
    expect(inputValue(input)).toBe('R$ 100,00');

    fireEvent.change(input, { target: { value: '250,25' } });

    expect(onChange).toHaveBeenLastCalledWith(250.25);
    expect(inputValue(input)).toBe('R$ 100,00');

    rerender(<CurrencyInput aria-label="Amount" value={250.25} onChange={onChange} />);

    expect(inputValue(input)).toBe('R$ 250,25');
  });

  it('CurrencyInput_hasNoA11yViolations', async () => {
    const { container } = render(
      <div>
        <CurrencyInput aria-label="Amount" defaultValue={99.9} />
        <CurrencyInput aria-label="Disabled amount" disabled />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
