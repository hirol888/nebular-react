import React, { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ResponsiveFilterBar } from '@nebular-react/core';

const filters = [
  { id: 'status', label: 'Status: Active' },
  { id: 'department', label: 'Department: Finance' }
];
const savedViews = [{ id: 'finance', label: 'Finance' }];
const editor = <button type="button">Add status rule</button>;

describe('ResponsiveFilterBar', () => {
  it('toggles the inline editor with the keyboard', async () => {
    const user = userEvent.setup();
    render(<ResponsiveFilterBar editor={editor} />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Add status rule' })).not.toBeInTheDocument();

    await user.tab();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-controls', panel.id);
    expect(within(panel).getByRole('button', { name: 'Add status rule' })).toBeVisible();
  });

  it('lets an editor close the panel and return focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <ResponsiveFilterBar
        editor={(close) => (
          <button type="button" onClick={close}>
            Apply
          </button>
        )}
      />
    );
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.queryByRole('region', { name: 'Filters' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('reports removals and clearing through the controlled callbacks and retains keyboard focus', async () => {
    const user = userEvent.setup();
    const ControlledBar = () => {
      const [active, setActive] = useState(filters);
      return (
        <ResponsiveFilterBar
          editor={editor}
          filters={active}
          onRemoveFilter={(id) => setActive(active.filter((filter) => filter.id !== id))}
          onClearFilters={() => setActive([])}
        />
      );
    };
    render(<ControlledBar />);
    const remove = screen.getByRole('button', { name: 'Remove Status: Active' });
    remove.focus();
    await user.keyboard(' ');
    expect(remove).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Department: Finance' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus();
  });

  it('presents saved views and reports selection by id', async () => {
    const user = userEvent.setup();
    const onSelectView = jest.fn();
    const { rerender } = render(
      <ResponsiveFilterBar editor={editor} savedViews={savedViews} onSelectView={onSelectView} />
    );
    const select = screen.getByRole('combobox', { name: 'Saved views' });
    await user.selectOptions(select, 'finance');
    expect(onSelectView).toHaveBeenCalledWith('finance');

    rerender(
      <ResponsiveFilterBar
        editor={editor}
        savedViews={savedViews}
        selectedViewId="finance"
        onSelectView={onSelectView}
      />
    );
    expect(select).toHaveValue('finance');
  });

  it('uses a compact dialog at the configured breakpoint and restores focus on Escape', async () => {
    const user = userEvent.setup();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      matches: query === '(max-width: 540px)'
    });
    try {
      const { baseElement } = render(
        <main>
          <ResponsiveFilterBar editor={editor} mobileBreakpoint={540} />
        </main>
      );
      const trigger = screen.getByRole('button', { name: 'Filters' });
      await user.click(trigger);

      const dialog = screen.getByRole('dialog', { name: 'Filters' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(within(dialog).getByRole('button', { name: 'Add status rule' })).toBeVisible();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
      within(dialog).getByRole('button', { name: 'Add status rule' }).focus();
      await user.tab();
      expect(within(dialog).getByRole('button', { name: 'Close drawer' })).toHaveFocus();
      expect(await axe(baseElement)).toHaveNoViolations();

      await user.keyboard('{Escape}');
      expect(dialog).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('reports no axe violations with inline controls and active filters', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ResponsiveFilterBar
        editor={editor}
        filters={filters}
        onRemoveFilter={jest.fn()}
        onClearFilters={jest.fn()}
        savedViews={savedViews}
        onSelectView={jest.fn()}
        layout="inline"
      />
    );
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
