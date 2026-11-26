import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ImageViewer } from '@nebular-react/core';

describe('ImageViewer', () => {
  it('renders a labelled thumbnail button', () => {
    render(<ImageViewer src="/nebula.png" alt="Nebula" />);

    const trigger = screen.getByRole('button', { name: 'Open image Nebula' });

    expect(trigger.querySelector('img')).toHaveAttribute('src', '/nebula.png');
    expect(trigger.querySelector('img')).toHaveAttribute('alt', 'Nebula');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the viewer through the thumbnail in a portal', async () => {
    const user = userEvent.setup();
    const { container } = render(<ImageViewer src="/nebula.png" alt="Nebula" />);

    await user.click(screen.getByRole('button', { name: 'Open image Nebula' }));

    const dialog = screen.getByRole('dialog', { name: 'Nebula' });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getAllByRole('img', { name: 'Nebula' })).toHaveLength(2);
    expect(document.body.contains(dialog)).toBe(true);
    expect(container.contains(dialog)).toBe(false);
  });

  it('closes through the close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = jest.fn();

    render(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('respects closeOnEsc', () => {
    const onClose = jest.fn();

    render(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        defaultOpened
        closeOnEsc={false}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Nebula' })).toBeInTheDocument();
  });

  it('closes on backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close image viewer overlay' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('respects closeOnOverlayClick', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        defaultOpened
        closeOnOverlayClick={false}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Close image viewer overlay' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Nebula' })).toBeInTheDocument();
  });

  it('does not close when the dialog content is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened onClose={onClose} />);

    await user.click(screen.getByRole('dialog', { name: 'Nebula' }));

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Nebula' })).toBeInTheDocument();
  });

  it('supports controlled state through opened and onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const onClose = jest.fn();
    const { rerender } = render(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        opened={false}
        onOpenChange={onOpenChange}
        onClose={onClose}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open image Nebula' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        opened
        onOpenChange={onOpenChange}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Nebula' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('dialog', { name: 'Nebula' })).toBeInTheDocument();
  });

  it('renders the download link only when enabled', () => {
    const { rerender } = render(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        defaultOpened
        withDownload
        downloadFileName="nebula.png"
      />
    );

    const link = screen.getByRole('link', { name: 'Download image' });

    expect(link).toHaveAttribute('href', '/nebula.png');
    expect(link).toHaveAttribute('download', 'nebula.png');

    rerender(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened />);

    expect(screen.queryByRole('link', { name: 'Download image' })).not.toBeInTheDocument();
  });

  it('renders the caption', () => {
    render(<ImageViewer src="/nebula.png" alt="Nebula" defaultOpened caption="Nebula in Carina" />);

    expect(screen.getByText('Nebula in Carina')).toBeInTheDocument();
  });

  it('locks body scroll, focuses the dialog and restores focus on close', () => {
    const renderViewer = (opened: boolean) => (
      <>
        <button type="button">Trigger</button>
        <ImageViewer src="/nebula.png" alt="Nebula" opened={opened} onClose={jest.fn()} />
      </>
    );
    const { rerender } = render(renderViewer(false));

    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();
    expect(trigger).toHaveFocus();

    rerender(renderViewer(true));

    expect(screen.getByRole('dialog', { name: 'Nebula' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    rerender(renderViewer(false));

    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('has no accessibility violations', async () => {
    render(
      <ImageViewer
        src="/nebula.png"
        alt="Nebula"
        defaultOpened
        caption="Nebula in Carina"
        withDownload
      />
    );

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
