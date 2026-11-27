import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SortableList } from '@nebular-react/core';

// jsdom does not implement PointerEvent, so client coordinates would be lost.
// MouseEvent already carries clientX/clientY, which is all the drag needs.
class TestPointerEvent extends MouseEvent {
  pointerId: number;

  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
  }
}

beforeAll(() => {
  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    writable: true,
    value: TestPointerEvent
  });
});

const items = ['Alpha', 'Beta', 'Gamma'];

function mockRowRects(container: HTMLElement, rowHeight = 40) {
  const rows = Array.from(container.querySelectorAll('[data-sortable-item]')) as HTMLElement[];

  rows.forEach((row, index) => {
    const top = index * rowHeight;

    row.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + rowHeight,
        height: rowHeight,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: top,
        toJSON: () => ({})
      }) as DOMRect;
  });
}

interface RenderListProps {
  ariaLabel?: string;
  handleLabel?: string;
  disabled?: boolean;
  onReorder?: (next: string[], meta: { from: number; to: number }) => void;
  renderItem?: (
    item: string,
    index: number,
    state: { dragging: boolean; over: boolean }
  ) => React.ReactNode;
}

function renderList(props: RenderListProps = {}): ReturnType<typeof render> {
  return render(
    <SortableList<string>
      items={items}
      keyExtractor={(item) => item}
      onReorder={jest.fn()}
      renderItem={(item, index) => <span>{`${index}:${item}`}</span>}
      {...props}
    />
  );
}

describe('SortableList', () => {
  it('SortableList_Render_ShouldRenderItemsAndHandles', () => {
    renderList();

    const list = screen.getByRole('list', { name: 'Sortable list' });

    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('0:Alpha')).toBeInTheDocument();
    expect(screen.getByText('2:Gamma')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /reorder item/i })).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Reorder item 2' })).toBeInTheDocument();
  });

  it('SortableList_Render_ShouldAcceptCustomLabels', () => {
    renderList({ ariaLabel: 'Playlist', handleLabel: 'Move track' });

    expect(screen.getByRole('list', { name: 'Playlist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move track 3' })).toBeInTheDocument();
  });

  it('SortableList_Pointer_ShouldReorderAndReportMeta', () => {
    const onReorder = jest.fn();
    const { container } = renderList({ onReorder });

    mockRowRects(container);

    const list = screen.getByRole('list');
    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    fireEvent(handle, new TestPointerEvent('pointerdown', { clientY: 5, bubbles: true }));
    fireEvent(list, new TestPointerEvent('pointermove', { clientY: 95, bubbles: true }));
    fireEvent(list, new TestPointerEvent('pointerup', { clientY: 95, bubbles: true }));

    expect(onReorder).toHaveBeenCalledWith(['Beta', 'Gamma', 'Alpha'], { from: 0, to: 2 });
    expect(screen.getByRole('status')).toHaveTextContent(/moved to position 3/i);
  });

  it('SortableList_Pointer_ShouldExposeDraggingAndOverState', () => {
    const { container } = renderList({
      renderItem: (item, index, state) => (
        <span>{`${item}:${state.dragging ? 'dragging' : 'idle'}:${
          state.over ? 'over' : 'none'
        }`}</span>
      )
    });

    mockRowRects(container);

    const list = screen.getByRole('list');

    fireEvent(
      screen.getByRole('button', { name: 'Reorder item 1' }),
      new TestPointerEvent('pointerdown', { clientY: 5, bubbles: true })
    );
    fireEvent(list, new TestPointerEvent('pointermove', { clientY: 45, bubbles: true }));

    expect(screen.getByText('Alpha:dragging:none')).toBeInTheDocument();
    expect(screen.getByText('Beta:idle:over')).toBeInTheDocument();

    fireEvent(list, new TestPointerEvent('pointerup', { clientY: 45, bubbles: true }));

    expect(screen.getByText('Alpha:idle:none')).toBeInTheDocument();
  });

  it('SortableList_PointerUp_ShouldNotReorderWhenTargetIsUnchanged', () => {
    const onReorder = jest.fn();
    const { container } = renderList({ onReorder });

    mockRowRects(container);

    const list = screen.getByRole('list');
    const handle = screen.getByRole('button', { name: 'Reorder item 2' });

    fireEvent(handle, new TestPointerEvent('pointerdown', { clientY: 45, bubbles: true }));
    fireEvent(list, new TestPointerEvent('pointerup', { clientY: 45, bubbles: true }));

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('SortableList_Keyboard_ShouldLiftMoveAndDrop', async () => {
    const user = userEvent.setup();
    const onReorder = jest.fn();

    renderList({ onReorder });

    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    handle.focus();
    await user.keyboard(' ');

    expect(screen.getByRole('status')).toHaveTextContent(/picked up item 1 of 3/i);

    await user.keyboard('{ArrowDown}');

    expect(screen.getByRole('status')).toHaveTextContent(/moved to position 2/i);

    await user.keyboard(' ');

    expect(onReorder).toHaveBeenCalledWith(['Beta', 'Alpha', 'Gamma'], { from: 0, to: 1 });
  });

  it('SortableList_Keyboard_ShouldClampToTheListBounds', async () => {
    const user = userEvent.setup();
    const onReorder = jest.fn();

    renderList({ onReorder });

    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowUp}{ArrowUp}');

    expect(screen.getByRole('status')).toHaveTextContent(/moved to position 1/i);

    await user.keyboard(' ');
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('SortableList_Keyboard_ShouldCancelWithEscape', async () => {
    const user = userEvent.setup();
    const onReorder = jest.fn();

    renderList({ onReorder });

    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Escape}');

    expect(onReorder).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/cancelled/i);
  });

  it('SortableList_Keyboard_ShouldKeepFocusAfterDropping', async () => {
    const user = userEvent.setup();

    function ControlledList() {
      const [list, setList] = useState(items);

      return (
        <SortableList<string>
          items={list}
          keyExtractor={(item) => item}
          onReorder={(next) => setList(next)}
          renderItem={(item) => <span>{item}</span>}
        />
      );
    }

    render(<ControlledList />);

    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');
    await user.keyboard(' ');

    expect(screen.getByRole('button', { name: 'Reorder item 2' })).toHaveFocus();

    const rows = screen.getAllByRole('listitem');

    expect(rows[0]).toHaveTextContent('Beta');
    expect(rows[1]).toHaveTextContent('Alpha');
  });

  it('SortableList_Disabled_ShouldBlockPointerAndKeyboardReordering', async () => {
    const user = userEvent.setup();
    const onReorder = jest.fn();
    const { container } = renderList({ onReorder, disabled: true });

    mockRowRects(container);

    const handle = screen.getByRole('button', { name: 'Reorder item 1' });

    expect(handle).toBeDisabled();

    const list = screen.getByRole('list');

    fireEvent(handle, new TestPointerEvent('pointerdown', { clientY: 5, bubbles: true }));
    fireEvent(list, new TestPointerEvent('pointermove', { clientY: 95, bubbles: true }));
    fireEvent(list, new TestPointerEvent('pointerup', { clientY: 95, bubbles: true }));

    expect(onReorder).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('');

    handle.focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowDown}');

    expect(onReorder).not.toHaveBeenCalled();
  });

  it('SortableList_A11y_ShouldHaveNoViolations', async () => {
    const { container } = renderList();

    expect(await axe(container)).toHaveNoViolations();
  });
});
