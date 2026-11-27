import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { NebularProvider } from '@nebular-react/styles';
import { WindowStatusBar } from '@nebular-react/core';

describe('WindowStatusBar', () => {
  it('renders items, tones and the start, center and end slots', () => {
    render(
      <WindowStatusBar
        start={<span>Ready</span>}
        center={<span>project.ts</span>}
        end={<button type="button">Zoom</button>}
        items={[
          {
            key: 'sync',
            icon: <span data-testid="sync-icon">●</span>,
            label: 'Sync',
            value: 'Up to date',
            tone: 'success'
          },
          { key: 'encoding', label: 'UTF-8' }
        ]}
      >
        <span>Branch: main</span>
      </WindowStatusBar>
    );

    const bar = screen.getByRole('group', { name: 'Status bar' });
    expect(within(bar).getByText('Ready')).toBeInTheDocument();
    expect(within(bar).getByText('project.ts')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Zoom' })).toBeInTheDocument();
    expect(within(bar).getByTestId('sync-icon')).toBeInTheDocument();
    expect(within(bar).getByText('Branch: main')).toBeInTheDocument();
    expect(screen.getByText('Sync').closest('[data-tone]')).toHaveAttribute('data-tone', 'success');
    expect(screen.getByText('UTF-8').closest('[data-tone]')).toHaveAttribute(
      'data-tone',
      'default'
    );
  });

  it('renders clickable items as buttons and dispatches their callback', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <WindowStatusBar
        items={[
          {
            key: 'problems',
            label: 'Errors',
            value: 2,
            tone: 'danger',
            title: 'Open problems panel',
            onClick
          },
          { key: 'encoding', label: 'UTF-8' }
        ]}
      />
    );

    const problems = screen.getByRole('button', { name: /Errors/ });
    expect(problems).toHaveAttribute('data-tone', 'danger');
    expect(problems).toHaveAttribute('title', 'Open problems panel');
    expect(screen.queryByRole('button', { name: /UTF-8/ })).toBeNull();

    await user.click(problems);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('accepts an explicit aria label and the md size', () => {
    const { rerender } = render(
      <WindowStatusBar ariaLabel="Editor status" items={[{ key: 'mode', label: 'Mode' }]} />
    );

    const bar = screen.getByRole('group', { name: 'Editor status' });
    expect(bar).toHaveAttribute('data-size', 'sm');

    rerender(
      <WindowStatusBar
        ariaLabel="Editor status"
        size="md"
        bordered={false}
        items={[{ key: 'mode', label: 'Mode' }]}
      />
    );

    expect(screen.getByRole('group', { name: 'Editor status' })).toHaveAttribute('data-size', 'md');
  });

  it('uses the pt-BR catalog for the default region name', () => {
    render(
      <NebularProvider locale="pt-BR">
        <WindowStatusBar items={[{ key: 'encoding', label: 'UTF-8' }]} />
      </NebularProvider>
    );

    expect(screen.getByRole('group', { name: 'Barra de status' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <WindowStatusBar
        start={<span>Ready</span>}
        center={<span>src/WindowStatusBar.tsx</span>}
        end={<span>UTF-8</span>}
        items={[
          { key: 'info', label: 'Info', value: 'Running', tone: 'info' },
          { key: 'success', label: 'Success', value: 'Saved', tone: 'success' },
          { key: 'warning', label: 'Warning', value: 'Unsaved', tone: 'warning' },
          { key: 'danger', label: 'Danger', value: 'Offline', tone: 'danger', onClick: jest.fn() }
        ]}
      >
        <span>Ln 12, Col 4</span>
      </WindowStatusBar>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
