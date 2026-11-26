import React, { useRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Sidebar } from '@nebular-react/core';
import type { SidebarRef, SidebarStatus } from '@nebular-react/core';

const originalInnerWidth = window.innerWidth;

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width
  });
}

function getSidebarRoot(container: HTMLElement) {
  return container.querySelector('.nebular-sidebar-root') as HTMLElement;
}

function SidebarHarness({
  onStatusChange,
  initialStatus,
  responsive
}: {
  onStatusChange?: (status: SidebarStatus) => void;
  initialStatus?: SidebarStatus;
  responsive?: boolean;
}) {
  const ref = useRef<SidebarRef>(null);

  return (
    <>
      <button type="button" onClick={() => ref.current?.toggle()}>
        Toggle
      </button>
      <button type="button" onClick={() => ref.current?.toggle(true)}>
        Toggle compact
      </button>
      <button type="button" onClick={() => ref.current?.expand()}>
        Expand
      </button>
      <button type="button" onClick={() => ref.current?.collapse()}>
        Collapse
      </button>
      <button type="button" onClick={() => ref.current?.compact()}>
        Compact
      </button>
      <Sidebar
        ref={ref}
        sidebarStatus={initialStatus}
        responsive={responsive}
        onSidebarStatusChange={onStatusChange}
      >
        <span>Sidebar content</span>
      </Sidebar>
    </>
  );
}

describe('Sidebar', () => {
  afterEach(() => {
    setViewportWidth(originalInnerWidth);
  });

  it('renders header, content and footer with the default expanded state', () => {
    const { container } = render(
      <Sidebar
        header={<Sidebar.Header>Sidebar header</Sidebar.Header>}
        footer={<Sidebar.Footer>Sidebar footer</Sidebar.Footer>}
      >
        <span>Sidebar content</span>
      </Sidebar>
    );

    const root = getSidebarRoot(container);

    expect(root).toHaveClass('nebular-sidebar-root', 'nebular-sidebar-left');
    expect(root).toHaveClass('nebular-sidebar-expanded');
    expect(root).not.toHaveClass('nebular-sidebar-collapsed');
    expect(root).not.toHaveClass('nebular-sidebar-compacted');

    expect(screen.getByText('Sidebar header')).toHaveClass('nebular-sidebar-header-root');
    expect(screen.getByText('Sidebar footer')).toHaveClass('nebular-sidebar-footer-root');
    expect(root.querySelector('.nebular-sidebar-scrollable')).toContainElement(
      screen.getByText('Sidebar content')
    );
    expect(root.querySelector('.nebular-sidebar-container')).toHaveClass(
      'nebular-sidebar-containerFixed'
    );
  });

  it('reflects the sidebarStatus prop and updates when it changes', () => {
    const { container, rerender } = render(<Sidebar sidebarStatus="compacted" />);

    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-compacted');

    rerender(<Sidebar sidebarStatus="collapsed" />);

    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-collapsed');
    expect(getSidebarRoot(container)).not.toHaveClass('nebular-sidebar-compacted');
  });

  it('toggles between expanded and collapsed through the imperative API', async () => {
    const user = userEvent.setup();
    const { container } = render(<SidebarHarness />);
    const root = getSidebarRoot(container);

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(root).toHaveClass('nebular-sidebar-collapsed');
    expect(root).not.toHaveClass('nebular-sidebar-expanded');

    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(root).toHaveClass('nebular-sidebar-expanded');
  });

  it('supports compact, expand and collapse through the imperative API', async () => {
    const user = userEvent.setup();
    const { container } = render(<SidebarHarness />);
    const root = getSidebarRoot(container);

    await user.click(screen.getByRole('button', { name: 'Compact' }));
    expect(root).toHaveClass('nebular-sidebar-compacted');

    await user.click(screen.getByRole('button', { name: 'Expand' }));
    expect(root).toHaveClass('nebular-sidebar-expanded');

    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(root).toHaveClass('nebular-sidebar-collapsed');

    await user.click(screen.getByRole('button', { name: 'Toggle compact' }));
    expect(root).toHaveClass('nebular-sidebar-expanded');

    await user.click(screen.getByRole('button', { name: 'Toggle compact' }));
    expect(root).toHaveClass('nebular-sidebar-compacted');
  });

  it('emits status changes only when the status actually changes', async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();

    render(<SidebarHarness onStatusChange={onStatusChange} />);

    expect(onStatusChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(onStatusChange).toHaveBeenLastCalledWith('collapsed');
    expect(onStatusChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Expand' }));
    expect(onStatusChange).toHaveBeenLastCalledWith('expanded');
    expect(onStatusChange).toHaveBeenCalledTimes(2);

    await user.click(screen.getByRole('button', { name: 'Compact' }));
    expect(onStatusChange).toHaveBeenLastCalledWith('compacted');
    expect(onStatusChange).toHaveBeenCalledTimes(3);
  });

  it('supports keyboard activation of the sidebar controls', async () => {
    const user = userEvent.setup();
    const { container } = render(<SidebarHarness />);
    const root = getSidebarRoot(container);
    const toggle = screen.getByRole('button', { name: 'Toggle' });

    toggle.focus();
    await user.keyboard('{Enter}');
    expect(root).toHaveClass('nebular-sidebar-collapsed');

    await user.keyboard(' ');
    expect(root).toHaveClass('nebular-sidebar-expanded');
  });

  it('positions the sidebar on the left, right, start or end', () => {
    const { container, rerender } = render(<Sidebar left />);
    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-left');

    rerender(<Sidebar right />);
    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-right');
    expect(getSidebarRoot(container)).not.toHaveClass('nebular-sidebar-left');

    rerender(<Sidebar start />);
    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-start');
    expect(getSidebarRoot(container)).not.toHaveClass('nebular-sidebar-left');

    rerender(<Sidebar end />);
    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-end');
  });

  it('applies the fixed class and disables the fixed container when requested', () => {
    const { container } = render(<Sidebar fixed />);

    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-fixed');

    const { container: unfixedContainer } = render(<Sidebar containerFixed={false} />);

    expect(getSidebarRoot(unfixedContainer)).not.toHaveClass('nebular-sidebar-fixed');
    expect(
      getSidebarRoot(unfixedContainer).querySelector('.nebular-sidebar-container')
    ).not.toHaveClass('nebular-sidebar-containerFixed');
  });

  it('collapses automatically on small viewports when responsive', async () => {
    setViewportWidth(320);
    const onResponsiveStatusChange = jest.fn();
    const { container } = render(
      <Sidebar responsive onResponsiveStatusChange={onResponsiveStatusChange} />
    );

    await waitFor(() => expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-collapsed'));
    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-fixed');
    expect(onResponsiveStatusChange).toHaveBeenLastCalledWith('mobile');
  });

  it('expands a responsive sidebar on mobile even when compact is requested', async () => {
    setViewportWidth(320);
    const user = userEvent.setup();
    const { container } = render(<SidebarHarness responsive />);

    await waitFor(() => expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-collapsed'));

    await user.click(screen.getByRole('button', { name: 'Toggle compact' }));

    expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-expanded');
    expect(getSidebarRoot(container)).not.toHaveClass('nebular-sidebar-compacted');
  });

  it('expands again when the viewport grows past the compacted breakpoints', async () => {
    setViewportWidth(320);
    const { container } = render(<Sidebar responsive />);

    await waitFor(() => expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-collapsed'));

    setViewportWidth(1600);
    fireEvent(window, new Event('resize'));

    await waitFor(() => expect(getSidebarRoot(container)).toHaveClass('nebular-sidebar-expanded'));
    expect(getSidebarRoot(container)).not.toHaveClass('nebular-sidebar-collapsed');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Sidebar
        header={
          <Sidebar.Header>
            <h2>Navigation</h2>
          </Sidebar.Header>
        }
        footer={<Sidebar.Footer>Footer content</Sidebar.Footer>}
      >
        <nav aria-label="Sections">
          <a href="#home">Home</a>
        </nav>
      </Sidebar>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('syncs the fixed prop after mount', () => {
    const { container, rerender } = render(
      <Sidebar fixed={false}>
        <span>Content</span>
      </Sidebar>
    );

    expect(container.querySelector('.nebular-sidebar-root')?.className).not.toContain(
      'nebular-sidebar-fixed'
    );

    rerender(
      <Sidebar fixed>
        <span>Content</span>
      </Sidebar>
    );

    expect(container.querySelector('.nebular-sidebar-root')?.className).toContain(
      'nebular-sidebar-fixed'
    );
  });
});
