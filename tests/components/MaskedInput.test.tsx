import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  MaskedInput,
  formatMaskedValue,
  parseMaskedValue
} from '@nebular-react/core';

const CPF_MASK = '999.999.999-99';
const PHONE_MASK = '(99) 99999-9999';

describe('MaskedInput', () => {
  describe('formatMaskedValue', () => {
    it('MaskedInput_formatMaskedValue_ShouldApplyLiteralsInOrder', () => {
      expect(formatMaskedValue('12345678901', CPF_MASK)).toBe('123.456.789-01');
      expect(formatMaskedValue('123', CPF_MASK)).toBe('123');
      expect(formatMaskedValue('123456', CPF_MASK)).toBe('123.456');
      expect(formatMaskedValue('', CPF_MASK)).toBe('');
    });

    it('MaskedInput_formatMaskedValue_ShouldSupportAllTokenTypes', () => {
      expect(formatMaskedValue('abC123', 'AAA-999')).toBe('abC-123');
      expect(formatMaskedValue('a1b2', 'SSSS')).toBe('a1b2');
      expect(formatMaskedValue('x!y?', '****')).toBe('x!y?');
    });

    it('MaskedInput_formatMaskedValue_ShouldDiscardCharactersThatDoNotMatchToken', () => {
      expect(formatMaskedValue('ab12cd34', '9999')).toBe('1234');
      expect(formatMaskedValue('11 98765 4321', PHONE_MASK)).toBe('(11) 98765-4321');
    });
  });

  describe('parseMaskedValue', () => {
    it('MaskedInput_parseMaskedValue_ShouldStripMaskLiterals', () => {
      expect(parseMaskedValue('123.456.789-01', CPF_MASK)).toBe('12345678901');
      expect(parseMaskedValue('(11) 98765-4321', PHONE_MASK)).toBe('11987654321');
      expect(parseMaskedValue('123', CPF_MASK)).toBe('123');
      expect(parseMaskedValue('', CPF_MASK)).toBe('');
    });
  });

  it('MaskedInput_Type_ShouldFormatValueWhileTyping', async () => {
    const user = userEvent.setup();

    render(<MaskedInput aria-label="CPF" mask={CPF_MASK} />);

    const input = screen.getByLabelText('CPF');

    await user.type(input, '12345678901');

    expect(input).toHaveValue('123.456.789-01');
  });

  it('MaskedInput_Paste_ShouldFormatPastedValue', async () => {
    const user = userEvent.setup();

    render(<MaskedInput aria-label="Phone" mask={PHONE_MASK} />);

    const input = screen.getByLabelText('Phone');
    await user.click(input);
    await user.paste('11987654321');

    expect(input).toHaveValue('(11) 98765-4321');
  });

  it('MaskedInput_DefaultValue_ShouldRenderFormattedValue', () => {
    render(<MaskedInput aria-label="CPF" mask={CPF_MASK} defaultValue="12345678901" />);

    expect(screen.getByLabelText('CPF')).toHaveValue('123.456.789-01');
  });

  it('MaskedInput_Change_ShouldReportFormattedValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<MaskedInput aria-label="CPF" mask={CPF_MASK} onChange={onChange} />);

    const input = screen.getByLabelText('CPF');

    await user.type(input, '12345678901');

    expect(onChange).toHaveBeenLastCalledWith('123.456.789-01');
    expect(onChange).toHaveBeenCalled();
  });

  it('MaskedInput_Controlled_ShouldFollowValueProp', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <MaskedInput aria-label="CPF" mask={CPF_MASK} value="123.456.789-01" onChange={onChange} />
    );

    const input = screen.getByLabelText('CPF');
    expect(input).toHaveValue('123.456.789-01');

    fireEvent.change(input, { target: { value: '98765432100' } });

    expect(onChange).toHaveBeenLastCalledWith('987.654.321-00');
    expect(input).toHaveValue('123.456.789-01');

    rerender(
      <MaskedInput aria-label="CPF" mask={CPF_MASK} value="98765432100" onChange={onChange} />
    );

    expect(input).toHaveValue('987.654.321-00');
  });

  it('MaskedInput_hasNoA11yViolations', async () => {
    const { container } = render(
      <div>
        <MaskedInput aria-label="CPF" mask={CPF_MASK} defaultValue="12345678901" />
        <MaskedInput aria-label="Phone" mask={PHONE_MASK} disabled />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
