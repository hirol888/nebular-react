import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { AuditTrail, AuditTrailGroup } from '@nebular-react/core';

const groups: AuditTrailGroup[] = [
  {
    id: 'dec-02',
    label: 'December 2, 2025',
    entries: [
      {
        id: 'approval',
        title: 'Approved invoice',
        actor: 'Ana Costa',
        dateTime: '2025-12-02T15:00:00Z',
        timeLabel: '12:00 BRT',
        description: 'Reconciliation completed.',
        changes: [{ id: 'status', label: 'Status', before: 'Pending', after: 'Approved' }]
      },
      {
        id: 'review',
        title: 'Reviewed invoice',
        actor: 'João Lima',
        dateTime: '2025-12-02T14:00:00Z'
      }
    ]
  },
  {
    id: 'dec-01',
    label: 'December 1, 2025',
    entries: [
      {
        id: 'created',
        title: 'Created invoice',
        actor: 'Ana Costa',
        dateTime: '2025-12-01T14:00:00Z'
      }
    ]
  }
];

describe('AuditTrail', () => {
  it('renders groups, event authors and machine-readable dates in input order', () => {
    render(<AuditTrail groups={groups} />);

    const trail = screen.getByRole('region', { name: 'Audit trail' });
    expect(
      within(trail)
        .getAllByRole('heading')
        .map((heading) => heading.textContent)
    ).toEqual(['December 2, 2025', 'December 1, 2025']);
    expect(within(trail).getByText('João Lima')).toBeInTheDocument();
    expect(within(trail).getByText('12:00 BRT')).toHaveAttribute(
      'datetime',
      '2025-12-02T15:00:00Z'
    );
    expect(within(trail).getByText('Reconciliation completed.')).toBeInTheDocument();
    expect(within(trail).getAllByRole('button')).toHaveLength(1);
  });

  it('opens and closes a field comparison by keyboard', async () => {
    const user = userEvent.setup();
    render(<AuditTrail groups={groups} />);

    const trigger = screen.getByRole('button', { name: /show changes.*approved invoice/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Pending')).not.toBeInTheDocument();

    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const comparison = screen.getByRole('table', { name: 'Status: Before / After' });
    expect(within(comparison).getByText('Pending')).toBeInTheDocument();
    expect(within(comparison).getByText('Approved')).toBeInTheDocument();

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(comparison).not.toBeInTheDocument();
  });

  it('keeps the active disclosure with its event after reordering', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<AuditTrail groups={groups} />);
    const trigger = screen.getByRole('button', { name: /show changes/i });

    await user.click(trigger);
    rerender(
      <AuditTrail
        groups={[{ ...groups[0], entries: [...groups[0].entries].reverse() }, groups[1]]}
      />
    );

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('table', { name: 'Status: Before / After' })).toBeInTheDocument();
  });

  it('supports an empty state and localized labels', () => {
    render(<AuditTrail groups={[]} labels={{ trail: 'Histórico', empty: 'Nenhuma alteração' }} />);

    expect(screen.getByRole('region', { name: 'Histórico' })).toHaveTextContent(
      'Nenhuma alteração'
    );
  });

  it('has no accessibility violations with a comparison expanded', async () => {
    const user = userEvent.setup();
    const { container } = render(<AuditTrail groups={groups} />);

    await user.click(screen.getByRole('button', { name: /show changes/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
