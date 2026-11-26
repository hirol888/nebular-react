import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesktopSurface, type DesktopApp, type DesktopWindowState } from '@nebular-react/core';

const apps: DesktopApp[] = [
  { id: 'notes', title: 'Notes', content: <p>Notes content</p> },
  { id: 'settings', title: 'Settings', content: <p>Settings content</p> }
];

function createWindow(overrides: Partial<DesktopWindowState> = {}): DesktopWindowState {
  return {
    id: 'left-window',
    appId: 'notes',
    x: 40,
    y: 40,
    width: 300,
    height: 220,
    minimized: false,
    maximized: false,
    zIndex: 1,
    ...overrides
  };
}

describe('DesktopSurface', () => {
  it('renders only windows from the requested display and merges updates', async () => {
    const user = userEvent.setup();
    const onWindowsChange = jest.fn();
    const displays = [
      {
        id: 'left',
        label: 'Left',
        primary: true,
        bounds: { x: 0, y: 0, width: 600, height: 400 }
      },
      {
        id: 'right',
        label: 'Right',
        bounds: { x: 600, y: 0, width: 600, height: 400 }
      }
    ];
    const windows = [
      createWindow({ displayId: 'left' }),
      createWindow({
        id: 'right-window',
        appId: 'settings',
        title: 'Settings',
        displayId: 'right',
        zIndex: 2
      })
    ];

    render(
      <DesktopSurface
        surfaceId="left"
        displays={displays}
        windows={windows}
        onWindowsChange={onWindowsChange}
        apps={apps}
      />
    );

    expect(screen.getByRole('dialog', { name: 'Notes' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Minimize Notes' }));

    const lastCall = onWindowsChange.mock.calls.at(-1)?.[0] as DesktopWindowState[];

    expect(lastCall).toHaveLength(2);
    expect(lastCall).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'left-window', minimized: true }),
        expect.objectContaining({ id: 'right-window', minimized: false })
      ])
    );
  });
});
