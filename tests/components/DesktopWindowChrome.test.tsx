import React from 'react';
import { render, screen, within } from '@testing-library/react';
import {
  Desktop,
  serializeDesktopLayout,
  WindowBreadcrumb,
  WindowStatusBar,
  type DesktopApp,
  type DesktopWindowState
} from '@nebular-react/core';

const app: DesktopApp = {
  id: 'notes',
  title: 'Notes',
  content: <p>Notes content</p>,
  toolbar: (
    <WindowBreadcrumb
      items={[
        { label: 'Files', onClick: () => undefined },
        { label: 'Documents', onClick: () => undefined },
        { label: 'Reports' }
      ]}
    />
  ),
  footer: (
    <WindowStatusBar
      items={[
        { label: 'Ready', tone: 'success' },
        { label: 'Files', value: '4' }
      ]}
      end="UTF-8"
    />
  )
};

const windowState: DesktopWindowState = {
  id: 'notes-window',
  appId: 'notes',
  x: 40,
  y: 40,
  width: 480,
  height: 320,
  minimized: false,
  maximized: false,
  zIndex: 1
};

describe('Desktop window chrome', () => {
  it('renders app toolbar and footer slots', () => {
    render(<Desktop apps={[app]} defaultWindows={[windowState]} />);

    const dialog = screen.getByRole('dialog', { name: 'Notes' });
    expect(within(dialog).getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Status bar' })).toBeInTheDocument();
    expect(within(dialog).getByText('Ready')).toBeInTheDocument();
    expect(within(dialog).getByText('UTF-8')).toBeInTheDocument();
  });

  it('does not persist toolbar/footer React nodes in the layout snapshot', () => {
    const snapshot = serializeDesktopLayout([windowState]);

    expect(snapshot.windows[0]).not.toHaveProperty('toolbar');
    expect(snapshot.windows[0]).not.toHaveProperty('footer');
  });
});
