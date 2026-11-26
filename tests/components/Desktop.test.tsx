import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  Desktop,
  useDesktopWindow,
  type DesktopApp,
  type DesktopTaskbarPosition,
  type DesktopWindowState
} from '@nebular-react/core';

const apps: DesktopApp[] = [
  {
    id: 'notes',
    title: 'Notes',
    content: <p>Notes content</p>,
    defaultWidth: 480,
    defaultHeight: 320
  },
  {
    id: 'settings',
    title: 'Settings',
    content: <p>Settings content</p>
  }
];

function createWindow(overrides: Partial<DesktopWindowState> = {}): DesktopWindowState {
  return {
    id: 'notes-window',
    appId: 'notes',
    x: 100,
    y: 100,
    width: 400,
    height: 300,
    minimized: false,
    maximized: false,
    zIndex: 1,
    ...overrides
  };
}

function pointerEvent(type: string, clientX: number, clientY: number): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0
  });
}

function mockDesktopArea(container: HTMLElement): HTMLElement {
  const area = container.querySelector('[data-desktop-area]') as HTMLElement;

  Object.defineProperty(area, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      toJSON: () => ({})
    })
  });

  return area;
}

describe('Desktop', () => {
  it('renders a window, taskbar and clock', () => {
    render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);

    expect(screen.getByRole('region', { name: 'Desktop' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Taskbar' })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByRole('timer', { name: 'Clock' })).toBeInTheDocument();
    expect(screen.getByText('Notes content')).toBeInTheDocument();
  });

  it('minimizes to the taskbar and restores, maximizes and closes', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));
    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Notes' }));
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Maximize Notes' }));
    expect(screen.getByRole('button', { name: 'Restore Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Restore Notes' }));
    expect(screen.getByRole('button', { name: 'Maximize Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close Notes' }));
    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Notes' })).not.toBeInTheDocument();
  });

  it('opens apps from the start menu', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    const menu = screen.getByRole('menu', { name: 'Apps' });

    await user.click(within(menu).getByRole('menuitem', { name: 'Open Settings' }));

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: 'Apps' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('shows the same app icon and title in title bar, taskbar and start menu', async () => {
    const user = userEvent.setup();
    const appsWithIcon: DesktopApp[] = [
      { ...apps[0], icon: <span data-testid="notes-icon" /> },
      apps[1]
    ];

    render(
      <Desktop apps={appsWithIcon} defaultWindows={[createWindow({ title: 'Notes draft' })]} />
    );

    const dialog = screen.getByRole('dialog', { name: 'Notes' });
    expect(within(dialog).getByTestId('notes-icon')).toBeInTheDocument();
    expect(within(dialog).getByText('Notes')).toBeInTheDocument();

    const taskbarButton = screen.getByRole('button', { name: 'Notes' });
    expect(within(taskbarButton).getByTestId('notes-icon')).toBeInTheDocument();
    expect(within(taskbarButton).getByText('Notes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const menuItem = screen.getByRole('menuitem', { name: 'Open Notes' });
    expect(within(menuItem).getByTestId('notes-icon')).toBeInTheDocument();
    expect(within(menuItem).getByText('Notes')).toBeInTheDocument();
  });

  it('uses the window icon and title for standalone windows', () => {
    render(
      <Desktop
        apps={apps}
        defaultWindows={[
          createWindow({
            appId: undefined,
            title: 'Preview',
            icon: <span data-testid="preview-icon" />
          })
        ]}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Preview' });
    expect(within(dialog).getByTestId('preview-icon')).toBeInTheDocument();

    const taskbarButton = screen.getByRole('button', { name: 'Preview' });
    expect(within(taskbarButton).getByTestId('preview-icon')).toBeInTheDocument();
  });

  it('drags and resizes a window', () => {
    const { container } = render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);
    mockDesktopArea(container);

    const dialog = screen.getByRole('dialog', { name: 'Notes' }) as HTMLElement;
    const titleBar = dialog.querySelector('[class*="titleBar"]') as HTMLElement;

    fireEvent(titleBar, pointerEvent('pointerdown', 100, 100));
    fireEvent(titleBar, pointerEvent('pointermove', 160, 140));
    fireEvent(titleBar, pointerEvent('pointerup', 160, 140));

    expect(dialog).toHaveStyle({ left: '160px', top: '140px' });

    const resizeHandle = dialog.querySelector('[class*="resizeSe"]') as HTMLElement;
    fireEvent(resizeHandle, pointerEvent('pointerdown', 560, 440));
    fireEvent(resizeHandle, pointerEvent('pointermove', 660, 540));
    fireEvent(resizeHandle, pointerEvent('pointerup', 660, 540));

    expect(dialog).toHaveStyle({ width: '500px', height: '400px' });
  });

  it('blocks the parent while a modal child is open and closes it with Escape', async () => {
    const user = userEvent.setup();

    function ParentApp() {
      const { openWindow } = useDesktopWindow();

      return (
        <button
          type="button"
          onClick={() =>
            openWindow({
              title: 'Confirm',
              modal: true,
              width: 300,
              height: 180,
              content: <p>Child content</p>
            })
          }
        >
          Open child
        </button>
      );
    }

    render(
      <Desktop
        apps={[{ id: 'parent', title: 'Parent', content: <ParentApp /> }]}
        defaultWindows={[createWindow({ id: 'parent-window', appId: 'parent', title: 'Parent' })]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open child' }));

    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument();
    const parent = document.querySelector(
      '[data-desktop-window-id="parent-window"]'
    ) as HTMLElement;
    expect(parent).toHaveAttribute('aria-hidden', 'true');
    expect(parent).toHaveAttribute('inert');
    expect(document.querySelector('[class*="modalBackdrop"]')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Confirm' })).not.toBeInTheDocument();
    expect(parent).not.toHaveAttribute('aria-hidden');
    expect(parent).not.toHaveAttribute('inert');
  });

  it.each(['bottom', 'top', 'left', 'right'] as DesktopTaskbarPosition[])(
    'supports the %s taskbar position',
    (position) => {
      const { container } = render(
        <Desktop apps={apps} taskbarPosition={position} defaultWindows={[createWindow()]} />
      );

      expect(container.firstElementChild).toHaveAttribute('data-taskbar-position', position);
      expect(screen.getByRole('toolbar', { name: 'Taskbar' })).toBeInTheDocument();

      if (position === 'left' || position === 'right') {
        expect(container.querySelector('[class*="taskbarMetaVertical"]')).toBeInTheDocument();
      }
    }
  );

  it('supports controlled windows and updates through onWindowsChange', async () => {
    const user = userEvent.setup();
    const onWindowsChange = jest.fn();

    render(<Desktop apps={apps} windows={[createWindow()]} onWindowsChange={onWindowsChange} />);

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));

    expect(onWindowsChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: 'notes-window', minimized: true })
    ]);
  });

  it('has no accessibility violations with the start menu open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Desktop apps={apps} defaultWindows={[createWindow()]} taskbarPosition="bottom" />
    );

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('snaps windows to edges with a preview and Alt+Arrow', () => {
    const onWindowSnap = jest.fn();
    const { container } = render(
      <Desktop apps={apps} defaultWindows={[createWindow()]} onWindowSnap={onWindowSnap} />
    );
    mockDesktopArea(container);

    const dialog = screen.getByRole('dialog', { name: 'Notes' }) as HTMLElement;
    const titleBar = dialog.querySelector('[class*="titleBar"]') as HTMLElement;

    fireEvent(titleBar, pointerEvent('pointerdown', 100, 100));
    fireEvent(titleBar, pointerEvent('pointermove', 5, 300));

    expect(container.querySelector('[class*="snapPreview"]')).toBeInTheDocument();

    fireEvent(titleBar, pointerEvent('pointerup', 5, 300));

    expect(dialog).toHaveStyle({ left: '0px', top: '0px', width: '400px', height: '600px' });
    expect(onWindowSnap).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'notes-window' }),
      'left'
    );

    fireEvent.keyDown(titleBar, { key: 'ArrowRight', altKey: true });

    expect(dialog).toHaveStyle({ left: '400px', top: '0px', width: '400px', height: '600px' });

    fireEvent.keyDown(titleBar, { key: 'ArrowLeft', altKey: true, shiftKey: true });

    expect(dialog).toHaveStyle({ width: '390px' });
  });

  it('traps focus inside a modal child and restores focus to the opener', async () => {
    const user = userEvent.setup();

    function ParentApp() {
      const { openWindow } = useDesktopWindow();

      return (
        <button
          type="button"
          onClick={() =>
            openWindow({
              title: 'Confirm',
              modal: true,
              width: 320,
              height: 200,
              content: (
                <>
                  <button type="button">First</button>
                  <button type="button">Last</button>
                </>
              )
            })
          }
        >
          Open child
        </button>
      );
    }

    render(
      <Desktop
        apps={[{ id: 'parent', title: 'Parent', content: <ParentApp /> }]}
        defaultWindows={[createWindow({ id: 'parent-window', appId: 'parent', title: 'Parent' })]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open child' }));

    const modal = screen.getByRole('dialog', { name: 'Confirm' });
    const last = within(modal).getByRole('button', { name: 'Last' });
    last.focus();
    await user.tab();

    expect(within(modal).getByRole('toolbar', { name: 'Window' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Confirm' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open child' })).toHaveFocus();
  });

  it('moves focus to the taskbar button when minimizing', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));

    expect(screen.getByRole('button', { name: 'Notes' })).toHaveFocus();
  });

  it('navigates the taskbar with arrow, Home and End keys', async () => {
    const user = userEvent.setup();

    render(
      <Desktop
        apps={apps}
        groupTaskbar={false}
        defaultWindows={[
          createWindow(),
          createWindow({
            id: 'settings-window',
            appId: 'settings',
            title: 'Settings',
            zIndex: 2
          })
        ]}
      />
    );

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    const taskbarButtons = within(taskbar).getAllByRole('button', {
      name: /Notes|Settings/
    });
    const firstButton = taskbarButtons[0];
    const secondButton = taskbarButtons[1];

    firstButton.focus();
    await user.keyboard('{ArrowRight}');
    expect(secondButton).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(firstButton).toHaveFocus();

    await user.keyboard('{End}');
    expect(secondButton).toHaveFocus();

    await user.keyboard('{Home}');
    expect(firstButton).toHaveFocus();
  });

  it('searches, filters and navigates the start menu with the keyboard', async () => {
    const user = userEvent.setup();
    const pinnedApps: DesktopApp[] = [{ ...apps[0], pinned: true }, apps[1]];

    render(<Desktop apps={pinnedApps} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));

    const search = screen.getByRole('searchbox', { name: 'Search apps' });
    expect(search).toHaveFocus();
    expect(screen.getByRole('group', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'All apps' })).toBeInTheDocument();

    await user.type(search, 'set');
    expect(screen.getByRole('menuitem', { name: 'Open Settings' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Open Notes' })).not.toBeInTheDocument();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Open Settings' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'Apps' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toHaveFocus();
  });

  it('shows recently opened apps in the start menu', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));
    await user.click(screen.getByRole('button', { name: 'Close Notes' }));
    await user.click(screen.getByRole('button', { name: 'Start' }));

    const recent = screen.getByRole('group', { name: 'Recent' });
    expect(within(recent).getByRole('menuitem', { name: 'Open Notes' })).toBeInTheDocument();
  });

  it('persists and restores windows with storageKey', async () => {
    const user = userEvent.setup();
    window.localStorage.clear();

    const first = render(<Desktop apps={apps} storageKey="desktop-persistence-test" />);
    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));

    first.unmount();

    render(<Desktop apps={apps} storageKey="desktop-persistence-test" />);

    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.getByText('Notes content')).toBeInTheDocument();

    window.localStorage.clear();
  });

  it('groups windows by app and lists them in the group menu', async () => {
    const user = userEvent.setup();

    render(
      <Desktop
        apps={apps}
        defaultWindows={[createWindow(), createWindow({ id: 'notes-window-2', zIndex: 2 })]}
      />
    );

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    const groupButton = within(taskbar).getByRole('button', {
      name: 'Notes (2 windows)'
    });

    await user.click(within(taskbar).getByRole('button', { name: 'Show windows for Notes' }));

    const menu = screen.getByRole('menu', { name: 'Window menu' });
    const items = within(menu).getAllByRole('menuitem');

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Notes (1)');
    expect(items[1]).toHaveTextContent('Notes (2)');

    await user.click(items[1]);

    expect(screen.queryByRole('menu', { name: 'Window menu' })).not.toBeInTheDocument();
    expect(groupButton).toBeInTheDocument();
  });

  it('renders extra taskbar groups in an overflow menu', async () => {
    const user = userEvent.setup();
    const extraApp: DesktopApp = {
      id: 'preview',
      title: 'Preview',
      content: <p>Preview content</p>
    };

    render(
      <Desktop
        apps={[...apps, extraApp]}
        groupTaskbar={false}
        maxTaskbarItems={2}
        defaultWindows={[
          createWindow(),
          createWindow({
            id: 'settings-window',
            appId: 'settings',
            title: 'Settings',
            zIndex: 2
          }),
          createWindow({
            id: 'preview-window',
            appId: 'preview',
            title: 'Preview',
            zIndex: 3
          })
        ]}
      />
    );

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    const overflow = within(taskbar).getByRole('button', {
      name: 'More windows'
    });

    expect(overflow).toHaveTextContent('+1');

    await user.click(overflow);

    const menu = screen.getByRole('menu', { name: 'Window menu' });
    expect(within(menu).getByRole('menuitem', { name: 'Preview' })).toBeInTheDocument();
  });

  it('opens a window context menu and minimizes from it', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);

    const dialog = screen.getByRole('dialog', { name: 'Notes' });
    fireEvent.contextMenu(dialog, { clientX: 180, clientY: 120 });

    const menu = screen.getByRole('menu', { name: 'Window menu' });
    await user.click(within(menu).getByRole('menuitem', { name: 'Minimize Notes' }));

    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notes' })).toHaveFocus();
  });

  it('switches workspaces and filters windows per workspace', async () => {
    const user = userEvent.setup();
    const workspaces = [
      { id: 'one', title: 'One' },
      { id: 'two', title: 'Two' }
    ];

    render(
      <Desktop
        apps={apps}
        workspaces={workspaces}
        defaultWorkspace="one"
        defaultWindows={[{ ...createWindow(), workspaceId: 'one' }]}
      />
    );

    expect(screen.getByRole('button', { name: 'Workspace One' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Workspace Two' }));

    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));

    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Workspace One' }));
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Workspace Two' }));
    fireEvent.contextMenu(screen.getByRole('dialog', { name: 'Notes' }), {
      clientX: 180,
      clientY: 120
    });

    const menu = screen.getByRole('menu', { name: 'Window menu' });
    await user.click(within(menu).getByRole('menuitem', { name: 'Move to One' }));

    expect(screen.queryByRole('dialog', { name: 'Notes' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Workspace One' }));
    expect(screen.getAllByRole('dialog', { name: 'Notes' })).toHaveLength(2);
  });

  it('uses the compact layout for icon-only taskbar items and maximized windows', async () => {
    const user = userEvent.setup();

    render(<Desktop compact apps={apps} defaultWindows={[createWindow()]} />);

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    const notesButton = within(taskbar).getByRole('button', { name: 'Notes' });

    expect(within(notesButton).queryByText('Notes')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Settings' }));

    const settings = screen.getByRole('dialog', { name: 'Settings' });
    expect(settings.className).toMatch(/windowMaximized/);
  });

  it('fires lifecycle callbacks', async () => {
    const user = userEvent.setup();
    const callbacks = {
      open: jest.fn(),
      focus: jest.fn(),
      minimize: jest.fn(),
      maximize: jest.fn(),
      restore: jest.fn(),
      close: jest.fn()
    };

    render(
      <Desktop
        apps={apps}
        onWindowOpen={callbacks.open}
        onWindowFocus={callbacks.focus}
        onWindowMinimize={callbacks.minimize}
        onWindowMaximize={callbacks.maximize}
        onWindowRestore={callbacks.restore}
        onWindowClose={callbacks.close}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));

    expect(callbacks.open).toHaveBeenCalledWith(
      expect.objectContaining({ appId: 'notes', title: 'Notes' })
    );

    await user.click(screen.getByRole('button', { name: 'Maximize Notes' }));
    expect(callbacks.maximize).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Restore Notes' }));
    expect(callbacks.restore).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));
    expect(callbacks.minimize).toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Notes' }));
    await user.click(screen.getByRole('button', { name: 'Close Notes' }));

    expect(callbacks.close).toHaveBeenCalled();
    expect(callbacks.focus).toHaveBeenCalled();
  });

  it('announces window actions in a live region', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} />);

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));

    expect(screen.getByText(/Notes opened/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));
    expect(screen.getByText(/Notes minimized/)).toBeInTheDocument();
  });

  it('keeps alwaysOnTop windows above regular ones and supports skipTaskbar', () => {
    render(
      <Desktop
        apps={apps}
        defaultWindows={[createWindow({ alwaysOnTop: true, skipTaskbar: true })]}
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Notes' });

    expect(Number(dialog.style.zIndex)).toBeGreaterThanOrEqual(1000000000);
    expect(screen.queryByRole('button', { name: 'Notes' })).not.toBeInTheDocument();
  });

  it('maximizes when snapping to the top edge and cancels snaps on pointer cancel', () => {
    const onWindowSnap = jest.fn();
    const { container } = render(
      <Desktop apps={apps} defaultWindows={[createWindow()]} onWindowSnap={onWindowSnap} />
    );
    mockDesktopArea(container);

    const dialog = screen.getByRole('dialog', { name: 'Notes' }) as HTMLElement;
    const titleBar = dialog.querySelector('[class*="titleBar"]') as HTMLElement;

    fireEvent(titleBar, pointerEvent('pointerdown', 100, 100));
    fireEvent(titleBar, pointerEvent('pointermove', 5, 300));
    fireEvent(titleBar, pointerEvent('pointercancel', 5, 300));

    expect(container.querySelector('[class*="snapPreview"]')).not.toBeInTheDocument();
    expect(dialog).toHaveStyle({ left: '100px', top: '100px' });

    fireEvent(titleBar, pointerEvent('pointerdown', 100, 100));
    fireEvent(titleBar, pointerEvent('pointermove', 400, 5));
    fireEvent(titleBar, pointerEvent('pointerup', 400, 5));

    expect(onWindowSnap).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'notes-window' }),
      'maximize'
    );
    expect(screen.getByRole('button', { name: 'Restore Notes' })).toBeInTheDocument();
  });

  it('keeps a maximized window maximized when minimized and restored from the taskbar', async () => {
    const user = userEvent.setup();

    render(<Desktop apps={apps} defaultWindows={[createWindow()]} />);

    await user.click(screen.getByRole('button', { name: 'Maximize Notes' }));
    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));
    await user.click(screen.getByRole('button', { name: 'Notes' }));

    expect(screen.getByRole('button', { name: 'Restore Notes' })).toBeInTheDocument();
  });

  it('supports controlled workspaces', async () => {
    const user = userEvent.setup();
    const onWorkspaceChange = jest.fn();
    const workspaces = [
      { id: 'one', title: 'One' },
      { id: 'two', title: 'Two' }
    ];

    render(
      <Desktop
        apps={apps}
        workspaces={workspaces}
        workspace="one"
        onWorkspaceChange={onWorkspaceChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Workspace Two' }));

    expect(onWorkspaceChange).toHaveBeenCalledWith('two');
    expect(screen.getByRole('button', { name: 'Workspace One' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('keeps the modal recoverable when the parent taskbar button is used', async () => {
    const user = userEvent.setup();

    function ModalParent() {
      const { openWindow } = useDesktopWindow();

      return (
        <button
          type="button"
          onClick={() =>
            openWindow({
              title: 'Confirm',
              modal: true,
              width: 300,
              height: 180,
              content: <p>Child content</p>
            })
          }
        >
          Open modal
        </button>
      );
    }

    render(
      <Desktop
        apps={[{ id: 'parent', title: 'Parent', content: <ModalParent /> }]}
        defaultWindows={[createWindow({ id: 'parent-window', appId: 'parent', title: 'Parent' })]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Open modal' }));

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });
    const parentButton = within(taskbar).getByRole('button', { name: 'Parent' });

    expect(parentButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(parentButton);
    expect(screen.queryByRole('dialog', { name: 'Confirm' })).not.toBeInTheDocument();

    await user.click(parentButton);
    expect(screen.getByRole('dialog', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('keeps a modal above an alwaysOnTop parent', () => {
    render(
      <Desktop
        apps={[{ id: 'parent', title: 'Parent', content: <p>Parent</p> }]}
        defaultWindows={[
          createWindow({
            id: 'parent-window',
            appId: 'parent',
            title: 'Parent',
            alwaysOnTop: true,
            zIndex: 1
          }),
          {
            id: 'confirm-window',
            parentId: 'parent-window',
            title: 'Confirm',
            modal: true,
            x: 120,
            y: 120,
            width: 300,
            height: 180,
            minimized: false,
            maximized: false,
            zIndex: 2
          }
        ]}
      />
    );

    const parent = document.querySelector(
      '[data-desktop-window-id="parent-window"]'
    ) as HTMLElement;
    const confirm = screen.getByRole('dialog', { name: 'Confirm' });

    expect(Number(confirm.style.zIndex)).toBeGreaterThan(Number(parent.style.zIndex));
    expect(parent).toHaveAttribute('aria-hidden', 'true');
  });

  it('opens a new window after restoring a colliding stored id', async () => {
    const user = userEvent.setup();
    window.localStorage.clear();

    const first = render(<Desktop apps={apps} storageKey="desktop-collision-test" />);
    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));
    first.unmount();

    render(<Desktop apps={apps} storageKey="desktop-collision-test" />);
    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Start' }));
    await user.click(screen.getByRole('menuitem', { name: 'Open Notes' }));

    expect(screen.getAllByRole('dialog', { name: 'Notes' })).toHaveLength(2);

    window.localStorage.clear();
  });

  it('preserves content state when minimizing and switching workspaces', async () => {
    const user = userEvent.setup();

    function DraftApp() {
      const [value, setValue] = React.useState('');

      return (
        <input
          aria-label="Draft"
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      );
    }

    const draftApp: DesktopApp = {
      id: 'draft',
      title: 'Draft',
      content: <DraftApp />
    };

    render(
      <Desktop
        apps={[draftApp]}
        workspaces={[
          { id: 'one', title: 'One' },
          { id: 'two', title: 'Two' }
        ]}
        defaultWorkspace="one"
        defaultWindows={[createWindow({ id: 'draft-window', appId: 'draft', workspaceId: 'one' })]}
      />
    );

    await user.type(screen.getByRole('textbox', { name: 'Draft' }), 'hello');

    await user.click(screen.getByRole('button', { name: 'Minimize Draft' }));
    await user.click(screen.getByRole('button', { name: 'Draft' }));
    expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue('hello');

    await user.click(screen.getByRole('button', { name: 'Workspace Two' }));
    await user.click(screen.getByRole('button', { name: 'Workspace One' }));
    expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue('hello');
  });

  it('does not mark an alwaysOnTop window as active', () => {
    render(
      <Desktop
        apps={apps}
        groupTaskbar={false}
        defaultWindows={[
          createWindow({ alwaysOnTop: true }),
          createWindow({
            id: 'settings-window',
            appId: 'settings',
            title: 'Settings',
            zIndex: 2
          })
        ]}
      />
    );

    const taskbar = screen.getByRole('toolbar', { name: 'Taskbar' });

    expect(within(taskbar).getByRole('button', { name: 'Notes' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(within(taskbar).getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('only promotes and reports focus when the window was not active', () => {
    const onFocus = jest.fn();

    render(
      <Desktop
        apps={apps}
        defaultWindows={[
          createWindow(),
          createWindow({
            id: 'settings-window',
            appId: 'settings',
            title: 'Settings',
            zIndex: 2
          })
        ]}
        onWindowFocus={onFocus}
      />
    );

    fireEvent.pointerDown(screen.getByRole('dialog', { name: 'Notes' }));
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.pointerDown(screen.getByRole('dialog', { name: 'Notes' }));
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.contextMenu(screen.getByRole('dialog', { name: 'Notes' }), {
      clientX: 180,
      clientY: 120
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('allows windows outside the desktop when keepInBounds is false', () => {
    const { container } = render(
      <Desktop apps={apps} keepInBounds={false} defaultWindows={[createWindow()]} />
    );
    mockDesktopArea(container);

    const dialog = screen.getByRole('dialog', { name: 'Notes' }) as HTMLElement;
    const titleBar = dialog.querySelector('[class*="titleBar"]') as HTMLElement;

    fireEvent(titleBar, pointerEvent('pointerdown', 100, 100));
    fireEvent(titleBar, pointerEvent('pointermove', 700, 500));
    fireEvent(titleBar, pointerEvent('pointerup', 700, 500));

    expect(dialog).toHaveStyle({ left: '700px', top: '500px' });
  });

  it('persists the active workspace with storageKey', async () => {
    const user = userEvent.setup();
    const workspaces = [
      { id: 'one', title: 'One' },
      { id: 'two', title: 'Two' }
    ];
    window.localStorage.clear();

    const first = render(
      <Desktop
        apps={apps}
        workspaces={workspaces}
        defaultWorkspace="one"
        storageKey="desktop-workspace-test"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Workspace Two' }));
    first.unmount();

    render(
      <Desktop
        apps={apps}
        workspaces={workspaces}
        defaultWorkspace="one"
        storageKey="desktop-workspace-test"
      />
    );

    expect(screen.getByRole('button', { name: 'Workspace Two' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    window.localStorage.clear();
  });

  it('has no accessibility violations in RTL with the start menu open', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div dir="rtl">
        <Desktop apps={apps} defaultWindows={[createWindow()]} />
      </div>
    );

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations in RTL with a context menu open', async () => {
    const { container } = render(
      <div dir="rtl">
        <Desktop apps={apps} defaultWindows={[createWindow()]} />
      </div>
    );

    fireEvent.contextMenu(screen.getByRole('dialog', { name: 'Notes' }), {
      clientX: 180,
      clientY: 120
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no accessibility violations with compact workspaces and grouped windows', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Desktop
        compact
        apps={apps}
        workspaces={[
          { id: 'one', title: 'One' },
          { id: 'two', title: 'Two' }
        ]}
        defaultWorkspace="one"
        defaultWindows={[{ ...createWindow(), workspaceId: 'one' }]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Start' }));

    expect(await axe(container)).toHaveNoViolations();
  });
});
