import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TraceWaterfall } from '@nebular-react/core';
import type { TraceWaterfallSpan } from '@nebular-react/core';

const spans: TraceWaterfallSpan[] = [
  {
    id: 'db',
    parentId: 'http',
    name: 'Find customer',
    service: 'db',
    startTime: 1025,
    duration: 30
  },
  { id: 'http', name: 'Fetch profile', service: 'api', startTime: 1000, duration: 80 },
  {
    id: 'cache',
    name: 'Write to cache',
    startTime: 1050,
    duration: 100,
    attributes: { 'cache.result': 'MISS' }
  }
];

describe('TraceWaterfall', () => {
  it('uses one time scale for all spans, and opens details using the keyboard', async () => {
    const user = userEvent.setup();
    const { container } = render(<TraceWaterfall spans={spans} />);
    const child = screen.getByRole('button', { name: /Find customer/ });
    const row = child.closest('li')!;
    expect(row).toHaveAttribute('aria-level', '2');
    const bar = row.querySelector<HTMLElement>('[aria-hidden="true"] > div')!;
    expect(parseFloat(bar.style.insetInlineStart)).toBeCloseTo((25 / 150) * 100);
    expect(parseFloat(bar.style.width)).toBeCloseTo((30 / 150) * 100);

    const cache = screen.getByRole('button', { name: /Write to cache/ });
    cache.focus();
    await user.keyboard('{Enter}');
    expect(cache).toHaveAttribute('aria-pressed', 'true');
    const details = screen.getByRole('region', { name: 'Span details' });
    expect(within(details).getByText('cache.result')).toBeInTheDocument();
    expect(within(details).getByText('MISS')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('notifies the host without changing controlled expansion or selection', async () => {
    const user = userEvent.setup();
    const expand = jest.fn();
    const select = jest.fn();
    const { rerender } = render(
      <TraceWaterfall
        spans={spans}
        expandedIds={['http']}
        onExpandedIdsChange={expand}
        selectedId={null}
        onSelectionChange={select}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Collapse Fetch profile' }));
    expect(expand).toHaveBeenCalledWith([]);
    expect(screen.getByRole('button', { name: /Find customer/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Write to cache/ }));
    expect(select).toHaveBeenCalledWith('cache');
    expect(screen.queryByRole('region', { name: 'Span details' })).not.toBeInTheDocument();

    rerender(<TraceWaterfall spans={spans} expandedIds={[]} selectedId="cache" />);
    expect(screen.queryByRole('button', { name: /Find customer/ })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Span details' })).toHaveTextContent(
      'Write to cache'
    );
  });

  it('preserves spans with missing parents and handles cycles, duplicate ids and invalid durations', () => {
    render(
      <TraceWaterfall
        spans={[
          { id: 'a', parentId: 'b', name: 'Alpha', startTime: 0, duration: 0 },
          { id: 'b', parentId: 'a', name: 'Beta', startTime: 10, duration: 1 },
          { id: 'c', parentId: 'missing', name: 'Gamma', startTime: 5, duration: 1 },
          { id: 'a', name: 'Duplicate', startTime: 2, duration: 1 },
          { id: 'd', name: 'Invalid', startTime: 8, duration: -1 }
        ]}
      />
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /^Alpha/ }).closest('li')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gamma/ }).closest('li')).toHaveAttribute(
      'aria-level',
      '1'
    );
    expect(screen.queryByText('Duplicate')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid')).not.toBeInTheDocument();
  });
});
