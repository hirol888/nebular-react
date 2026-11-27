import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { DesktopConnectionStatus, DesktopOfflineBanner } from '@nebular-react/core';

describe('DesktopOfflineBanner', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.navigator, 'onLine');
  });

  it('renders an offline status with default labels and retry action', () => {
    const onRetry = jest.fn();

    render(<DesktopOfflineBanner offline onRetry={onRetry} />);

    const banner = screen.getByRole('status');

    expect(banner).toHaveAttribute('aria-live', 'polite');
    expect(banner).toHaveAttribute('data-desktop-offline-state', 'offline');
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Changes will sync when the connection returns.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('supports custom labels and bottom placement', () => {
    render(
      <DesktopOfflineBanner
        offline
        position="bottom"
        title="Sem conexão"
        description="As alterações serão sincronizadas."
        retryLabel="Tentar novamente"
        onRetry={() => undefined}
      />
    );

    const banner = screen.getByRole('status');

    expect(banner).toHaveAttribute('data-desktop-offline-banner', 'bottom');
    expect(screen.getByText('Sem conexão')).toBeInTheDocument();
    expect(screen.getByText('As alterações serão sincronizadas.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
  });

  it('hides itself while online', () => {
    const { rerender } = render(<DesktopOfflineBanner offline={false} />);

    expect(screen.getByRole('status', { hidden: true })).toHaveAttribute('hidden');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    rerender(<DesktopOfflineBanner offline />);
    expect(screen.getByRole('status')).toBeVisible();
  });

  it('lets the online prop override offline', () => {
    render(<DesktopOfflineBanner offline online />);

    expect(screen.getByRole('status', { hidden: true })).toHaveAttribute('hidden');
  });

  it('follows the browser connectivity when uncontrolled', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    });

    render(<DesktopOfflineBanner />);
    expect(screen.getByRole('status')).toBeVisible();

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByRole('status', { hidden: true })).toHaveAttribute('hidden');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <DesktopOfflineBanner offline onRetry={() => undefined} description="Connection lost." />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('DesktopConnectionStatus', () => {
  it('renders an online status with a label', () => {
    render(<DesktopConnectionStatus online showLabel />);

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('data-desktop-connection-status', 'online');
    expect(status).toHaveTextContent('Online');
  });

  it('renders an offline status with custom labels', () => {
    render(
      <DesktopConnectionStatus
        online={false}
        showLabel
        labels={{ online: 'Conectado', offline: 'Sem conexão' }}
      />
    );

    const status = screen.getByRole('status');

    expect(status).toHaveAttribute('data-desktop-connection-status', 'offline');
    expect(status).toHaveTextContent('Sem conexão');
  });

  it('keeps an accessible name when the label is hidden', () => {
    render(<DesktopConnectionStatus online={false} />);

    expect(screen.getByRole('status', { name: 'Offline' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <DesktopConnectionStatus online showLabel />
        <DesktopConnectionStatus online={false} showLabel />
      </div>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
