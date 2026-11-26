import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { PhoneInput, formatPhoneNumber, parsePhoneNumber } from '@nebular-react/core';

describe('PhoneInput', () => {
  describe('formatPhoneNumber', () => {
    it('PhoneInput_formatPhoneNumber_ShouldFormatBrazilianNumbers', () => {
      expect(formatPhoneNumber('11987654321')).toBe('(11) 98765-4321');
      expect(formatPhoneNumber('1134567890')).toBe('(11) 3456-7890');
      expect(formatPhoneNumber('(11) 98765-4321')).toBe('(11) 98765-4321');
      expect(formatPhoneNumber('')).toBe('');
    });

    it('PhoneInput_formatPhoneNumber_ShouldApplyProgressiveMask', () => {
      expect(formatPhoneNumber('1')).toBe('(1');
      expect(formatPhoneNumber('11')).toBe('(11');
      expect(formatPhoneNumber('119')).toBe('(11) 9');
      expect(formatPhoneNumber('119876')).toBe('(11) 9876');
      expect(formatPhoneNumber('1198765')).toBe('(11) 9876-5');
      expect(formatPhoneNumber('1198765432')).toBe('(11) 9876-5432');
      expect(formatPhoneNumber('11987654321')).toBe('(11) 98765-4321');
    });

    it('PhoneInput_formatPhoneNumber_ShouldCapDigitsToTheCountryLength', () => {
      expect(formatPhoneNumber('119876543219999')).toBe('(11) 98765-4321');
    });

    it('PhoneInput_formatPhoneNumber_ShouldFormatUSNumbers', () => {
      expect(formatPhoneNumber('4155552671', { country: 'US' })).toBe('(415) 555-2671');
      expect(formatPhoneNumber('415', { country: 'US' })).toBe('(415');
      expect(formatPhoneNumber('4155', { country: 'US' })).toBe('(415) 5');
      expect(formatPhoneNumber('4155552', { country: 'US' })).toBe('(415) 555-2');
    });

    it('PhoneInput_formatPhoneNumber_ShouldAddCountryCodeWhenRequested', () => {
      expect(formatPhoneNumber('11987654321', { withCountryCode: true })).toBe(
        '+55 (11) 98765-4321'
      );
      expect(formatPhoneNumber('4155552671', { country: 'US', withCountryCode: true })).toBe(
        '+1 (415) 555-2671'
      );
      expect(formatPhoneNumber('+55 (11) 98765-4321', { withCountryCode: true })).toBe(
        '+55 (11) 98765-4321'
      );
    });

    it('PhoneInput_formatPhoneNumber_ShouldKeepInternationalNumbersUnmasked', () => {
      expect(formatPhoneNumber('+5511987654321', { allowInternational: true })).toBe(
        '+5511987654321'
      );
      expect(
        formatPhoneNumber('+123456789012345678', {
          allowInternational: true,
          withCountryCode: true
        })
      ).toBe('+123456789012345');
    });

    it('PhoneInput_formatPhoneNumber_ShouldIgnoreNonDigits', () => {
      expect(formatPhoneNumber('abc')).toBe('');
      expect(formatPhoneNumber('(11) 98765-4321 ramal 2')).toBe('(11) 98765-4321');
    });
  });

  describe('parsePhoneNumber', () => {
    it('PhoneInput_parsePhoneNumber_ShouldKeepOnlyDigits', () => {
      expect(parsePhoneNumber('(11) 98765-4321')).toBe('11987654321');
      expect(parsePhoneNumber('+55 (11) 98765-4321')).toBe('5511987654321');
      expect(parsePhoneNumber('')).toBe('');
      expect(parsePhoneNumber('no digits here')).toBe('');
    });
  });

  it('PhoneInput_DefaultValue_ShouldRenderFormattedValue', () => {
    render(<PhoneInput aria-label="Phone" defaultValue="11987654321" />);

    expect(screen.getByLabelText('Phone')).toHaveValue('+55 (11) 98765-4321');
  });

  it('PhoneInput_WithCountryCodeDisabled_ShouldHideThePrefix', () => {
    render(<PhoneInput aria-label="Phone" withCountryCode={false} defaultValue="11987654321" />);

    expect(screen.getByLabelText('Phone')).toHaveValue('(11) 98765-4321');
  });

  it('PhoneInput_Type_ShouldFormatProgressiveMask', async () => {
    const user = userEvent.setup();

    render(<PhoneInput aria-label="Phone" withCountryCode={false} />);

    const input = screen.getByLabelText('Phone');
    await user.type(input, '11987654321');

    expect(input).toHaveValue('(11) 98765-4321');
  });

  it('PhoneInput_USCountry_ShouldApplyUSMask', async () => {
    const user = userEvent.setup();

    render(<PhoneInput aria-label="Phone" country="US" withCountryCode={false} />);

    await user.type(screen.getByLabelText('Phone'), '4155552671');

    expect(screen.getByLabelText('Phone')).toHaveValue('(415) 555-2671');
  });

  it('PhoneInput_Paste_ShouldFilterCharactersAndFormat', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PhoneInput aria-label="Phone" withCountryCode={false} onChange={onChange} />);

    const input = screen.getByLabelText('Phone');
    await user.click(input);
    await user.paste('(11) 98765-4321');

    expect(input).toHaveValue('(11) 98765-4321');
    expect(onChange).toHaveBeenLastCalledWith('(11) 98765-4321');
  });

  it('PhoneInput_PasteWithLetters_ShouldKeepOnlyDigits', async () => {
    const user = userEvent.setup();

    render(<PhoneInput aria-label="Phone" withCountryCode={false} />);

    const input = screen.getByLabelText('Phone');
    await user.click(input);
    await user.paste('phone: 11 98765-4321');

    expect(input).toHaveValue('(11) 98765-4321');
  });

  it('PhoneInput_Change_ShouldReportFormattedLocalNumber', () => {
    const onChange = jest.fn();

    render(<PhoneInput aria-label="Phone" onChange={onChange} />);

    const input = screen.getByLabelText('Phone');
    fireEvent.change(input, { target: { value: '11987654321' } });

    expect(onChange).toHaveBeenLastCalledWith('(11) 98765-4321');
    expect(input).toHaveValue('+55 (11) 98765-4321');
  });

  it('PhoneInput_Controlled_ShouldFollowValueProp', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <PhoneInput
        aria-label="Phone"
        withCountryCode={false}
        value="11987654321"
        onChange={onChange}
      />
    );

    const input = screen.getByLabelText('Phone');
    expect(input).toHaveValue('(11) 98765-4321');

    fireEvent.change(input, { target: { value: '(11) 98765-4320' } });

    expect(onChange).toHaveBeenLastCalledWith('(11) 98765-4320');
    expect(input).toHaveValue('(11) 98765-4321');

    rerender(
      <PhoneInput
        aria-label="Phone"
        withCountryCode={false}
        value="(11) 98765-4320"
        onChange={onChange}
      />
    );

    expect(input).toHaveValue('(11) 98765-4320');
  });

  it('PhoneInput_Disabled_ShouldNotBeEditable', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<PhoneInput aria-label="Phone" disabled onChange={onChange} />);

    const input = screen.getByLabelText('Phone');
    expect(input).toBeDisabled();

    await user.type(input, '11987654321');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('PhoneInput_hasNoA11yViolations', async () => {
    const { container } = render(
      <div>
        <PhoneInput aria-label="Phone" defaultValue="11987654321" />
        <PhoneInput aria-label="Disabled phone" disabled />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('global formatting', () => {
    it('PhoneInput_Format_ShouldSupportPortugalArgentinaAndGermany', () => {
      expect(formatPhoneNumber('912345678', { country: 'PT' })).toBe('912 345 678');
      expect(formatPhoneNumber('1123456789', { country: 'AR' })).toBe('011 2345-6789');
      expect(formatPhoneNumber('015123456789', { country: 'DE' })).toBe('01512 3456789');
      expect(formatPhoneNumber('912345678', { country: 'PT', withCountryCode: true })).toBe(
        '+351 912 345 678'
      );
      expect(formatPhoneNumber('1123456789', { country: 'AR', withCountryCode: true })).toBe(
        '+54 11 2345 6789'
      );
    });

    it('PhoneInput_Format_ShouldProduceE164', () => {
      expect(formatPhoneNumber('11987654321', { outputFormat: 'e164' })).toBe('+5511987654321');
      expect(formatPhoneNumber('4155552671', { country: 'US', outputFormat: 'e164' })).toBe(
        '+14155552671'
      );
      expect(formatPhoneNumber('912345678', { country: 'PT', outputFormat: 'e164' })).toBe(
        '+351912345678'
      );
    });

    it('PhoneInput_Format_ShouldProduceInternational', () => {
      expect(formatPhoneNumber('11987654321', { outputFormat: 'international' })).toBe(
        '+55 11 98765 4321'
      );
      expect(formatPhoneNumber('4155552671', { country: 'US', outputFormat: 'international' })).toBe(
        '+1 415 555 2671'
      );
      expect(
        formatPhoneNumber('912345678', { country: 'PT', outputFormat: 'international' })
      ).toBe('+351 912 345 678');
    });

    it('PhoneInput_Type_ShouldFormatPortugalAsYouType', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <PhoneInput aria-label="Phone" country="PT" withCountryCode={false} onChange={onChange} />
      );

      const input = screen.getByLabelText('Phone');
      await user.type(input, '912345678');

      expect(input).toHaveValue('912 345 678');
      expect(onChange).toHaveBeenLastCalledWith('912 345 678');
    });

    it('PhoneInput_Type_ShouldFormatArgentinaAndGermany', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PhoneInput aria-label="Phone" country="AR" withCountryCode={false} />
      );

      await user.type(screen.getByLabelText('Phone'), '1123456789');
      expect(screen.getByLabelText('Phone')).toHaveValue('011 2345-6789');

      rerender(<PhoneInput aria-label="Phone" country="DE" withCountryCode={false} />);
      await user.clear(screen.getByLabelText('Phone'));
      await user.type(screen.getByLabelText('Phone'), '015123456789');
      expect(screen.getByLabelText('Phone')).toHaveValue('01512 3456789');
    });

    it('PhoneInput_OutputFormatE164_ShouldEmitStoredE164', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <PhoneInput
          aria-label="Phone"
          outputFormat="e164"
          withCountryCode={false}
          onChange={onChange}
        />
      );

      await user.type(screen.getByLabelText('Phone'), '11987654321');

      expect(onChange).toHaveBeenLastCalledWith('+5511987654321');
      expect(screen.getByLabelText('Phone')).toHaveValue('(11) 98765-4321');
    });

    it('PhoneInput_PasteInternational_ShouldParseCountryCode', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<PhoneInput aria-label="Phone" withCountryCode={false} onChange={onChange} />);

      const input = screen.getByLabelText('Phone');
      await user.click(input);
      await user.paste('+5511987654321');

      expect(input).toHaveValue('(11) 98765-4321');
      expect(onChange).toHaveBeenLastCalledWith('(11) 98765-4321');
    });

    it('PhoneInput_Delete_ShouldRemoveDigitsAndKeepFormattingConsistent', async () => {
      const user = userEvent.setup();

      render(<PhoneInput aria-label="Phone" withCountryCode={false} />);

      const input = screen.getByLabelText('Phone');
      await user.type(input, '11987654321');
      await user.type(input, '{Backspace}{Backspace}');

      expect(input).toHaveValue('(11) 9876-543');
    });

    it('PhoneInput_OnChangeMeta_ShouldReportValidAndPossible', async () => {
      const user = userEvent.setup();
      const onChangeMeta = jest.fn();

      render(
        <PhoneInput
          aria-label="Phone"
          country="BR"
          withCountryCode={false}
          onChangeMeta={onChangeMeta}
        />
      );

      await user.type(screen.getByLabelText('Phone'), '11987654321');

      expect(onChangeMeta).toHaveBeenLastCalledWith({
        country: 'BR',
        national: '(11) 98765-4321',
        international: '+55 11 98765 4321',
        e164: '+5511987654321',
        valid: true,
        possible: true
      });

      await user.clear(screen.getByLabelText('Phone'));
      await user.type(screen.getByLabelText('Phone'), '119');

      expect(onChangeMeta).toHaveBeenLastCalledWith(
        expect.objectContaining({
          country: 'BR',
          valid: false,
          possible: false
        })
      );
    });

    it('PhoneInput_CountryChange_ShouldReformatControlledValue', () => {
      const { rerender } = render(
        <PhoneInput
          aria-label="Phone"
          country="PT"
          value="912345678"
          withCountryCode={false}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Phone')).toHaveValue('912 345 678');

      rerender(
        <PhoneInput
          aria-label="Phone"
          country="DE"
          value="015123456789"
          withCountryCode={false}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByLabelText('Phone')).toHaveValue('01512 3456789');
    });

    it('PhoneInput_Empty_ShouldClearValueAndMeta', async () => {
      const user = userEvent.setup();
      const onChangeMeta = jest.fn();

      render(
        <PhoneInput
          aria-label="Phone"
          defaultValue="11987654321"
          withCountryCode={false}
          onChangeMeta={onChangeMeta}
        />
      );

      await user.clear(screen.getByLabelText('Phone'));

      expect(screen.getByLabelText('Phone')).toHaveValue('');
      expect(onChangeMeta).toHaveBeenLastCalledWith(
        expect.objectContaining({ national: '', e164: '', valid: false, possible: false })
      );
    });
  });
});
