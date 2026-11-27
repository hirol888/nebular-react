import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  JsonEditor,
  formatJson,
  minifyJson,
  tokenizeJson,
  validateJson
} from '@nebular-react/core';

describe('validateJson', () => {
  it('JsonEditor_ValidateJson_ShouldAcceptValidAndEmptyDocuments', () => {
    expect(validateJson('{"a":1}')).toEqual({ valid: true });
    expect(validateJson('')).toEqual({ valid: true });
    expect(validateJson('   ')).toEqual({ valid: true });
  });

  it('JsonEditor_ValidateJson_ShouldReportLineAndColumn', () => {
    const result = validateJson('{ oops }');

    expect(result.valid).toBe(false);
    expect(result.error?.line).toBe(1);
    expect(result.error?.column).toBe(3);
    expect(result.error?.message).toMatch(/expected/i);
  });

  it('JsonEditor_ValidateJson_ShouldLocateErrorsOnLaterLines', () => {
    const result = validateJson('{\n  "a": 1,\n}');

    expect(result.valid).toBe(false);
    expect(result.error?.line).toBe(3);
    expect(result.error?.column).toBe(1);
  });

  it('JsonEditor_ValidateJson_ShouldNeverThrow', () => {
    expect(() => validateJson('{"a": "unterminated}')).not.toThrow();
    expect(validateJson('{"a": "unterminated}').error?.line).toBe(1);
  });
});

describe('formatJson', () => {
  it('JsonEditor_FormatJson_ShouldIndentAndReturnNullForInvalidJson', () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
    expect(formatJson('[1,2]', 4)).toBe('[\n    1,\n    2\n]');
    expect(formatJson('{ oops }')).toBeNull();
  });

  it('JsonEditor_MinifyJson_ShouldStripWhitespace', () => {
    expect(minifyJson('{\n  "a": 1,\n  "b": [2]\n}')).toBe('{"a":1,"b":[2]}');
    expect(minifyJson('nope')).toBeNull();
  });
});

describe('tokenizeJson', () => {
  it('JsonEditor_TokenizeJson_ShouldSplitLinesAndClassifyTokens', () => {
    const lines = tokenizeJson('{"a": 1, "b": true}');

    expect(lines).toHaveLength(1);
    expect(lines[0].filter((token) => token.type === 'string').map((token) => token.value)).toEqual(
      ['"a"', '"b"']
    );
    expect(lines[0].some((token) => token.type === 'number' && token.value === '1')).toBe(true);
    expect(lines[0].some((token) => token.type === 'keyword' && token.value === 'true')).toBe(true);
    expect(tokenizeJson('{\n\n}')).toHaveLength(3);
  });
});

describe('JsonEditor', () => {
  it('JsonEditor_Render_ShouldShowToolbarHighlightAndLineNumbers', () => {
    const { container } = render(<JsonEditor defaultValue={'{\n  "name": "Nebular"\n}'} />);

    const textarea = screen.getByRole('textbox', { name: 'JSON editor' });

    expect(textarea).toHaveValue('{\n  "name": "Nebular"\n}');
    expect(screen.getByRole('button', { name: 'Formatar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minificar' })).toBeInTheDocument();

    const highlight = container.querySelector('[class*="nebular-json-editor-highlight"]');
    const gutter = container.querySelector('[class*="nebular-json-editor-gutter"]');

    expect(highlight).toHaveTextContent('"name"');
    expect(highlight?.textContent).toBe('{\n  "name": "Nebular"\n}');
    expect(highlight?.querySelectorAll('span').length).toBeGreaterThan(1);
    expect(gutter?.children).toHaveLength(3);
  });

  it('JsonEditor_Type_ShouldReportChangesAndValidate', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onValidate = jest.fn();

    render(<JsonEditor onChange={onChange} onValidate={onValidate} />);

    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'oops');

    expect(onChange).toHaveBeenLastCalledWith('oops');
    expect(onValidate).toHaveBeenLastCalledWith(expect.objectContaining({ valid: false }));
    expect(screen.getByRole('alert')).toHaveTextContent(/unexpected/i);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
  });

  it('JsonEditor_Validate_ShouldCallOnValidateWithValidResult', () => {
    const onValidate = jest.fn();

    render(<JsonEditor defaultValue='{"a": 1}' onValidate={onValidate} />);

    expect(onValidate).toHaveBeenLastCalledWith({ valid: true });
  });

  it('JsonEditor_Format_ShouldPrettyPrintTheValue', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<JsonEditor defaultValue='{"a":1,"b":[2,3]}' onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Formatar' }));

    const expected = '{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}';

    expect(onChange).toHaveBeenCalledWith(expected);
    expect(screen.getByRole('textbox')).toHaveValue(expected);
  });

  it('JsonEditor_Format_ShouldRespectIndentProp', async () => {
    const user = userEvent.setup();

    render(<JsonEditor defaultValue='{"a":1}' indent={4} />);

    await user.click(screen.getByRole('button', { name: 'Formatar' }));

    expect(screen.getByRole('textbox')).toHaveValue('{\n    "a": 1\n}');
  });

  it('JsonEditor_Minify_ShouldCompactTheValue', async () => {
    const user = userEvent.setup();

    render(<JsonEditor defaultValue={'{\n  "a": 1,\n  "b": [2]\n}'} />);

    await user.click(screen.getByRole('button', { name: 'Minificar' }));

    expect(screen.getByRole('textbox')).toHaveValue('{"a":1,"b":[2]}');
  });

  it('JsonEditor_InvalidJson_ShouldExposeAlertAndAriaWiring', () => {
    const { container } = render(<JsonEditor defaultValue='{"a": 1}' />);
    const textarea = screen.getByRole('textbox');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(textarea).not.toHaveAttribute('aria-invalid');

    fireEvent.change(textarea, { target: { value: '{ "a": }' } });

    const alert = screen.getByRole('alert');

    expect(alert).toHaveTextContent(/line 1, column 8/i);
    expect(textarea).toHaveAttribute('aria-invalid', 'true');

    const describedBy = textarea.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${describedBy}`)).toBe(alert);

    fireEvent.change(textarea, { target: { value: '{"a": 2}' } });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('JsonEditor_Controlled_ShouldKeepValueAndEmitChanges', () => {
    const onChange = jest.fn();

    render(<JsonEditor value='{"a": 1}' onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: '{"a": 2}' } });

    expect(onChange).toHaveBeenCalledWith('{"a": 2}');
    expect(textarea).toHaveValue('{"a": 1}');
  });

  it('JsonEditor_ReadOnly_ShouldBlockEditingAndToolbarActions', () => {
    render(<JsonEditor defaultValue='{"a": 1}' readOnly />);

    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Formatar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Minificar' })).toBeDisabled();
  });

  it('JsonEditor_Disabled_ShouldDisableInputAndToolbar', () => {
    render(<JsonEditor defaultValue='{"a": 1}' disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Formatar' })).toBeDisabled();
  });

  it('JsonEditor_Tab_ShouldInsertIndentation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<JsonEditor indent={4} onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    await user.click(textarea);
    await user.keyboard('{Tab}');

    expect(onChange).toHaveBeenLastCalledWith('    ');
    expect(textarea).toHaveValue('    ');
  });

  it('JsonEditor_Toolbar_ShouldBeOptional', () => {
    render(<JsonEditor defaultValue="{}" showToolbar={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('JsonEditor_Render_ShouldApplyHeightAndAccessibleLabel', () => {
    const { container } = render(<JsonEditor height={180} ariaLabel="API payload" />);

    expect(screen.getByRole('group', { name: 'API payload' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'API payload' })).toHaveAttribute(
      'placeholder',
      'Paste or write JSON here'
    );
    expect(container.querySelector('[class*="nebular-json-editor-editor"]')).toHaveStyle({
      height: '180px'
    });
  });

  it('JsonEditor_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(<JsonEditor defaultValue={'{\n  "a": 1\n}'} />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('JsonEditor_A11y_ShouldHaveNoViolationsOnError', async () => {
    const { container } = render(<JsonEditor defaultValue="{ oops }" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
