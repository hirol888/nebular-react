import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Button, Modal } from '@nebular-react/core';

describe('Modal', () => {
  it('does not render anything while closed', () => {
    render(
      <Modal opened={false} onClose={jest.fn()} title="Settings">
        Modal content
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders title, content and footer when opened', () => {
    render(
      <Modal opened onClose={jest.fn()} title="Settings" footer={<Button>Save</Button>}>
        Modal content
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveTextContent('Modal content');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('closes through the close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <Modal opened onClose={onClose} title="Settings">
        Modal content
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the close button when withCloseButton is false', () => {
    render(
      <Modal opened onClose={jest.fn()} title="Settings" withCloseButton={false}>
        Modal content
      </Modal>
    );

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });

  it('closes on Escape and respects closeOnEsc', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <Modal opened onClose={onClose} title="Settings">
        Modal content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal opened onClose={onClose} closeOnEsc={false} title="Settings">
        Modal content
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click and respects closeOnOverlayClick', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const { rerender } = render(
      <Modal opened onClose={onClose} title="Settings">
        Modal content
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Close modal overlay' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Modal opened onClose={onClose} closeOnOverlayClick={false} title="Settings">
        Modal content
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: 'Close modal overlay' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog, locks body scroll and restores focus on close', () => {
    const { rerender } = render(
      <>
        <Button>Open modal</Button>
        <Modal opened={false} onClose={jest.fn()} title="Settings">
          Modal content
        </Modal>
      </>
    );

    const trigger = screen.getByRole('button', { name: 'Open modal' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    rerender(
      <>
        <Button>Open modal</Button>
        <Modal opened onClose={jest.fn()} title="Settings">
          Modal content
        </Modal>
      </>
    );

    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <Button>Open modal</Button>
        <Modal opened={false} onClose={jest.fn()} title="Settings">
          Modal content
        </Modal>
      </>
    );

    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('has no accessibility violations', async () => {
    render(
      <Modal opened onClose={jest.fn()} title="Settings" footer={<Button>Save changes</Button>}>
        Modal content
      </Modal>
    );

    expect(await axe(screen.getByRole('dialog'))).toHaveNoViolations();
  });
});
