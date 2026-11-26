import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { VersionHistory } from '@nebular-react/core';
import type { VersionHistoryRevision } from '@nebular-react/core';

const revisions: VersionHistoryRevision[] = [
  {
    id: '3',
    label: 'Version 3',
    content: 'Final draft',
    author: 'Lee',
    createdAt: '2025-03-10T12:00:00Z'
  },
  { id: '2', label: 'Version 2', content: 'Second draft', author: 'Cam' },
  { id: '1', label: 'Version 1', content: 'First draft' }
];

describe('VersionHistory', () => {
  it('lists metadata and compares any two revisions', async () => {
    const user = userEvent.setup();
    const change = jest.fn();
    const { container } = render(
      <VersionHistory revisions={revisions} onChange={change} currentId="3" />
    );
    expect(within(screen.getByRole('list', { name: 'Revisions' })).getByText('Lee')).toBeVisible();
    expect(screen.getByText('Mar 10, 2025')).toHaveAttribute(
      'datetime',
      '2025-03-10T12:00:00.000Z'
    );
    expect(screen.getByText('Second draft')).toBeVisible();
    expect(screen.getByText('Final draft')).toBeVisible();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Before' }), '1');
    expect(change).toHaveBeenCalledWith({ beforeId: '1', afterId: '3' });
    expect(screen.getByText('First draft')).toBeVisible();
    expect(screen.queryByText('Second draft')).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('honors controlled comparison and restores only an eligible revision', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onRestore = jest
      .fn()
      .mockRejectedValueOnce(new Error('Unavailable'))
      .mockResolvedValueOnce(undefined);
    const { rerender } = render(
      <VersionHistory
        revisions={revisions}
        value={{ beforeId: '1', afterId: '3' }}
        currentId="3"
        onChange={onChange}
        onRestore={onRestore}
      />
    );
    const restore = screen.getByRole('button', { name: 'Restore selected revision' });
    expect(restore).toBeDisabled();
    await user.selectOptions(screen.getByRole('combobox', { name: 'After' }), '2');
    expect(onChange).toHaveBeenCalledWith({ beforeId: '1', afterId: '2' });
    expect(restore).toBeDisabled();

    rerender(
      <VersionHistory
        revisions={revisions}
        value={{ beforeId: '1', afterId: '2' }}
        currentId="3"
        onRestore={onRestore}
      />
    );
    await user.click(restore);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not restore');
    expect(onRestore).toHaveBeenLastCalledWith(revisions[1]);
    await user.click(restore);
    expect(await screen.findByText('Revision restored.')).toBeVisible();
  });
});
