import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { renderToStaticMarkup } from 'react-dom/server';
import { DockLayout, DockLayoutNode, DockLayoutPanel } from '@nebular-react/core';

const panels: DockLayoutPanel[] = [
  { id: 'notes', title: 'Notes', content: <input aria-label="Note draft" /> },
  { id: 'editor', title: 'Editor', content: <p>Editor content</p> },
  { id: 'preview', title: 'Preview', content: <p>Preview content</p> },
  { id: 'output', title: 'Output', content: <p>Output content</p> }
];

const initial: DockLayoutNode = {
  type: 'split',
  id: 'workspace',
  orientation: 'horizontal',
  size: 35,
  first: { type: 'group', id: 'tools', label: 'Tools', panelIds: ['notes', 'editor'] },
  second: {
    type: 'split',
    id: 'results',
    orientation: 'vertical',
    size: 60,
    first: { type: 'group', id: 'display', label: 'Display', panelIds: ['preview', 'output'] },
    second: { type: 'group', id: 'empty', label: 'Empty pane', panelIds: [] }
  }
};

function workspace(value: DockLayoutNode = initial) {
  const onLayoutChange = jest.fn();
  function Harness() {
    const [layout, setLayout] = useState(value);
    return (
      <DockLayout
        layout={layout}
        panels={panels}
        onLayoutChange={(next) => {
          onLayoutChange(next);
          setLayout(next);
        }}
      />
    );
  }
  return { ...render(<Harness />), onLayoutChange };
}

describe('DockLayout', () => {
  it('supports nested split sizing with a serializable controlled layout', async () => {
    const user = userEvent.setup();
    const { onLayoutChange } = workspace();
    const [horizontal, vertical] = screen.getAllByRole('separator', { name: 'Resize panels' });

    horizontal.focus();
    await user.keyboard('{ArrowRight}');
    vertical.focus();
    await user.keyboard('{ArrowUp}');

    const snapshot = onLayoutChange.mock.lastCall?.[0];
    expect(horizontal).toHaveAttribute('aria-valuenow', '40');
    expect(vertical).toHaveAttribute('aria-valuenow', '55');
    expect(snapshot).toEqual({ ...initial, size: 40, second: { ...initial.second, size: 55 } });
    expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
    expect(initial.size).toBe(35);
    expect(initial.second).toHaveProperty('size', 60);
  });

  it('uses roving keyboard focus without discarding hidden panel content', async () => {
    const user = userEvent.setup();
    workspace();
    const notes = screen.getByRole('tab', { name: 'Notes' });
    const editor = screen.getByRole('tab', { name: 'Editor' });
    await user.type(screen.getByRole('textbox', { name: 'Note draft' }), 'retain me');

    notes.focus();
    await user.keyboard('{ArrowRight}');
    expect(editor).toHaveFocus();
    expect(editor).toHaveAttribute('aria-selected', 'true');
    expect(notes).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tabpanel', { name: 'Editor' })).toBeVisible();

    await user.keyboard('{Home}');
    expect(notes).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Note draft' })).toHaveValue('retain me');
  });

  it('moves the active panel using the keyboard controls and places focus on its new tab', async () => {
    const user = userEvent.setup();
    const { onLayoutChange } = workspace();
    const tools = within(screen.getByRole('group', { name: 'Tools' }));
    const target = within(screen.getByRole('group', { name: 'Empty pane' }));

    await user.type(screen.getByRole('textbox', { name: 'Note draft' }), 'keep draft');
    await user.selectOptions(tools.getByRole('combobox', { name: 'Move to group' }), 'empty');
    await user.tab();
    expect(tools.getByRole('button', { name: 'Move active panel' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(tools.queryByRole('tab', { name: 'Notes' })).not.toBeInTheDocument();
    expect(tools.getByRole('tab', { name: 'Editor' })).toHaveAttribute('aria-selected', 'true');
    expect(target.getByRole('tab', { name: 'Notes' })).toHaveFocus();
    expect(target.getByRole('tabpanel', { name: 'Notes' })).toBeVisible();
    expect(target.getByRole('textbox', { name: 'Note draft' })).toHaveValue('keep draft');
    expect(onLayoutChange.mock.lastCall?.[0]).toMatchObject({
      first: { activePanelId: 'editor', panelIds: ['editor'] },
      second: { second: { activePanelId: 'notes', panelIds: ['notes'] } }
    });
  });

  it('accepts internal drag and drop, including an empty group, and ignores external drops', () => {
    const { onLayoutChange } = workspace();
    const target = screen.getByRole('group', { name: 'Empty pane' });
    const dataTransfer = { setData: jest.fn(), effectAllowed: '', dropEffect: '' };
    fireEvent.drop(target, { dataTransfer });
    expect(onLayoutChange).not.toHaveBeenCalled();

    fireEvent.dragStart(screen.getByRole('tab', { name: 'Preview' }), { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    expect(dataTransfer.dropEffect).toBe('move');
    fireEvent.drop(target, { dataTransfer });

    expect(within(target).getByRole('tab', { name: 'Preview' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: 'Output' })).toHaveAttribute('aria-selected', 'true');
  });

  it('accepts drops over the content of an existing panel', () => {
    workspace();
    const target = screen.getByText('Preview content');
    const dataTransfer = { setData: jest.fn(), effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(screen.getByRole('tab', { name: 'Notes' }), { dataTransfer });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });

    const display = within(screen.getByRole('group', { name: 'Display' }));
    expect(display.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders the panel and tab relationship on the server', () => {
    const markup = renderToStaticMarkup(<DockLayout defaultLayout={initial} panels={panels} />);
    expect(markup).toContain('Preview content');
    expect(markup).toContain('role="tabpanel"');
  });

  it('honors externally controlled state without changing displayed layout until accepted', async () => {
    const user = userEvent.setup();
    const onLayoutChange = jest.fn();
    render(<DockLayout layout={initial} panels={panels} onLayoutChange={onLayoutChange} />);
    const separator = screen.getAllByRole('separator', { name: 'Resize panels' })[0];
    separator.focus();

    await user.keyboard('{ArrowRight}');
    expect(onLayoutChange).toHaveBeenLastCalledWith({ ...initial, size: 40 });
    expect(separator).toHaveAttribute('aria-valuenow', '35');
  });

  it('supports a read-only layout and passes accessibility checks', async () => {
    const { container } = render(
      <DockLayout defaultLayout={initial} panels={panels} readOnly aria-label="Read-only layout" />
    );
    expect(screen.queryByRole('button', { name: 'Move active panel' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Notes' })).not.toHaveAttribute('draggable', 'true');
    expect(screen.getAllByRole('separator')[0]).toHaveAttribute('aria-disabled', 'true');
    expect(await axe(container)).toHaveNoViolations();
  });
});
