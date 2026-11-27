import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { DesktopWidgets, type DesktopWidget } from '@nebular-react/core';

// jsdom does not implement PointerEvent, so the drag tests fall back to MouseEvent, which exposes
// the same `clientX`/`clientY`/`button` surface used by the component.
beforeAll(() => {
  if (typeof window.PointerEvent === 'undefined') {
    Object.defineProperty(window, 'PointerEvent', {
      configurable: true,
      writable: true,
      value: window.MouseEvent
    });
  }
});

const widgets: DesktopWidget[] = [
  {
    id: 'clock',
    title: 'Clock',
    description: 'Local time',
    icon: <span>c</span>,
    content: <p>09:41</p>
  },
  {
    id: 'notes',
    title: 'Notes',
    description: 'Scratchpad',
    defaultCollapsed: true,
    content: <p>Draft notes</p>
  }
];

function getPanel(): HTMLElement {
  return document.querySelector('[data-desktop-widgets]') as HTMLElement;
}

function getHeader(): HTMLElement {
  return document.querySelector('[data-desktop-widgets-header]') as HTMLElement;
}

function getResizeHandle(): HTMLElement {
  return document.querySelector('[data-desktop-widgets-resize]') as HTMLElement;
}

function dragPointer(target: HTMLElement, from: [number, number], to: [number, number]): void {
  fireEvent.pointerDown(target, { clientX: from[0], clientY: from[1], button: 0 });
  fireEvent.pointerMove(target, { clientX: to[0], clientY: to[1] });
  fireEvent.pointerUp(target, { clientX: to[0], clientY: to[1] });
}

describe('DesktopWidgets', () => {
  it('renders the panel header, count and widget cards', () => {
    render(<DesktopWidgets widgets={widgets} onClose={jest.fn()} />);

    const region = screen.getByRole('region', { name: 'Widgets' });

    expect(within(region).getByRole('heading', { name: 'Widgets' })).toBeInTheDocument();
    expect(within(region).getByText('2')).toBeInTheDocument();
    expect(within(region).getByRole('heading', { name: 'Clock' })).toBeInTheDocument();
    expect(within(region).getByText('Local time')).toBeInTheDocument();
    expect(within(region).getByText('09:41')).toBeVisible();
    expect(within(region).getByText('Draft notes')).not.toBeVisible();
    expect(within(region).getByRole('button', { name: 'Toggle widgets: Notes' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('collapses and expands the panel in uncontrolled mode', async () => {
    const user = userEvent.setup();

    render(<DesktopWidgets widgets={widgets} />);

    const toggle = screen.getByRole('button', { name: 'Toggle widgets' });

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('09:41')).toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('09:41')).not.toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('09:41')).toBeVisible();
  });

  it('follows a controlled collapsed state and reports toggle requests', async () => {
    const user = userEvent.setup();
    const onCollapsedChange = jest.fn();
    const { rerender } = render(
      <DesktopWidgets widgets={widgets} collapsed={false} onCollapsedChange={onCollapsedChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Toggle widgets' }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Toggle widgets' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );

    rerender(<DesktopWidgets widgets={widgets} collapsed onCollapsedChange={onCollapsedChange} />);

    expect(screen.getByRole('button', { name: 'Toggle widgets' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('expands a widget card that starts collapsed', async () => {
    const user = userEvent.setup();

    render(<DesktopWidgets widgets={widgets} />);

    const cardToggle = screen.getByRole('button', { name: 'Toggle widgets: Notes' });

    expect(screen.getByText('Draft notes')).not.toBeVisible();

    await user.click(cardToggle);

    expect(cardToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Draft notes')).toBeVisible();
  });

  it('calls onClose from the close button', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<DesktopWidgets widgets={widgets} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state and has no accessibility violations', async () => {
    const { container } = render(<DesktopWidgets widgets={[]} />);

    expect(screen.getByText('No widgets')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('drags the panel with pointer events and reports the position', () => {
    const onPositionChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        defaultPosition={{ x: 10, y: 20 }}
        onPositionChange={onPositionChange}
      />
    );

    dragPointer(getHeader(), [100, 100], [140, 130]);

    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 50, y: 50 });
    expect(getPanel()).toHaveStyle({ left: '50px', top: '50px', right: 'auto', bottom: 'auto' });
  });

  it('does not start dragging from the header buttons', () => {
    const onPositionChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        defaultPosition={{ x: 10, y: 20 }}
        onPositionChange={onPositionChange}
      />
    );

    const toggle = screen.getByRole('button', { name: 'Toggle widgets' });

    fireEvent.pointerDown(toggle, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(getHeader(), { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(getHeader(), { clientX: 200, clientY: 200 });

    expect(onPositionChange).not.toHaveBeenCalled();
    expect(getPanel()).toHaveStyle({ left: '10px', top: '20px' });
  });

  it('clamps dragging inside the configured bounds', () => {
    const onPositionChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        defaultPosition={{ x: 0, y: 0 }}
        defaultSize={{ width: 200, height: 100 }}
        bounds={{ width: 300, height: 200 }}
        onPositionChange={onPositionChange}
      />
    );

    dragPointer(getHeader(), [0, 0], [500, 500]);

    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 100, y: 100 });
    expect(getPanel()).toHaveStyle({ left: '100px', top: '100px' });

    dragPointer(getHeader(), [500, 500], [-500, -500]);

    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    expect(getPanel()).toHaveStyle({ left: '0px', top: '0px' });
  });

  it('moves with the keyboard and uses a 10px step with Shift', () => {
    const onPositionChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        defaultPosition={{ x: 5, y: 5 }}
        onPositionChange={onPositionChange}
      />
    );

    const handle = screen.getByRole('button', { name: 'Move widgets' });

    handle.focus();
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 6, y: 5 });

    fireEvent.keyDown(handle, { key: 'ArrowDown', shiftKey: true });
    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 6, y: 15 });
    expect(getPanel()).toHaveStyle({ left: '6px', top: '15px' });
  });

  it('does not move with arrow keys while a header button is focused', () => {
    const onPositionChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        defaultPosition={{ x: 5, y: 5 }}
        onPositionChange={onPositionChange}
      />
    );

    const toggle = screen.getByRole('button', { name: 'Toggle widgets' });

    toggle.focus();
    fireEvent.keyDown(toggle, { key: 'ArrowRight' });

    expect(onPositionChange).not.toHaveBeenCalled();
  });

  it('resizes the panel from the bottom-right handle', () => {
    const onSizeChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        resizable
        defaultPosition={{ x: 10, y: 10 }}
        defaultSize={{ width: 200, height: 150 }}
        onSizeChange={onSizeChange}
      />
    );

    dragPointer(getResizeHandle(), [0, 0], [60, 40]);

    expect(onSizeChange).toHaveBeenLastCalledWith({ width: 260, height: 190 });
    expect(getPanel()).toHaveStyle({ width: '260px', height: '190px' });
  });

  it('clamps resizing to the configured bounds', () => {
    const onSizeChange = jest.fn();

    render(
      <DesktopWidgets
        widgets={widgets}
        resizable
        defaultPosition={{ x: 10, y: 10 }}
        defaultSize={{ width: 200, height: 150 }}
        bounds={{ width: 300, height: 250 }}
        onSizeChange={onSizeChange}
      />
    );

    dragPointer(getResizeHandle(), [0, 0], [500, 500]);

    expect(onSizeChange).toHaveBeenLastCalledWith({ width: 290, height: 240 });
  });

  it('follows a controlled position without moving until the prop changes', () => {
    const onPositionChange = jest.fn();
    const { rerender } = render(
      <DesktopWidgets
        widgets={widgets}
        position={{ x: 10, y: 10 }}
        onPositionChange={onPositionChange}
      />
    );

    dragPointer(getHeader(), [0, 0], [20, 30]);

    expect(onPositionChange).toHaveBeenLastCalledWith({ x: 30, y: 40 });
    expect(getPanel()).toHaveStyle({ left: '10px', top: '10px' });

    rerender(
      <DesktopWidgets
        widgets={widgets}
        position={{ x: 30, y: 40 }}
        onPositionChange={onPositionChange}
      />
    );

    expect(getPanel()).toHaveStyle({ left: '30px', top: '40px' });
  });

  it('follows a controlled size without resizing until the prop changes', () => {
    const onSizeChange = jest.fn();
    const { rerender } = render(
      <DesktopWidgets
        widgets={widgets}
        resizable
        size={{ width: 200, height: 150 }}
        onSizeChange={onSizeChange}
      />
    );

    dragPointer(getResizeHandle(), [0, 0], [40, 20]);

    expect(onSizeChange).toHaveBeenLastCalledWith({ width: 240, height: 170 });
    expect(getPanel()).toHaveStyle({ width: '200px', height: '150px' });

    rerender(
      <DesktopWidgets
        widgets={widgets}
        resizable
        size={{ width: 240, height: 170 }}
        onSizeChange={onSizeChange}
      />
    );

    expect(getPanel()).toHaveStyle({ width: '240px', height: '170px' });
  });

  it('renders through a portal into the provided container', () => {
    const host = document.createElement('div');

    document.body.appendChild(host);

    const { container, unmount } = render(<DesktopWidgets widgets={widgets} container={host} />);
    const region = screen.getByRole('region', { name: 'Widgets' });

    expect(host).toContainElement(region);
    expect(container).not.toContainElement(region);

    unmount();
    expect(host).toBeEmptyDOMElement();
    host.remove();
  });

  it('has no accessibility violations when draggable and resizable', async () => {
    const { container } = render(
      <DesktopWidgets
        widgets={widgets}
        resizable
        defaultPosition={{ x: 0, y: 0 }}
        defaultSize={{ width: 240, height: 200 }}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
