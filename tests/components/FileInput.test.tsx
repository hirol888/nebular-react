import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { FileInput } from '@nebular-react/core';

const getFileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

const makeFile = (name: string, type = 'text/plain') => new File(['content'], name, { type });

describe('FileInput', () => {
  it('reports the selected file and shows its name', () => {
    const onChange = jest.fn();
    const { container } = render(<FileInput ariaLabel="Attachment" onChange={onChange} />);
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(getFileInput(container), { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  it('resets the native input so the same file can be selected again', () => {
    const onChange = jest.fn();
    const { container } = render(<FileInput onChange={onChange} />);
    const input = getFileInput(container);
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });
    expect(input.value).toBe('');

    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('clears the selected file and restores the placeholder', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <FileInput placeholder="No file selected" clearable onChange={onChange} />
    );
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(getFileInput(container), { target: { files: [file] } });
    await user.click(screen.getByRole('button', { name: 'Clear file' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText('No file selected')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear file' })).not.toBeInTheDocument();
  });

  it('disables the select button and hides the clear action', () => {
    const { container } = render(
      <FileInput
        disabled
        clearable
        defaultValue={new File(['content'], 'resume.pdf', { type: 'application/pdf' })}
      />
    );

    expect(screen.getByRole('button', { name: 'Select file' })).toBeDisabled();
    expect(getFileInput(container)).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Clear file' })).not.toBeInTheDocument();
  });

  it('accepts a custom button label and forwards accept', () => {
    const { container } = render(<FileInput buttonLabel="Upload" accept="image/*" />);

    expect(screen.getByRole('button', { name: 'Upload' })).toBeInTheDocument();
    expect(getFileInput(container)).toHaveAttribute('accept', 'image/*');
  });

  it('keeps a single file selection by default', () => {
    const onChange = jest.fn();
    const { container } = render(<FileInput onChange={onChange} />);
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');

    expect(getFileInput(container)).not.toHaveAttribute('multiple');

    fireEvent.change(getFileInput(container), { target: { files: [first, second] } });

    expect(onChange).toHaveBeenLastCalledWith(first);
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.queryByText('b.txt')).not.toBeInTheDocument();
  });

  it('reports an array of files in multiple mode', () => {
    const onChange = jest.fn();
    const { container } = render(
      <FileInput multiple ariaLabel="Attachments" onChange={onChange} />
    );
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');

    expect(getFileInput(container)).toHaveAttribute('multiple');

    fireEvent.change(getFileInput(container), { target: { files: [first, second] } });

    expect(onChange).toHaveBeenLastCalledWith([first, second]);
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('appends newly selected files in multiple mode', () => {
    const onChange = jest.fn();
    const { container } = render(<FileInput multiple onChange={onChange} />);
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');

    fireEvent.change(getFileInput(container), { target: { files: [first] } });
    fireEvent.change(getFileInput(container), { target: { files: [second] } });

    expect(onChange).toHaveBeenLastCalledWith([first, second]);
  });

  it('removes individual files in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(<FileInput multiple onChange={onChange} />);
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');

    fireEvent.change(getFileInput(container), { target: { files: [first, second] } });
    await user.click(screen.getByRole('button', { name: 'Remove b.txt' }));

    expect(onChange).toHaveBeenLastCalledWith([first]);
    expect(screen.getByText('a.txt')).toBeInTheDocument();
    expect(screen.queryByText('b.txt')).not.toBeInTheDocument();
  });

  it('respects maxFiles in multiple mode', () => {
    const onChange = jest.fn();
    const { container } = render(<FileInput multiple maxFiles={2} onChange={onChange} />);
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');
    const third = makeFile('c.txt');

    fireEvent.change(getFileInput(container), { target: { files: [first, second, third] } });

    expect(onChange).toHaveBeenLastCalledWith([first, second]);
    expect(screen.queryByText('c.txt')).not.toBeInTheDocument();

    fireEvent.change(getFileInput(container), { target: { files: [third] } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('clears every file in multiple mode', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const { container } = render(
      <FileInput multiple placeholder="No files selected" onChange={onChange} />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [makeFile('a.txt'), makeFile('b.txt')] }
    });
    await user.click(screen.getByRole('button', { name: 'Clear files' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByText('No files selected')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove a.txt' })).not.toBeInTheDocument();
  });

  it('keeps per-file removal available when clearable is false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const first = makeFile('a.txt');
    const second = makeFile('b.txt');
    render(
      <FileInput multiple clearable={false} defaultValue={[first, second]} onChange={onChange} />
    );

    expect(screen.queryByRole('button', { name: 'Clear files' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove a.txt' }));

    expect(onChange).toHaveBeenLastCalledWith([second]);
    expect(screen.queryByText('a.txt')).not.toBeInTheDocument();
    expect(screen.getByText('b.txt')).toBeInTheDocument();
  });

  it('hides remove and clear actions when disabled in multiple mode', () => {
    render(<FileInput multiple disabled defaultValue={[makeFile('a.txt'), makeFile('b.txt')]} />);

    expect(screen.getByRole('button', { name: 'Select file' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Remove a.txt' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear files' })).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FileInput ariaLabel="Attachment" label="Attachment" error="File is required" />
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in multiple mode', async () => {
    const { container } = render(
      <FileInput
        multiple
        ariaLabel="Attachments"
        label="Attachments"
        defaultValue={[makeFile('a.txt'), makeFile('b.txt')]}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
