import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { BulkActionBar } from '@nebular-react/core';

const actions = [
  { id: 'export', label: 'Export' },
  { id: 'archive', label: 'Archive', disabled: true }
];

describe('BulkActionBar', () => {
  it('offers page and filter-wide selection with independent callbacks', async () => {
    const user = userEvent.setup();
    const selectPage = jest.fn();
    const selectAllMatching = jest.fn();
    const clear = jest.fn();
    const { rerender } = render(
      <BulkActionBar
        selection={{ count: 0, scope: 'explicit' }}
        page={{ count: 25, selectedCount: 0 }}
        matchingCount={183}
        onSelectPage={selectPage}
        onSelectAllMatching={selectAllMatching}
        onClearSelection={clear}
      />
    );

    expect(within(screen.getByRole('region', { name: 'Bulk actions' })).getByRole('status'))
      .toHaveTextContent('0 selected');
    await user.click(screen.getByRole('button', { name: 'Select this page' }));
    await user.click(screen.getByRole('button', { name: 'Select all 183 results' }));
    expect(selectPage).toHaveBeenCalledTimes(1);
    expect(selectAllMatching).toHaveBeenCalledTimes(1);
    expect(clear).not.toHaveBeenCalled();

    rerender(
      <BulkActionBar
        selection={{ count: 183, scope: 'allMatching' }}
        page={{ count: 25, selectedCount: 25 }}
        matchingCount={183}
        onSelectPage={selectPage}
        onSelectAllMatching={selectAllMatching}
        onClearSelection={clear}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('All 183 results selected');
    expect(screen.getByRole('button', { name: 'Select this page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Select all 183 results' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('dispatches the action ID by keyboard and preserves disabled actions', async () => {
    const user = userEvent.setup();
    const activate = jest.fn();
    render(
      <BulkActionBar
        selection={{ count: 3, scope: 'explicit' }}
        actions={actions}
        onAction={activate}
      />
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Export' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    expect(activate.mock.calls).toEqual([['export']]);
  });

  it('blocks actions for an empty selection and controls while disabled', async () => {
    const user = userEvent.setup();
    const activate = jest.fn();
    const selectPage = jest.fn();
    const { rerender } = render(
      <BulkActionBar
        selection={{ count: 0, scope: 'explicit' }}
        actions={actions}
        onAction={activate}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Export' }));
    expect(activate).not.toHaveBeenCalled();

    rerender(
      <BulkActionBar
        selection={{ count: 3, scope: 'explicit' }}
        page={{ count: 10, selectedCount: 3 }}
        actions={actions}
        onAction={activate}
        onSelectPage={selectPage}
        disabled
      />
    );
    await user.click(screen.getByRole('button', { name: 'Select this page' }));
    await user.click(screen.getByRole('button', { name: 'Export' }));
    expect(selectPage).not.toHaveBeenCalled();
    expect(activate).not.toHaveBeenCalled();
  });

  it('has a named region, announces a localized selection, and passes axe', async () => {
    const { container } = render(
      <BulkActionBar
        selection={{ count: 1, scope: 'explicit' }}
        onClearSelection={() => {}}
        labels={{ region: 'Ações em lote', selection: ({ count }) => `${count} selecionado` }}
      />
    );

    const region = screen.getByRole('region', { name: 'Ações em lote' });
    expect(within(region).getByRole('status')).toHaveTextContent('1 selecionado');
    expect(await axe(container)).toHaveNoViolations();
  });
});
