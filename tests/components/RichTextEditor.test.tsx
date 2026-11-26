import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  RichTextEditor,
  addTableColumn,
  addTableRow,
  findText,
  insertTable,
  removeTableColumn,
  removeTableRow,
  replaceText,
  sanitizeHtml
} from '@nebular-react/core';

const parseHtml = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;

  return container;
};

// Built dynamically so the lint rule against script URLs does not flag tests.
const SCRIPT_PROTOCOL = ['java', 'script:'].join('');

const PEOPLE = [
  { id: '1', label: 'Ana Souza' },
  { id: '2', label: 'Bruno Lima' },
  { id: '3', label: 'Carla Dias' }
];

const getEditor = (name = 'Content') => screen.getByRole('textbox', { name });

/** Finds the text node and offset that correspond to a character offset. */
const locateTextOffset = (root: Node, offset: number): { node: Text | null; offset: number } => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = Math.max(offset, 0);
  let node = walker.nextNode() as Text | null;
  let last: Text | null = null;

  while (node) {
    last = node;

    if (remaining <= node.data.length) {
      return { node, offset: remaining };
    }

    remaining -= node.data.length;
    node = walker.nextNode() as Text | null;
  }

  return { node: last, offset: last ? last.data.length : 0 };
};

const setEditorSelection = (editor: HTMLElement, start: number, end = start) => {
  const startPosition = locateTextOffset(editor, start);
  const endPosition = locateTextOffset(editor, end);
  const range = document.createRange();

  range.setStart(startPosition.node as Text, startPosition.offset);
  range.setEnd(endPosition.node as Text, endPosition.offset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

/** Writes content directly (jsdom has no real typing) and notifies React. */
const writeEditorContent = (editor: HTMLElement, html: string, caretOffset?: number) => {
  editor.innerHTML = html;
  setEditorSelection(editor, caretOffset ?? (editor.textContent ?? '').length);
  fireEvent.input(editor);
};

const getSelectedStartOffset = (): number => {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    return -1;
  }

  return selection.getRangeAt(0).startOffset;
};

describe('RichTextEditor', () => {
  it('renders default content and reports input changes', () => {
    const onChange = jest.fn();

    render(
      <RichTextEditor
        defaultValue="<p>Initial content</p>"
        onChange={onChange}
        ariaLabel="Description"
      />
    );

    const editor = screen.getByRole('textbox', { name: 'Description' });
    expect(editor).toHaveTextContent('Initial content');

    editor.innerHTML = '<p>Changed content</p>';
    fireEvent.input(editor);

    expect(onChange).toHaveBeenLastCalledWith('<p>Changed content</p>');
  });

  it('updates content when the controlled value changes', () => {
    const { rerender } = render(<RichTextEditor value="<p>First</p>" ariaLabel="Content" />);

    const editor = screen.getByRole('textbox', { name: 'Content' });
    expect(editor).toHaveTextContent('First');

    rerender(<RichTextEditor value="<p>Second</p>" ariaLabel="Content" />);

    expect(editor).toHaveTextContent('Second');
  });

  it('runs toolbar commands', async () => {
    const user = userEvent.setup();
    const execCommand = jest.fn().mockReturnValue(true);
    const originalExecCommand = document.execCommand;

    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true
    });

    render(<RichTextEditor ariaLabel="Content" />);

    await user.click(screen.getByRole('button', { name: 'Bold' }));
    expect(execCommand).toHaveBeenCalledWith('bold', false, undefined);

    await user.click(screen.getByRole('button', { name: 'Heading 1' }));
    expect(execCommand).toHaveBeenCalledWith('formatBlock', false, '<h1>');

    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
      configurable: true
    });
  });

  it('supports keyboard shortcuts', () => {
    const execCommand = jest.fn().mockReturnValue(true);
    const originalExecCommand = document.execCommand;

    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true
    });

    render(<RichTextEditor ariaLabel="Content" />);

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Content' }), {
      key: 'i',
      ctrlKey: true
    });

    expect(execCommand).toHaveBeenCalledWith('italic', false, undefined);

    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
      configurable: true
    });
  });

  it('does not run commands when disabled or read-only', () => {
    const execCommand = jest.fn().mockReturnValue(true);
    const originalExecCommand = document.execCommand;

    Object.defineProperty(document, 'execCommand', {
      value: execCommand,
      configurable: true
    });

    const { rerender } = render(<RichTextEditor disabled ariaLabel="Content" />);

    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();

    rerender(<RichTextEditor readOnly ariaLabel="Content" />);

    expect(screen.getByRole('textbox', { name: 'Content' })).toHaveAttribute(
      'contenteditable',
      'false'
    );
    expect(execCommand).not.toHaveBeenCalled();

    Object.defineProperty(document, 'execCommand', {
      value: originalExecCommand,
      configurable: true
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <RichTextEditor defaultValue="<p>Content</p>" ariaLabel="Content" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  describe('tables', () => {
    it('insertTable creates an accessible table at the requested position', () => {
      const html = insertTable('<p>Intro</p>', { rows: 3, columns: 2, at: 0 });
      const container = parseHtml(html);
      const table = container.querySelector('table');

      expect(container.firstElementChild?.tagName).toBe('TABLE');
      expect(table).not.toBeNull();
      expect(table?.querySelectorAll('thead th')).toHaveLength(2);
      expect(table?.querySelector('thead th')).toHaveAttribute('scope', 'col');
      expect(table?.querySelectorAll('tbody tr')).toHaveLength(2);
      expect(table?.querySelectorAll('tbody tr')[0].querySelectorAll('td')).toHaveLength(2);
    });

    it('adds and removes table rows', () => {
      const base = insertTable('', { rows: 2, columns: 2 });

      expect(parseHtml(base).querySelectorAll('tbody tr')).toHaveLength(1);

      const withRow = addTableRow(base);

      expect(parseHtml(withRow).querySelectorAll('tbody tr')).toHaveLength(2);

      const withoutRow = removeTableRow(withRow);

      expect(parseHtml(withoutRow).querySelectorAll('tbody tr')).toHaveLength(1);
    });

    it('adds and removes table columns', () => {
      const base = insertTable('', { rows: 2, columns: 2 });
      const withColumn = addTableColumn(base);
      const parsedWithColumn = parseHtml(withColumn);

      expect(parsedWithColumn.querySelectorAll('thead th')).toHaveLength(3);
      expect(parsedWithColumn.querySelectorAll('tbody tr')[0].querySelectorAll('td')).toHaveLength(
        3
      );

      const withoutColumn = parseHtml(removeTableColumn(withColumn));

      expect(withoutColumn.querySelectorAll('thead th')).toHaveLength(2);
      expect(withoutColumn.querySelectorAll('tbody tr')[0].querySelectorAll('td')).toHaveLength(2);
    });

    it('inserts a table with configurable dimensions from the toolbar', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <RichTextEditor defaultValue="<p>Intro</p>" onChange={onChange} ariaLabel="Content" />
      );

      await user.click(screen.getByRole('button', { name: 'Insert table' }));

      expect(screen.getByRole('dialog', { name: 'Insert table' })).toBeInTheDocument();

      const rows = screen.getByRole('spinbutton', { name: 'Rows' });
      const columns = screen.getByRole('spinbutton', { name: 'Columns' });

      await user.clear(rows);
      await user.type(rows, '3');
      await user.clear(columns);
      await user.type(columns, '2');
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      const editor = screen.getByRole('textbox', { name: 'Content' });
      const table = editor.querySelector('table');

      expect(table).not.toBeNull();
      expect(table?.querySelectorAll('thead th')).toHaveLength(2);
      expect(table?.querySelectorAll('tbody tr')).toHaveLength(2);
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('<table>'));
    });

    it('adds and removes rows and columns through the toolbar', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(
        <RichTextEditor
          defaultValue={insertTable('', { rows: 2, columns: 2 })}
          onChange={onChange}
          ariaLabel="Content"
        />
      );

      const editor = screen.getByRole('textbox', { name: 'Content' });
      expect(editor.querySelectorAll('tbody tr')).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Add row' }));
      expect(editor.querySelectorAll('tbody tr')).toHaveLength(2);

      await user.click(screen.getByRole('button', { name: 'Remove row' }));
      expect(editor.querySelectorAll('tbody tr')).toHaveLength(1);

      await user.click(screen.getByRole('button', { name: 'Add column' }));
      expect(editor.querySelectorAll('thead th')).toHaveLength(3);

      await user.click(screen.getByRole('button', { name: 'Remove column' }));
      expect(editor.querySelectorAll('thead th')).toHaveLength(2);
      expect(onChange).toHaveBeenCalled();
    });

    it('deletes a table through the toolbar', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor
          defaultValue={insertTable('', { rows: 2, columns: 2 })}
          ariaLabel="Content"
        />
      );

      const editor = screen.getByRole('textbox', { name: 'Content' });
      expect(editor.querySelector('table')).not.toBeNull();

      await user.click(screen.getByRole('button', { name: 'Delete table' }));

      expect(editor.querySelector('table')).toBeNull();
    });

    it('has no accessibility violations with a table', async () => {
      const { container } = render(
        <RichTextEditor
          defaultValue={insertTable('', { rows: 2, columns: 2 })}
          ariaLabel="Content"
        />
      );

      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('images', () => {
    it('uploads images through onImageUpload and inserts editable alt text', async () => {
      const user = userEvent.setup();
      const onImageUpload = jest.fn().mockResolvedValue('https://cdn.example.com/photo.png');
      const onChange = jest.fn();
      const { container } = render(
        <RichTextEditor onChange={onChange} onImageUpload={onImageUpload} ariaLabel="Content" />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('accept', 'image/*');

      const file = new File(['image'], 'photo.png', { type: 'image/png' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(onImageUpload).toHaveBeenCalledWith(file);

      const altInput = await screen.findByRole('textbox', { name: 'Alt text' });
      expect(altInput).toHaveValue('photo');

      fireEvent.change(altInput, { target: { value: 'A photo' } });
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      const editor = screen.getByRole('textbox', { name: 'Content' });
      const image = editor.querySelector('img');

      expect(image).toHaveAttribute('src', 'https://cdn.example.com/photo.png');
      expect(image).toHaveAttribute('alt', 'A photo');
      expect(image).toHaveAttribute('style', 'max-width: 100%');
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('<img'));
    });

    it('shows upload progress and reports upload errors', async () => {
      let rejectUpload: (error: Error) => void = () => undefined;
      const onImageUpload = jest.fn(
        () =>
          new Promise<string>((_resolve, reject) => {
            rejectUpload = reject;
          })
      );
      const { container } = render(
        <RichTextEditor onImageUpload={onImageUpload} ariaLabel="Content" />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, {
        target: { files: [new File(['image'], 'photo.png', { type: 'image/png' })] }
      });

      expect(await screen.findByRole('status')).toHaveTextContent('Uploading image');
      expect(screen.getByRole('button', { name: 'Insert' })).toBeDisabled();

      await act(async () => {
        rejectUpload(new Error('Upload failed'));
      });

      expect(await screen.findByRole('alert')).toHaveTextContent('Upload failed');
    });

    it('inserts an image from a URL when onImageUpload is not provided', async () => {
      const user = userEvent.setup();

      render(<RichTextEditor ariaLabel="Content" />);

      await user.click(screen.getByRole('button', { name: 'Insert image' }));
      await user.type(
        screen.getByRole('textbox', { name: 'Image URL' }),
        'https://example.com/pic.png'
      );
      await user.type(screen.getByRole('textbox', { name: 'Alt text' }), 'Picture');
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      const image = screen.getByRole('textbox', { name: 'Content' }).querySelector('img');

      expect(image).toHaveAttribute('src', 'https://example.com/pic.png');
      expect(image).toHaveAttribute('alt', 'Picture');
    });
  });

  describe('links', () => {
    it('inserts external links with target and rel attributes', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<RichTextEditor onChange={onChange} ariaLabel="Content" />);

      await user.click(screen.getByRole('button', { name: 'Insert link' }));
      await user.type(screen.getByRole('textbox', { name: 'URL' }), 'https://example.com');
      await user.type(screen.getByRole('textbox', { name: 'Text' }), 'Example');
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      const link = screen.getByRole('textbox', { name: 'Content' }).querySelector('a');

      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveTextContent('Example');
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('<a '));
    });

    it('edits internal links without target and removes them', async () => {
      const user = userEvent.setup();

      render(
        <RichTextEditor defaultValue='<p><a href="#section">Section</a></p>' ariaLabel="Content" />
      );

      const editor = screen.getByRole('textbox', { name: 'Content' });
      const link = editor.querySelector('a') as HTMLAnchorElement;
      const range = document.createRange();
      range.selectNodeContents(link);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      await user.click(screen.getByRole('button', { name: 'Insert link' }));

      const url = screen.getByRole('textbox', { name: 'URL' });
      expect(url).toHaveValue('#section');

      await user.clear(url);
      await user.type(url, '#features');
      await user.click(screen.getByRole('button', { name: 'Insert' }));

      const updated = editor.querySelector('a');

      expect(updated).toHaveAttribute('href', '#features');
      expect(updated).not.toHaveAttribute('target');

      await user.click(screen.getByRole('button', { name: 'Remove link' }));

      expect(editor.querySelector('a')).toBeNull();
      expect(editor).toHaveTextContent('Section');
    });

    it('notifies onLinkClick when a link is clicked', async () => {
      const user = userEvent.setup();
      const onLinkClick = jest.fn();

      render(
        <RichTextEditor
          defaultValue='<p><a href="https://example.com">Example</a></p>'
          onLinkClick={onLinkClick}
          ariaLabel="Content"
        />
      );

      await user.click(screen.getByRole('link', { name: 'Example' }));

      expect(onLinkClick).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('paste sanitization', () => {
    it('sanitizes pasted HTML before inserting it', () => {
      const onChange = jest.fn();

      render(<RichTextEditor onChange={onChange} ariaLabel="Content" />);

      const editor = screen.getByRole('textbox', { name: 'Content' });

      fireEvent.paste(editor, {
        clipboardData: {
          getData: (type: string) =>
            type === 'text/html'
              ? `<p onclick="alert(1)">Hello <script>alert(2)</script><strong>world</strong> <a href="${SCRIPT_PROTOCOL}alert(3)">link</a></p>`
              : ''
        }
      });

      const html = onChange.mock.calls.at(-1)?.[0] as string;

      expect(html).toContain('Hello');
      expect(html).toContain('<strong>world</strong>');
      expect(html).toContain('link');
      expect(html).not.toContain('onclick');
      expect(html).not.toContain('<script');
      expect(html).not.toContain(SCRIPT_PROTOCOL);
    });

    it('sanitizeHtml keeps basic formatting and removes dangerous content', () => {
      const clean = sanitizeHtml(
        '<div onmouseover="steal()"><style>p{}</style><iframe src="https://evil.test"></iframe>' +
          `<p>Safe <b>bold</b> <a href="${SCRIPT_PROTOCOL}alert(1)" target="_blank">bad</a></p>` +
          '<img src="data:text/html;base64,PHNjcmlwdD4=" onerror="alert(1)" />' +
          '<span style="width: expression(alert(1))">styled</span></div>'
      );

      expect(clean).toContain('<p>Safe <b>bold</b>');
      expect(clean).not.toContain('<style');
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('onmouseover');
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain(SCRIPT_PROTOCOL);
      expect(clean).not.toContain('data:');
      expect(clean).not.toContain('expression');
    });

    it('sanitizeHtml preserves plain text', () => {
      expect(sanitizeHtml('Plain text')).toBe('Plain text');
    });

    it('sanitizeHtml keeps tables and lists intact', () => {
      const table = insertTable('', { rows: 2, columns: 2 });

      expect(sanitizeHtml(table)).toBe(table);
      expect(sanitizeHtml('<ul><li>First</li><li>Second</li></ul>')).toBe(
        '<ul><li>First</li><li>Second</li></ul>'
      );
    });

    it('preserves plain text pastes without interpreting markup', () => {
      const onChange = jest.fn();

      render(<RichTextEditor onChange={onChange} ariaLabel="Content" />);

      fireEvent.paste(screen.getByRole('textbox', { name: 'Content' }), {
        clipboardData: {
          getData: (type: string) => (type === 'text/plain' ? '<b>Not bold</b>\nSecond line' : '')
        }
      });

      const html = onChange.mock.calls.at(-1)?.[0] as string;

      expect(html).toContain('&lt;b&gt;Not bold&lt;/b&gt;');
      expect(html).toMatch(/<br\s*\/?>/);
      expect(html).toContain('Second line');
      expect(html).not.toContain('<b>Not bold</b>');
    });
  });

  describe('toolbar and keyboard accessibility', () => {
    it('exposes accessible labels on every toolbar action', () => {
      const { container } = render(<RichTextEditor ariaLabel="Content" />);
      const labels = [
        'Bold',
        'Italic',
        'Underline',
        'Strike through',
        'Heading 1',
        'Heading 2',
        'Bullet list',
        'Numbered list',
        'Align left',
        'Align center',
        'Align right',
        'Undo',
        'Redo',
        'Clear formatting',
        'Insert table',
        'Add row',
        'Remove row',
        'Add column',
        'Remove column',
        'Delete table',
        'Insert image',
        'Insert link',
        'Remove link'
      ];

      labels.forEach((label) => {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      });

      expect(container.querySelector('input[type="file"]')).toHaveAttribute('accept', 'image/*');
    });

    it('opens the link dialog with Ctrl+K and closes it with Escape', async () => {
      render(<RichTextEditor ariaLabel="Content" />);

      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Content' }), {
        key: 'k',
        ctrlKey: true
      });

      expect(await screen.findByRole('dialog', { name: 'Insert link' })).toBeInTheDocument();

      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('opens the table dialog with Ctrl+Shift+T', async () => {
      render(<RichTextEditor ariaLabel="Content" />);

      fireEvent.keyDown(screen.getByRole('textbox', { name: 'Content' }), {
        key: 't',
        ctrlKey: true,
        shiftKey: true
      });

      expect(await screen.findByRole('dialog', { name: 'Insert table' })).toBeInTheDocument();
    });

    it('has no accessibility violations with a dialog open', async () => {
      const { container } = render(<RichTextEditor ariaLabel="Content" />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      expect(await axe(container)).toHaveNoViolations();
    });

    it('exposes labels for the rich text, mention and search actions', () => {
      render(<RichTextEditor ariaLabel="Content" />);

      ['Inline code', 'Code block', 'Find and replace'].forEach((label) => {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      });
    });

    it('hides the find action when findable is false', () => {
      render(<RichTextEditor ariaLabel="Content" findable={false} />);

      expect(screen.queryByRole('button', { name: 'Find and replace' })).not.toBeInTheDocument();
    });
  });

  describe('mentions', () => {
    it('opens a filtered listbox with an active option and no accessibility violations', async () => {
      const { container } = render(
        <RichTextEditor defaultValue="<p>Hello </p>" mentions={PEOPLE} ariaLabel="Content" />
      );

      const editor = getEditor();
      writeEditorContent(editor, '<p>Hello @</p>');

      const listbox = await screen.findByRole('listbox', { name: 'Mentions' });

      expect(within(listbox).getAllByRole('option')).toHaveLength(3);
      expect(editor).toHaveAttribute('aria-autocomplete', 'list');
      expect(editor).toHaveAttribute('aria-controls', listbox.id);

      writeEditorContent(editor, '<p>Hello @br</p>');

      const options = within(screen.getByRole('listbox', { name: 'Mentions' })).getAllByRole(
        'option'
      );

      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('@Bruno Lima');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(editor).toHaveAttribute('aria-activedescendant', options[0].id);

      expect(await axe(container)).toHaveNoViolations();
    });

    it('navigates with the arrow keys and inserts an accessible mention chip', () => {
      const onChange = jest.fn();
      const onMention = jest.fn();

      render(
        <RichTextEditor
          defaultValue="<p>@</p>"
          mentions={PEOPLE}
          onMention={onMention}
          onChange={onChange}
          ariaLabel="Content"
        />
      );

      const editor = getEditor();
      writeEditorContent(editor, '<p>@</p>');

      fireEvent.keyDown(editor, { key: 'ArrowDown' });
      fireEvent.keyDown(editor, { key: 'Enter' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      const chip = editor.querySelector('[data-mention-id="2"]');

      expect(chip).not.toBeNull();
      expect(chip).toHaveTextContent('@Bruno Lima');
      expect(chip).toHaveAttribute('contenteditable', 'false');
      expect(onMention).toHaveBeenCalledWith(PEOPLE[1]);
      expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('data-mention-id="2"'));
    });

    it('inserts a mention on click and supports a custom trigger', () => {
      const onMention = jest.fn();

      render(
        <RichTextEditor
          defaultValue="<p>Ping </p>"
          mentions={PEOPLE}
          mentionTrigger="#"
          onMention={onMention}
          ariaLabel="Content"
        />
      );

      const editor = getEditor();
      writeEditorContent(editor, '<p>Ping #ca</p>');

      const option = screen.getByRole('option', { name: '#Carla Dias' });
      fireEvent.mouseDown(option);
      fireEvent.click(option);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(editor.querySelector('[data-mention-id="3"]')).toHaveTextContent('#Carla Dias');
      expect(onMention).toHaveBeenCalledWith(PEOPLE[2]);
    });

    it('closes on Escape, on blur and when the query has no matches', () => {
      render(<RichTextEditor defaultValue="<p>Hi </p>" mentions={PEOPLE} ariaLabel="Content" />);

      const editor = getEditor();

      writeEditorContent(editor, '<p>Hi @</p>');
      expect(screen.getByRole('listbox', { name: 'Mentions' })).toBeInTheDocument();

      fireEvent.keyDown(editor, { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      writeEditorContent(editor, '<p>Hi @a</p>');
      expect(screen.getByRole('listbox', { name: 'Mentions' })).toBeInTheDocument();

      fireEvent.blur(editor);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      writeEditorContent(editor, '<p>Hi @zzz</p>');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('does not open the listbox when no mentions are provided', () => {
      render(<RichTextEditor defaultValue="<p>Hello </p>" ariaLabel="Content" />);

      const editor = getEditor();
      writeEditorContent(editor, '<p>Hello @an</p>');

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(editor).not.toHaveAttribute('aria-autocomplete');
    });
  });

  describe('code', () => {
    it('wraps and unwraps a selection with inline code', () => {
      const onChange = jest.fn();

      render(
        <RichTextEditor defaultValue="<p>Hello world</p>" onChange={onChange} ariaLabel="Content" />
      );

      const editor = getEditor();
      setEditorSelection(editor, 6, 11);

      fireEvent.click(screen.getByRole('button', { name: 'Inline code' }));

      const code = editor.querySelector('code');

      expect(code).not.toBeNull();
      expect(code).toHaveTextContent('world');
      expect(window.getSelection()?.toString()).toBe('world');
      expect(onChange).toHaveBeenLastCalledWith('<p>Hello <code>world</code></p>');

      fireEvent.click(screen.getByRole('button', { name: 'Inline code' }));

      expect(editor.querySelector('code')).toBeNull();
      expect(editor).toHaveTextContent('Hello world');
      expect(window.getSelection()?.toString()).toBe('world');
    });

    it('applies inline code with the Ctrl+E shortcut', () => {
      render(<RichTextEditor defaultValue="<p>Hello world</p>" ariaLabel="Content" />);

      const editor = getEditor();
      setEditorSelection(editor, 0, 5);

      fireEvent.keyDown(editor, { key: 'e', ctrlKey: true });

      expect(editor.querySelector('code')).toHaveTextContent('Hello');
      expect(editor.querySelector('pre')).toBeNull();
    });

    it('inserts an empty inline code and keeps the caret inside it', () => {
      render(<RichTextEditor defaultValue="<p>Hello world</p>" ariaLabel="Content" />);

      const editor = getEditor();
      setEditorSelection(editor, 5);

      fireEvent.click(screen.getByRole('button', { name: 'Inline code' }));

      const code = editor.querySelector('code');

      expect(code).not.toBeNull();
      expect(code).toHaveTextContent('');

      const selection = window.getSelection();

      expect(selection?.anchorNode).toBe(code);
      expect(selection?.anchorOffset).toBe(0);
    });

    it('converts the current block into a code block and back', () => {
      const onChange = jest.fn();

      render(
        <RichTextEditor
          defaultValue="<p>const x = 1;</p>"
          onChange={onChange}
          ariaLabel="Content"
        />
      );

      const editor = getEditor();
      setEditorSelection(editor, 7);

      fireEvent.click(screen.getByRole('button', { name: 'Code block' }));

      const pre = editor.querySelector('pre');

      expect(pre).not.toBeNull();
      expect(pre?.querySelector('code')).toHaveTextContent('const x = 1;');
      expect(editor.querySelector('p')).toBeNull();
      expect(window.getSelection()?.anchorOffset).toBe(7);
      expect(onChange).toHaveBeenLastCalledWith('<pre><code>const x = 1;</code></pre>');

      fireEvent.click(screen.getByRole('button', { name: 'Code block' }));

      expect(editor.querySelector('pre')).toBeNull();
      expect(editor.querySelector('p')).toHaveTextContent('const x = 1;');
    });

    it('applies a code block with the Ctrl+Shift+E shortcut', () => {
      render(<RichTextEditor defaultValue="<p>npm install</p>" ariaLabel="Content" />);

      const editor = getEditor();
      setEditorSelection(editor, 3);

      fireEvent.keyDown(editor, { key: 'E', ctrlKey: true, shiftKey: true });

      expect(editor.querySelector('pre > code')).toHaveTextContent('npm install');
      expect(editor.querySelector('code')?.closest('pre')).not.toBeNull();
    });

    it('keeps inline code and code blocks when sanitizing', () => {
      expect(sanitizeHtml('<p>Use <code>npm test</code> now</p>')).toBe(
        '<p>Use <code>npm test</code> now</p>'
      );
      expect(sanitizeHtml('<pre><code>const a = 1;</code></pre>')).toBe(
        '<pre><code>const a = 1;</code></pre>'
      );
      expect(sanitizeHtml('<span data-mention-id="2">@Bruno Lima</span>')).toBe(
        '<span data-mention-id="2">@Bruno Lima</span>'
      );
    });
  });

  describe('find and replace', () => {
    const openFindDialog = () => {
      fireEvent.click(screen.getByRole('button', { name: 'Find and replace' }));

      return screen.getByRole('dialog', { name: 'Find and replace' });
    };

    it('opens from the toolbar and counts the matches', async () => {
      render(<RichTextEditor defaultValue="<p>alpha beta alpha</p>" ariaLabel="Content" />);

      openFindDialog();

      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });

      expect(screen.getByRole('status')).toHaveTextContent('1 of 2');
      expect(window.getSelection()?.toString()).toBe('alpha');
      expect(getSelectedStartOffset()).toBe(0);
    });

    it('navigates between matches with next and previous', () => {
      render(<RichTextEditor defaultValue="<p>alpha beta alpha</p>" ariaLabel="Content" />);

      openFindDialog();
      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByRole('status')).toHaveTextContent('2 of 2');
      expect(getSelectedStartOffset()).toBe(11);

      fireEvent.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByRole('status')).toHaveTextContent('1 of 2');
      expect(getSelectedStartOffset()).toBe(0);

      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

      expect(screen.getByRole('status')).toHaveTextContent('2 of 2');
      expect(getSelectedStartOffset()).toBe(11);
    });

    it('replaces the current match preserving the surrounding HTML', () => {
      const onChange = jest.fn();

      render(
        <RichTextEditor
          defaultValue="<p>alpha <strong>beta</strong> alpha</p>"
          onChange={onChange}
          ariaLabel="Content"
        />
      );

      openFindDialog();
      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Replace' }), {
        target: { value: 'gamma' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Replace' }));

      const editor = getEditor();

      expect(editor.querySelector('strong')).toHaveTextContent('beta');
      expect(editor).toHaveTextContent('gamma beta alpha');
      expect(screen.getByRole('status')).toHaveTextContent('1 of 1');
      expect(onChange).toHaveBeenLastCalledWith('<p>gamma <strong>beta</strong> alpha</p>');
    });

    it('replaces all matches', () => {
      const onChange = jest.fn();

      render(
        <RichTextEditor
          defaultValue="<p>alpha <strong>beta</strong> alpha</p>"
          onChange={onChange}
          ariaLabel="Content"
        />
      );

      openFindDialog();
      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });
      fireEvent.change(screen.getByRole('textbox', { name: 'Replace' }), {
        target: { value: 'gamma' }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Replace all' }));

      const editor = getEditor();

      expect(editor).toHaveTextContent('gamma beta gamma');
      expect(editor.querySelector('strong')).toHaveTextContent('beta');
      expect(screen.getByRole('status')).toHaveTextContent('0 of 0');
      expect(onChange).toHaveBeenLastCalledWith('<p>gamma <strong>beta</strong> gamma</p>');
    });

    it('supports a case-sensitive toggle', async () => {
      const user = userEvent.setup();

      render(<RichTextEditor defaultValue="<p>Alpha alpha</p>" ariaLabel="Content" />);

      openFindDialog();
      fireEvent.change(screen.getByRole('textbox', { name: 'Find' }), {
        target: { value: 'alpha' }
      });

      expect(screen.getByRole('status')).toHaveTextContent('1 of 2');

      await user.click(screen.getByRole('checkbox', { name: 'Match case' }));

      expect(screen.getByRole('status')).toHaveTextContent('1 of 1');
      expect(getSelectedStartOffset()).toBe(6);
    });

    it('closes with Escape', async () => {
      render(<RichTextEditor defaultValue="<p>alpha</p>" ariaLabel="Content" />);

      const dialog = openFindDialog();

      fireEvent.keyDown(dialog, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('exposes pure findText and replaceText helpers', () => {
      expect(findText('Hello world', 'WORLD')).toBe(6);
      expect(findText('Hello world', 'WORLD', { caseSensitive: true })).toBe(-1);
      expect(findText('Hello world', '')).toBe(-1);
      expect(findText('Hello world', 'world', { fromIndex: 7 })).toBe(-1);

      expect(replaceText('a A a', 'a', 'b', { all: true })).toBe('b b b');
      expect(replaceText('a A a', 'a', 'b', { caseSensitive: true })).toBe('b A a');
      expect(replaceText('one two one', 'one', '1', { occurrence: 1 })).toBe('one two 1');
      expect(replaceText('abc', 'z', 'y')).toBe('abc');
    });

    it('has no accessibility violations with the find dialog open', async () => {
      const { container } = render(
        <RichTextEditor defaultValue="<p>alpha beta</p>" ariaLabel="Content" />
      );

      openFindDialog();

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
