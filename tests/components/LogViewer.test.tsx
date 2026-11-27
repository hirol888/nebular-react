import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { LogViewer } from '@nebular-react/core';
import type { LogViewerEntry } from '@nebular-react/core';

const logs: LogViewerEntry[] = Array.from({ length: 300 }, (_, index) => ({
  id: index,
  message: `Event ${index}`
}));

function viewport() {
  return screen.getByRole('region', { name: 'Log entries' });
}

describe('LogViewer', () => {
  it('renders a virtual window and exposes the total number of records', () => {
    render(<LogViewer entries={logs} height={72} rowHeight={24} defaultFollowing={false} />);

    const rows = within(viewport()).getAllByRole('listitem');
    expect(rows.length).toBeLessThan(20);
    expect(rows[0]).toHaveTextContent('Event 0');
    expect(rows[0]).toHaveAttribute('aria-setsize', '300');
    expect(screen.queryByText('Event 199')).not.toBeInTheDocument();

    fireEvent.scroll(viewport(), { target: { scrollTop: 24 * 180 } });
    expect(screen.getByText('Event 180')).toBeVisible();
    expect(screen.queryByText('Event 0')).not.toBeInTheDocument();
  });

  it('searches across virtualized records and filters by message, level and timestamp', async () => {
    const user = userEvent.setup();
    render(
      <LogViewer
        entries={[
          ...logs,
          { id: 'failure', message: 'Connection failed', level: 'ERROR', timestamp: '03:42' }
        ]}
        height={72}
      />
    );

    const search = screen.getByRole('searchbox', { name: 'Search logs' });
    await user.type(search, 'event 120');
    expect(screen.getByRole('status')).toHaveTextContent('1 matching entry');
    expect(screen.getByText('Event 120')).toBeVisible();
    expect(screen.queryByText('Event 121')).not.toBeInTheDocument();
    await user.clear(search);
    await user.type(search, '03:42 error');
    expect(screen.getByText('Connection failed')).toBeVisible();
    await user.clear(search);
    await user.type(search, 'missing');
    expect(screen.getByRole('status')).toHaveTextContent('No matching entries.');
  });

  it('follows arriving records and keeps the viewport in place while paused', async () => {
    const user = userEvent.setup();
    const follow = jest.fn();
    const { rerender } = render(
      <LogViewer entries={logs} height={72} rowHeight={24} onFollowingChange={follow} />
    );
    expect(viewport().scrollTop).toBe(24 * 300 - 72);
    expect(screen.getByText('Event 299')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Pause following' }));
    expect(follow).toHaveBeenLastCalledWith(false);
    const previousPosition = viewport().scrollTop;
    rerender(
      <LogViewer
        entries={[...logs, { id: 300, message: 'Arriving event' }]}
        height={72}
        rowHeight={24}
        onFollowingChange={follow}
      />
    );
    expect(viewport().scrollTop).toBe(previousPosition);

    await user.click(screen.getByRole('button', { name: 'Resume following' }));
    expect(follow).toHaveBeenLastCalledWith(true);
    expect(viewport().scrollTop).toBe(24 * 301 - 72);
    expect(screen.getByText('Arriving event')).toBeVisible();
  });

  it('updates the wrapped presentation without leaving multiline content clipped', async () => {
    const user = userEvent.setup();
    render(<LogViewer entries={[{ id: 'multiline', message: 'First\nSecond' }]} />);

    expect(screen.getByText('First ↵ Second')).toBeVisible();
    const toggle = screen.getByRole('checkbox', { name: 'Wrap lines' });
    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByRole('listitem')).toHaveTextContent('First Second');
    expect(screen.getByRole('listitem')).not.toHaveStyle({ height: '24px' });
  });

  it('uses the measured height of wrapped entries to find the visible window', () => {
    const original = HTMLElement.prototype.getBoundingClientRect;
    const measure = jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const bounds = original.call(this);
        if (!this.hasAttribute('data-log-row')) return bounds;
        const height = this.textContent === 'Event 0' ? 72 : 24;
        return { ...bounds, height, bottom: bounds.top + height };
      });

    try {
      render(
        <LogViewer
          entries={logs}
          height={48}
          rowHeight={24}
          overscan={0}
          defaultFollowing={false}
          defaultWrap
        />
      );
      fireEvent.scroll(viewport(), { target: { scrollTop: 48 } });
      expect(screen.getByText('Event 0')).toBeInTheDocument();
      fireEvent.scroll(viewport(), { target: { scrollTop: 72 } });
      expect(screen.queryByText('Event 0')).not.toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeVisible();
    } finally {
      measure.mockRestore();
    }
  });

  it('pauses automatically when scrolling back through the log', () => {
    const onFollowingChange = jest.fn();
    render(<LogViewer entries={logs} height={72} onFollowingChange={onFollowingChange} />);
    fireEvent.scroll(viewport(), { target: { scrollTop: 0 } });

    expect(onFollowingChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: 'Resume following' })).toBeInTheDocument();
    expect(screen.getByText('Event 0')).toBeVisible();
  });

  it('announces the empty state and supports customized accessible labels', async () => {
    const { container } = render(
      <LogViewer entries={[]} labels={{ search: 'Buscar logs', viewport: 'Registros' }} />
    );
    expect(screen.getByRole('searchbox', { name: 'Buscar logs' })).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Registros' })).getByText('No log entries.')
    ).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });
});
