import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { CopyButton } from '@nebular-react/core';

describe('CopyButton', () => {
  const writeText = jest.fn<Promise<void>, [string]>();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
  });

  // userEvent.setup() attaches its own clipboard stub, so the clipboard mock
  // must be installed after the user event instance is created.
  const stubClipboard = (impl: unknown) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: impl
    });
  };

  const stubExecCommand = (impl: unknown) => {
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: impl
    });
  };

  it('renders the default label and copies the value with the clipboard api', async () => {
    const user = userEvent.setup();
    stubClipboard({ writeText });

    render(<CopyButton value="hello world" />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('shows the copied label and calls onCopied after a successful copy', async () => {
    const user = userEvent.setup();
    stubClipboard({ writeText });
    const onCopied = jest.fn();

    render(<CopyButton value="abc" copiedLabel="Copiado!" onCopied={onCopied} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(await screen.findByRole('button', { name: 'Copiado!' })).toBeInTheDocument();
    expect(onCopied).toHaveBeenCalledWith('abc');
    expect(screen.getByRole('status')).toHaveTextContent('Copiado!');
  });

  it('reverts to the default label after the timeout', async () => {
    const user = userEvent.setup();
    stubClipboard({ writeText });

    render(<CopyButton value="abc" timeout={300} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(await screen.findByRole('button', { name: 'Copiado!' })).toBeInTheDocument();

    await waitFor(
      () => expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('does not call onCopied when the copy fails', async () => {
    const user = userEvent.setup();
    writeText.mockRejectedValue(new Error('denied'));
    stubClipboard({ writeText });
    const execCommand = jest.fn(() => false);
    stubExecCommand(execCommand);
    const onCopied = jest.fn();

    render(<CopyButton value="abc" onCopied={onCopied} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    await waitFor(() => expect(execCommand).toHaveBeenCalled());
    expect(onCopied).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
  });

  it('falls back to execCommand when the clipboard api is unavailable', async () => {
    const user = userEvent.setup();
    stubClipboard(undefined);
    let copiedValue: string | undefined;
    const execCommand = jest.fn(() => {
      copiedValue = (document.querySelector('textarea') as HTMLTextAreaElement | null)?.value;
      return true;
    });
    stubExecCommand(execCommand);
    const onCopied = jest.fn();

    render(<CopyButton value="fallback-value" onCopied={onCopied} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
    expect(copiedValue).toBe('fallback-value');
    expect(document.querySelector('textarea')).toBeNull();
    expect(onCopied).toHaveBeenCalledWith('fallback-value');
  });

  it('clears the pending timeout on unmount', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    stubClipboard({ writeText });

    const { unmount } = render(<CopyButton value="abc" timeout={1000} />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Copiado!' })).toBeInTheDocument()
    );
    expect(jest.getTimerCount()).toBe(1);

    unmount();
    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CopyButton value="abc" />);

    expect(await axe(container)).toHaveNoViolations();
  });
});
