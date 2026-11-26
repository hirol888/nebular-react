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
    expect(screen.getByRole('status', { name: 'Clock' })).toBeInTheDocument();
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
});
