import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MarkdownEditor } from '@nebular-react/core';

const sample = [
  '## Features',
  '',
  'Supports **bold**, *italic* and `code`.',
  '',
  '- first',
  '- second',
  ''
].join('\n');

describe('MarkdownEditor', () => {
  it('MarkdownEditor_Uncontrolled_ShouldUpdateValueOnTyping', async () => {
    const user = userEvent.setup();

    render(<MarkdownEditor defaultValue="Hello" ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, ' world', { initialSelectionStart: 5, initialSelectionEnd: 5 });

    expect(textarea).toHaveValue('Hello world');
    expect(screen.getByRole('article', { name: 'Notes Preview' })).toHaveTextContent('Hello world');
  });

  it('MarkdownEditor_Controlled_ShouldHonorValueAndOnChange', async () => {
    const user = userEvent.setup();

    function ControlledEditor() {
      const [value, setValue] = useState('Hello');

      return <MarkdownEditor value={value} onChange={setValue} ariaLabel="Notes" />;
    }

    render(<ControlledEditor />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    await user.type(textarea, '!', { initialSelectionStart: 5, initialSelectionEnd: 5 });

    expect(textarea).toHaveValue('Hello!');
  });

  it('MarkdownEditor_Toolbar_ShouldExposeAccessibleButtons', () => {
    render(<MarkdownEditor />);

    expect(screen.getByRole('toolbar', { name: 'Markdown formatting' })).toBeInTheDocument();

    [
      'Bold',
      'Italic',
      'Insert link',
      'Inline code',
      'Code block',
      'Bullet list',
      'Quote',
      'Heading'
    ].forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    });
  });

  it('MarkdownEditor_ToolbarBold_ShouldWrapSelectionAndPreserveIt', () => {
    render(<MarkdownEditor defaultValue="hello world" ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5);

    fireEvent.click(screen.getByRole('button', { name: 'Bold' }));

    expect(textarea).toHaveValue('**hello** world');
    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(7);
  });

  it('MarkdownEditor_ToolbarLink_ShouldInsertLinkAndSelectUrlPlaceholder', () => {
    render(<MarkdownEditor defaultValue="Docs" ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);

    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));

    expect(textarea).toHaveValue('[Docs](https://)');
    expect(textarea.selectionStart).toBe(7);
    expect(textarea.selectionEnd).toBe(15);
  });

  it('MarkdownEditor_ToolbarInlineCode_ShouldWrapSelectionWithBackticks', () => {
    render(<MarkdownEditor defaultValue="value" ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 5);

    fireEvent.click(screen.getByRole('button', { name: 'Inline code' }));

    expect(textarea).toHaveValue('`value`');
  });

  it('MarkdownEditor_ToolbarCodeBlock_ShouldInsertFencedBlock', () => {
    render(<MarkdownEditor defaultValue="const a = 1;" ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, textarea.value.length);

    fireEvent.click(screen.getByRole('button', { name: 'Code block' }));

    expect(textarea).toHaveValue('```\nconst a = 1;\n```\n');
  });

  it('MarkdownEditor_ToolbarBlocks_ShouldPrefixLines', () => {
    const first = render(<MarkdownEditor defaultValue={'one\ntwo'} ariaLabel="Notes" />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;

    textarea.setSelectionRange(0, textarea.value.length);
    fireEvent.click(screen.getByRole('button', { name: 'Bullet list' }));

    expect(textarea).toHaveValue('- one\n- two');
    first.unmount();

    const second = render(<MarkdownEditor defaultValue="quoted" ariaLabel="Notes" />);

    fireEvent.click(screen.getByRole('button', { name: 'Quote' }));

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('> quoted');
    second.unmount();

    render(<MarkdownEditor defaultValue="Title" ariaLabel="Notes" />);

    fireEvent.click(screen.getByRole('button', { name: 'Heading' }));

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('## Title');
  });

  it('MarkdownEditor_Shortcuts_ShouldSupportBoldItalicAndLink', () => {
    const first = render(<MarkdownEditor defaultValue="hello" ariaLabel="Notes" />);
    const boldTextarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;

    boldTextarea.setSelectionRange(0, 5);
    fireEvent.keyDown(boldTextarea, { key: 'b', ctrlKey: true });

    expect(boldTextarea).toHaveValue('**hello**');
    first.unmount();

    const second = render(<MarkdownEditor defaultValue="hello" ariaLabel="Notes" />);
    const italicTextarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;

    italicTextarea.setSelectionRange(0, 5);
    fireEvent.keyDown(italicTextarea, { key: 'i', metaKey: true });

    expect(italicTextarea).toHaveValue('*hello*');
    second.unmount();

    render(<MarkdownEditor defaultValue="hello" ariaLabel="Notes" />);

    const linkTextarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;

    linkTextarea.setSelectionRange(0, 5);
    fireEvent.keyDown(linkTextarea, { key: 'k', ctrlKey: true });

    expect(linkTextarea).toHaveValue('[hello](https://)');
  });

  it('MarkdownEditor_PreviewMode_ShouldSwitchBetweenEditSplitAndPreview', async () => {
    const user = userEvent.setup();
    const onPreviewModeChange = jest.fn();

    render(
      <MarkdownEditor
        defaultValue="# Title"
        defaultPreviewMode="split"
        onPreviewModeChange={onPreviewModeChange}
        ariaLabel="Notes"
      />
    );

    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Preview' }));

    expect(onPreviewModeChange).toHaveBeenCalledWith('preview');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Edit' }));

    expect(onPreviewModeChange).toHaveBeenLastCalledWith('edit');
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('MarkdownEditor_PreviewMode_ShouldRespectControlledMode', () => {
    const { rerender } = render(<MarkdownEditor previewMode="preview" defaultValue="Text" />);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();

    rerender(<MarkdownEditor previewMode="edit" defaultValue="Text" />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('MarkdownEditor_SyncScroll_ShouldMirrorRelativeScrollPosition', () => {
    render(<MarkdownEditor defaultValue={'line\n'.repeat(50)} syncScroll ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' }) as HTMLTextAreaElement;
    const preview = screen.getByRole('article').parentElement as HTMLElement;

    Object.defineProperty(textarea, 'scrollHeight', { configurable: true, value: 1000 });
    Object.defineProperty(textarea, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(preview, 'scrollHeight', { configurable: true, value: 500 });
    Object.defineProperty(preview, 'clientHeight', { configurable: true, value: 100 });

    textarea.scrollTop = 400;
    fireEvent.scroll(textarea);

    expect(preview.scrollTop).toBe(200);
  });

  it('MarkdownEditor_Preview_ShouldRenderMarkdownSafely', () => {
    render(
      <MarkdownEditor
        defaultValue={'**Bold** and `code`\n\n[Click](javascript:alert)'}
        previewMode="preview"
      />
    );

    expect(screen.getByText('Bold').tagName).toBe('STRONG');
    expect(screen.getByText('code').tagName).toBe('CODE');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('MarkdownEditor_ReadOnly_ShouldPreventEdits', () => {
    const onChange = jest.fn();

    render(<MarkdownEditor readOnly defaultValue="fixed" onChange={onChange} ariaLabel="Notes" />);

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();

    fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });

    expect(textarea).toHaveValue('fixed');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('MarkdownEditor_Disabled_ShouldDisableEditorAndToolbar', () => {
    render(<MarkdownEditor disabled defaultValue="fixed" ariaLabel="Notes" />);

    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Split' })).toBeDisabled();
  });

  it('MarkdownEditor_MaxLength_ShouldClampValueAndShowCounter', () => {
    const onChange = jest.fn();

    render(
      <MarkdownEditor defaultValue="abcd" maxLength={5} onChange={onChange} ariaLabel="Notes" />
    );

    const textarea = screen.getByRole('textbox', { name: 'Notes' });

    expect(textarea).toHaveAttribute('maxlength', '5');
    expect(screen.getByText('4 / 5')).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'abcdef' } });

    expect(onChange).toHaveBeenLastCalledWith('abcde');
    expect(textarea).toHaveValue('abcde');
    expect(screen.getByText('5 / 5')).toBeInTheDocument();
  });

  it('MarkdownEditor_ToolbarHidden_ShouldNotRenderFormattingControls', () => {
    render(<MarkdownEditor toolbar={false} defaultValue="Text" />);

    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('MarkdownEditor_A11y_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <MarkdownEditor defaultValue={sample} maxLength={500} ariaLabel="Notes" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
