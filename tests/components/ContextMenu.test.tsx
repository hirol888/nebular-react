import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { ContextMenu, ContextMenuProps, Menu, MenuItem } from '@nebular-react/core';

interface ContextMenuExampleProps {
  triggerLabel?: string;
  contextMenuProps?: Omit<ContextMenuProps, 'triggerRef' | 'children'>;
  onSelect?: (selected: string) => void;
}

function ContextMenuExample({
  triggerLabel = 'Open context menu',
  contextMenuProps = {},
  onSelect
}: ContextMenuExampleProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div>
      <button type="button" ref={triggerRef}>
        {triggerLabel}
      </button>
      <ContextMenu triggerRef={triggerRef} {...contextMenuProps}>
        <Menu {...(onSelect ? { onSelect } : {})}>
          <MenuItem id="profile" title="Profile" />
          <MenuItem id="logout" title="Logout" />
        </Menu>
      </ContextMenu>
    </div>
  );
}

describe('ContextMenu', () => {
  it('renders a hidden menu until the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample />);

    const profile = screen.getByText('Profile');
    expect(profile).not.toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));

    await waitFor(() => expect(profile).toBeVisible());
    expect(screen.getByText('Logout')).toBeVisible();
  });

  it('reports open and close events', async () => {
    const user = userEvent.setup();
    const onContextMenuOpen = jest.fn();
    const onContextMenuClose = jest.fn();

    render(<ContextMenuExample contextMenuProps={{ onContextMenuOpen, onContextMenuClose }} />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));
    await waitFor(() => expect(onContextMenuOpen).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Profile')).toBeVisible();

    await user.click(document.body);

    await waitFor(() => expect(onContextMenuClose).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Profile')).not.toBeVisible();
  });

  it('selects an item, calls the menu handler and closes', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    const onContextMenuClose = jest.fn();

    render(<ContextMenuExample onSelect={onSelect} contextMenuProps={{ onContextMenuClose }} />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());
    await user.click(screen.getByText('Profile'));

    expect(onSelect).toHaveBeenCalledWith('profile');
    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
    expect(onContextMenuClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());

    fireEvent.keyDown(document.body, { key: 'a' });
    expect(screen.getByText('Profile')).toBeVisible();

    fireEvent.keyDown(document.body, { key: 'Escape' });

    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
  });

  it('closes when the trigger is clicked again', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample />);

    const trigger = screen.getByRole('button', { name: 'Open context menu' });

    await user.click(trigger);
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());

    await user.click(trigger);
    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
  });

  it('opens on hover and closes on mouse leave', async () => {
    render(<ContextMenuExample contextMenuProps={{ triggerType: 'hover' }} />);

    const trigger = screen.getByRole('button', { name: 'Open context menu' });

    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());

    fireEvent.mouseLeave(trigger);
    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
  });

  it('opens on focus and closes on blur', async () => {
    render(<ContextMenuExample contextMenuProps={{ triggerType: 'focus' }} />);

    const trigger = screen.getByRole('button', { name: 'Open context menu' });

    fireEvent.focusIn(trigger);
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());

    fireEvent.focusOut(trigger, { relatedTarget: document.body });
    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
  });

  it('applies className to the menu root', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample contextMenuProps={{ className: 'custom-context-menu' }} />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));
    await waitFor(() =>
      expect(document.querySelector('.nebular-context-menu-root')).toHaveClass(
        'custom-context-menu'
      )
    );
  });

  it('closes after selecting an item when the menu has no onSelect handler', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));
    await waitFor(() => expect(screen.getByText('Profile')).toBeVisible());

    await user.click(screen.getByText('Profile'));

    await waitFor(() => expect(screen.getByText('Profile')).not.toBeVisible());
  });

  it('renders safely without a Menu child', async () => {
    const user = userEvent.setup();

    function EmptyContextMenu() {
      const triggerRef = React.useRef<HTMLButtonElement>(null);

      return (
        <div>
          <button type="button" ref={triggerRef}>
            Open empty menu
          </button>
          <ContextMenu triggerRef={triggerRef}>
            <span>Not a menu</span>
          </ContextMenu>
        </div>
      );
    }

    render(<EmptyContextMenu />);

    await user.click(screen.getByRole('button', { name: 'Open empty menu' }));

    const root = document.querySelector('.nebular-context-menu-root') as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toBeEmptyDOMElement();
  });

  it('does not open when the trigger type is noop', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample contextMenuProps={{ triggerType: 'noop' }} />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));

    expect(screen.getByText('Profile')).not.toBeVisible();
  });

  it('has no accessibility violations', async () => {
    const user = userEvent.setup();
    render(<ContextMenuExample />);

    await user.click(screen.getByRole('button', { name: 'Open context menu' }));

    const root = document.querySelector('.nebular-context-menu-root') as HTMLElement;

    expect(await axe(root)).toHaveNoViolations();
  });
});
