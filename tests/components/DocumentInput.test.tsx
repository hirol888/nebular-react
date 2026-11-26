import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  DocumentInput,
  formatDocument,
  isValidCnpj,
  isValidCpf,
  parseDocument
} from '@nebular-react/core';

describe('DocumentInput', () => {
  describe('formatDocument', () => {
    it('DocumentInput_formatDocument_ShouldFormatCpfProgressively', () => {
      expect(formatDocument('123')).toBe('123');
      expect(formatDocument('1234')).toBe('123.4');
      expect(formatDocument('123456')).toBe('123.456');
      expect(formatDocument('1234567')).toBe('123.456.7');
      expect(formatDocument('12345678901')).toBe('123.456.789-01');
      expect(formatDocument('')).toBe('');
    });

    it('DocumentInput_formatDocument_ShouldFormatCnpjProgressively', () => {
      expect(formatDocument('12', 'cnpj')).toBe('12');
      expect(formatDocument('123', 'cnpj')).toBe('12.3');
      expect(formatDocument('12345', 'cnpj')).toBe('12.345');
      expect(formatDocument('123456', 'cnpj')).toBe('12.345.6');
      expect(formatDocument('123456780001', 'cnpj')).toBe('12.345.678/0001');
      expect(formatDocument('12345678000199', 'cnpj')).toBe('12.345.678/0001-99');
    });

    it('DocumentInput_formatDocument_ShouldChooseTheTypeAutomatically', () => {
      expect(formatDocument('12345678901')).toBe('123.456.789-01');
      expect(formatDocument('123456789012')).toBe('12.345.678/9012');
      expect(formatDocument('12345678000199')).toBe('12.345.678/0001-99');
    });

    it('DocumentInput_formatDocument_ShouldRespectTheExplicitType', () => {
      expect(formatDocument('12345678901', 'cnpj')).toBe('12.345.678/901');
      expect(formatDocument('12345678901', 'cpf')).toBe('123.456.789-01');
      expect(formatDocument('12345678000199', 'cpf')).toBe('123.456.780-00');
    });

    it('DocumentInput_formatDocument_ShouldIgnoreNonDigits', () => {
      expect(formatDocument('abc')).toBe('');
      expect(formatDocument('123.456.789-01')).toBe('123.456.789-01');
    });
  });

  describe('parseDocument', () => {
    it('DocumentInput_parseDocument_ShouldKeepOnlyDigits', () => {
      expect(parseDocument('123.456.789-01')).toBe('12345678901');
      expect(parseDocument('12.345.678/0001-99')).toBe('12345678000199');
      expect(parseDocument('')).toBe('');
    });
  });

  describe('isValidCpf', () => {
    it('DocumentInput_isValidCpf_ShouldAcceptValidNumbers', () => {
      expect(isValidCpf('52998224725')).toBe(true);
      expect(isValidCpf('529.982.247-25')).toBe(true);
    });

    it('DocumentInput_isValidCpf_ShouldRejectInvalidNumbers', () => {
      expect(isValidCpf('52998224724')).toBe(false);
      expect(isValidCpf('11111111111')).toBe(false);
      expect(isValidCpf('5299822472')).toBe(false);
      expect(isValidCpf('')).toBe(false);
    });
  });

  describe('isValidCnpj', () => {
    it('DocumentInput_isValidCnpj_ShouldAcceptValidNumbers', () => {
      expect(isValidCnpj('11222333000181')).toBe(true);
      expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
      expect(isValidCnpj('11444777000161')).toBe(true);
    });

    it('DocumentInput_isValidCnpj_ShouldRejectInvalidNumbers', () => {
      expect(isValidCnpj('11222333000180')).toBe(false);
      expect(isValidCnpj('11111111111111')).toBe(false);
      expect(isValidCnpj('1122233300018')).toBe(false);
      expect(isValidCnpj('')).toBe(false);
    });
  });

  it('DocumentInput_DefaultValue_ShouldRenderFormattedCpf', () => {
    render(<DocumentInput aria-label="Document" defaultValue="52998224725" />);

    expect(screen.getByLabelText('Document')).toHaveValue('529.982.247-25');
  });

  it('DocumentInput_DefaultValue_ShouldRenderFormattedCnpj', () => {
    render(<DocumentInput aria-label="Document" defaultValue="11222333000181" />);

    expect(screen.getByLabelText('Document')).toHaveValue('11.222.333/0001-81');
  });

  it('DocumentInput_Type_ShouldFormatProgressiveCpf', async () => {
    const user = userEvent.setup();

    render(<DocumentInput aria-label="Document" />);

    const input = screen.getByLabelText('Document');
    await user.type(input, '52998224725');

    expect(input).toHaveValue('529.982.247-25');
  });

  it('DocumentInput_Type_ShouldFormatCnpjWhenDocumentTypeIsCnpj', async () => {
    const user = userEvent.setup();

    render(<DocumentInput aria-label="Document" documentType="cnpj" />);

    await user.type(screen.getByLabelText('Document'), '11222333000181');

    expect(screen.getByLabelText('Document')).toHaveValue('11.222.333/0001-81');
  });

  it('DocumentInput_Type_ShouldSwitchFromCpfToCnpjInAutoMode', async () => {
    const user = userEvent.setup();

    render(<DocumentInput aria-label="Document" />);

    const input = screen.getByLabelText('Document');

    await user.type(input, '52998224725');

    expect(input).toHaveValue('529.982.247-25');

    await user.type(input, '99');

    expect(input).toHaveValue('52.998.224/7259-9');
  });

  it('DocumentInput_Paste_ShouldFilterCharactersAndFormat', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DocumentInput aria-label="Document" onChange={onChange} />);

    const input = screen.getByLabelText('Document');
    await user.click(input);
    await user.paste('CPF: 529.982.247-25');

    expect(input).toHaveValue('529.982.247-25');
    expect(onChange).toHaveBeenLastCalledWith('529.982.247-25');
  });

  it('DocumentInput_Change_ShouldReportFormattedValue', () => {
    const onChange = jest.fn();

    render(<DocumentInput aria-label="Document" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Document'), {
      target: { value: '11222333000181' }
    });

    expect(onChange).toHaveBeenLastCalledWith('11.222.333/0001-81');
  });

  it('DocumentInput_Controlled_ShouldFollowValueProp', () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <DocumentInput aria-label="Document" value="52998224725" onChange={onChange} />
    );

    const input = screen.getByLabelText('Document');
    expect(input).toHaveValue('529.982.247-25');

    fireEvent.change(input, { target: { value: '11222333000181' } });

    expect(onChange).toHaveBeenLastCalledWith('11.222.333/0001-81');
    expect(input).toHaveValue('529.982.247-25');

    rerender(<DocumentInput aria-label="Document" value="11222333000181" onChange={onChange} />);

    expect(input).toHaveValue('11.222.333/0001-81');
  });

  it('DocumentInput_Disabled_ShouldNotBeEditable', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<DocumentInput aria-label="Document" disabled onChange={onChange} />);

    const input = screen.getByLabelText('Document');
    expect(input).toBeDisabled();

    await user.type(input, '52998224725');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('DocumentInput_hasNoA11yViolations', async () => {
    const { container } = render(
      <div>
        <DocumentInput aria-label="CPF" defaultValue="52998224725" />
        <DocumentInput aria-label="CNPJ" disabled documentType="cnpj" />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
