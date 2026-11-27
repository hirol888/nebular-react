import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CodeEditor, highlightCode } from '@nebular-react/core';

const languages = ['text', 'json', 'javascript', 'typescript', 'html', 'css'] as const;

type Language = (typeof languages)[number];

const samples: Record<Language, string> = {
  text: 'plain text',
  json: '{"name": "Nebular", "stable": true}',
  javascript: 'const answer = 42; const name = "Nebular"; // ui library',
  typescript: 'interface Props {\n  value: string;\n}',
  html: '<!-- intro --><a href="x">1</a>',
  css: '/* base */\n@media screen { .card { color: "red"; width: 10px; } }'
};

const highlightOf = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[class*="nebular-code-editor-highlight"]');

const gutterOf = (container: HTMLElement): HTMLElement | null =>
  container.querySelector('[class*="nebular-code-editor-gutter"]');

describe('highlightCode', () => {
  it('CodeEditor_HighlightCode_ShouldReconstructSourceForEveryLanguage', () => {
    languages.forEach((language) => {
      const source = samples[language];

      expect(
        highlightCode(source, language)
          .map((token) => token.text)
          .join('')
      ).toBe(source);
    });
  });

  it('CodeEditor_HighlightCode_ShouldReturnNoTokensForEmptyInput', () => {
    expect(highlightCode('', 'json')).toEqual([]);
    expect(highlightCode('', 'text')).toEqual([]);
  });

  it('CodeEditor_HighlightCode_ShouldClassifyJsonTokens', () => {
    const tokens = highlightCode('{"a": 1, "b": true}', 'json');

    expect(tokens.filter((token) => token.type === 'string').map((token) => token.text)).toEqual([
      '"a"',
      '"b"'
    ]);
    expect(tokens).toContainEqual({ text: '1', type: 'number' });
    expect(tokens).toContainEqual({ text: 'true', type: 'keyword' });
  });

  it('CodeEditor_HighlightCode_ShouldClassifyJavaScriptTokens', () => {
    const tokens = highlightCode(samples.javascript, 'javascript');

    expect(tokens).toContainEqual({ text: 'const', type: 'keyword' });
    expect(tokens).toContainEqual({ text: '42', type: 'number' });
    expect(tokens).toContainEqual({ text: '"Nebular"', type: 'string' });
    expect(tokens).toContainEqual({ text: '// ui library', type: 'comment' });
  });

  it('CodeEditor_HighlightCode_ShouldClassifyHtmlTokens', () => {
    const tokens = highlightCode(samples.html, 'html');

    expect(tokens).toContainEqual({ text: '<!-- intro -->', type: 'comment' });
    expect(tokens).toContainEqual({ text: '<a', type: 'tag' });
    expect(tokens).toContainEqual({ text: 'href', type: 'attribute' });
    expect(tokens).toContainEqual({ text: '"x"', type: 'string' });
    expect(tokens).toContainEqual({ text: '1', type: 'number' });
  });

  it('CodeEditor_HighlightCode_ShouldClassifyCssTokens', () => {
    const tokens = highlightCode(samples.css, 'css');

    expect(tokens).toContainEqual({ text: '/* base */', type: 'comment' });
    expect(tokens).toContainEqual({ text: '@media', type: 'keyword' });
    expect(tokens).toContainEqual({ text: 'color', type: 'property' });
    expect(tokens).toContainEqual({ text: '"red"', type: 'string' });
    expect(tokens).toContainEqual({ text: '10px', type: 'number' });
  });

  it('CodeEditor_HighlightCode_ShouldReturnPlainTokensForTextLanguage', () => {
    expect(highlightCode('const answer = 42;', 'text')).toEqual([
      { text: 'const answer = 42;', type: 'plain' }
    ]);
  });
});

describe('CodeEditor', () => {
  it('CodeEditor_Render_ShouldExposeTextareaGutterAndHighlight', () => {
    const code = 'const a = 1;\nconst b = 2;';
    const { container } = render(<CodeEditor defaultValue={code} language="typescript" />);
    const textarea = screen.getByRole('textbox', { name: 'Code editor' });
    const gutter = gutterOf(container);
    const highlight = highlightOf(container);

    expect(textarea).toHaveValue(code);
    expect(textarea).toHaveAttribute('aria-multiline', 'true');
    expect(gutter?.children).toHaveLength(2);
    expect(gutter?.children[0]).toHaveTextContent('1');
    expect(gutter?.children[1]).toHaveTextContent('2');
    expect(highlight?.textContent).toBe(code);
    expect(highlight?.querySelectorAll('[class*="tokenKeyword"]')).toHaveLength(2);
    expect(highlight?.querySelectorAll('[class*="tokenNumber"]')).toHaveLength(2);
  });

  it('CodeEditor_Render_ShouldHideLineNumbersWhenDisabled', () => {
    const { container } = render(<CodeEditor defaultValue="const a = 1;" lineNumbers={false} />);

    expect(gutterOf(container)).toBeNull();
  });

  it('CodeEditor_Render_ShouldApplyDefaultAndCustomHeight', () => {
    const { container, rerender } = render(<CodeEditor />);
    const editor = () => container.querySelector('[class*="nebular-code-editor-editor"]');

    expect(editor()).toHaveStyle({ height: '240px' });

    rerender(<CodeEditor height={120} />);
    expect(editor()).toHaveStyle({ height: '120px' });

    rerender(<CodeEditor height="50vh" />);
    expect(editor()).toHaveStyle({ height: '50vh' });
  });

  it('CodeEditor_Render_ShouldExposeLabelAndPlaceholder', () => {
    render(<CodeEditor ariaLabel="Config snippet" placeholder="Type code" />);

    const textarea = screen.getByRole('textbox', { name: 'Config snippet' });

    expect(textarea).toHaveAttribute('placeholder', 'Type code');
    expect(screen.getByRole('group', { name: 'Config snippet' })).toBeInTheDocument();
  });

  it('CodeEditor_Type_ShouldUpdateUncontrolledValueAndEmitChanges', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'abc');

    expect(textarea).toHaveValue('abc');
    expect(onChange).toHaveBeenLastCalledWith('abc');
  });

  it('CodeEditor_Controlled_ShouldEmitChangeButKeepValue', () => {
    const onChange = jest.fn();

    render(<CodeEditor value="const a = 1;" onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'const a = 2;' } });

    expect(onChange).toHaveBeenCalledWith('const a = 2;');
    expect(textarea).toHaveValue('const a = 1;');
  });

  it('CodeEditor_LineNumbers_ShouldFollowLineCount', () => {
    const { container } = render(<CodeEditor defaultValue={'a\nb'} />);
    const textarea = screen.getByRole('textbox');

    expect(gutterOf(container)?.children).toHaveLength(2);

    fireEvent.change(textarea, { target: { value: 'a\nb\nc' } });

    expect(gutterOf(container)?.children).toHaveLength(3);
  });

  it('CodeEditor_Language_ShouldHighlightJsonTokensInTheOverlay', () => {
    const { container } = render(
      <CodeEditor defaultValue='{"a": 1, "ok": true}' language="json" />
    );
    const highlight = highlightOf(container);

    expect(highlight?.querySelectorAll('[class*="tokenString"]')).toHaveLength(2);
    expect(highlight?.querySelectorAll('[class*="tokenNumber"]')).toHaveLength(1);
    expect(highlight?.querySelectorAll('[class*="tokenKeyword"]')).toHaveLength(1);
  });

  it('CodeEditor_Tab_ShouldInsertIndentationAtCaret', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor tabSize={4} onChange={onChange} />);

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');

    await user.click(textarea);
    await user.keyboard('{Tab}');

    expect(onChange).toHaveBeenLastCalledWith('    ');
    expect(textarea).toHaveValue('    ');
    expect(textarea).toHaveFocus();
    expect(textarea.selectionStart).toBe(4);
  });

  it('CodeEditor_ShiftTab_ShouldRemoveIndentation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor defaultValue="    const a = 1;" tabSize={2} onChange={onChange} />);

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');

    await user.click(textarea);
    textarea.setSelectionRange(8, 8);
    await user.keyboard('{Shift>}{Tab}{/Shift}');

    expect(onChange).toHaveBeenLastCalledWith('  const a = 1;');
    expect(textarea).toHaveValue('  const a = 1;');
    expect(textarea.selectionStart).toBe(6);
  });

  it('CodeEditor_ShiftTab_ShouldRemoveTabIndentation', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor defaultValue={'\tconst a = 1;'} onChange={onChange} />);

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');

    await user.click(textarea);
    textarea.setSelectionRange(1, 1);
    await user.keyboard('{Shift>}{Tab}{/Shift}');

    expect(onChange).toHaveBeenLastCalledWith('const a = 1;');
    expect(textarea).toHaveValue('const a = 1;');
    expect(textarea.selectionStart).toBe(0);
  });

  it('CodeEditor_Tab_ShouldIndentEverySelectedLine', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor defaultValue={'a\nb'} tabSize={2} onChange={onChange} />);

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');

    await user.click(textarea);
    textarea.setSelectionRange(0, 3);
    await user.keyboard('{Tab}');

    expect(onChange).toHaveBeenLastCalledWith('  a\n  b');
    expect(textarea).toHaveValue('  a\n  b');
  });

  it('CodeEditor_Enter_ShouldAutoIndentNewLine', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor defaultValue="  const a = 1;" tabSize={2} onChange={onChange} />);

    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox');

    await user.click(textarea);
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    await user.keyboard('{Enter}');

    const expected = '  const a = 1;\n  ';

    expect(onChange).toHaveBeenLastCalledWith(expected);
    expect(textarea).toHaveValue(expected);
    expect(textarea.selectionStart).toBe(expected.length);
  });

  it('CodeEditor_CtrlA_ShouldNotInterceptNativeSelectAll', () => {
    const onChange = jest.fn();

    render(<CodeEditor defaultValue="const a = 1;" onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    fireEvent.keyDown(textarea, { key: 'a', code: 'KeyA', ctrlKey: true });
    fireEvent.keyDown(textarea, { key: 'a', code: 'KeyA', metaKey: true });

    expect(onChange).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('const a = 1;');
  });

  it('CodeEditor_ReadOnly_ShouldBlockEditingShortcuts', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CodeEditor defaultValue="const a = 1;" readOnly onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    expect(textarea).toHaveAttribute('readonly');

    await user.click(textarea);
    await user.keyboard('{Enter}{Tab}');

    expect(textarea).toHaveValue('const a = 1;');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('CodeEditor_Disabled_ShouldDisableTextareaAndShortcuts', () => {
    const onChange = jest.fn();

    render(<CodeEditor defaultValue="const a = 1;" disabled onChange={onChange} />);

    const textarea = screen.getByRole('textbox');

    fireEvent.keyDown(textarea, { key: 'Enter' });
    fireEvent.keyDown(textarea, { key: 'Tab' });

    expect(textarea).toBeDisabled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('CodeEditor_Wrap_ShouldToggleSoftWrapping', () => {
    const { rerender } = render(<CodeEditor />);

    expect(screen.getByRole('textbox')).toHaveAttribute('wrap', 'off');

    rerender(<CodeEditor wrap />);

    expect(screen.getByRole('textbox')).toHaveAttribute('wrap', 'soft');
  });

  it('CodeEditor_Scroll_ShouldSyncHighlightAndGutter', () => {
    const { container } = render(<CodeEditor defaultValue={'a\nb\nc'} />);
    const textarea = screen.getByRole('textbox');
    const gutter = gutterOf(container);
    const highlight = highlightOf(container);

    textarea.scrollTop = 40;
    textarea.scrollLeft = 12;
    fireEvent.scroll(textarea);

    expect(gutter?.scrollTop).toBe(40);
    expect(highlight?.scrollTop).toBe(40);
    expect(highlight?.scrollLeft).toBe(12);
  });

  it('CodeEditor_Focus_ShouldReceiveFocusThroughKeyboardNavigation', async () => {
    const user = userEvent.setup();

    render(<CodeEditor />);

    await user.tab();

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('CodeEditor_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <CodeEditor
        defaultValue={samples.typescript}
        language="typescript"
        placeholder="Write TypeScript"
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
