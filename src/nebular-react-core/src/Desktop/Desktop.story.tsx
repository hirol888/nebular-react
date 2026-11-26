import React from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import {
  Desktop,
  useDesktopWindow,
  type DesktopApp,
  type DesktopTaskbarPosition,
  type DesktopWindowState,
  type DesktopWorkspace
} from '.';

export default { title: 'Desktop', component: Desktop };

function NotesApp() {
  const { openWindow } = useDesktopWindow();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ margin: 0 }}>
        This window behaves like a desktop window: drag the title bar, resize it from the edges,
        snap it to a screen edge, maximize it, or minimize it to the taskbar.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button
          size="small"
          onClick={() =>
            openWindow({
              title: 'Modal child',
              modal: true,
              width: 360,
              height: 200,
              content: (
                <p style={{ margin: 0 }}>
                  This child blocks the window that opened it until it is closed. Focus is trapped
                  inside it and returns to this button afterwards.
                </p>
              )
            })
          }
        >
          Open modal child
        </Button>
        <Button
          size="small"
          appearance="outline"
          onClick={() =>
            openWindow({
              title: 'Independent child',
              width: 340,
              height: 180,
              content: <p style={{ margin: 0 }}>This child can be moved independently.</p>
            })
          }
        >
          Open independent child
        </Button>
      </div>
    </div>
  );
}

function TasksApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <strong>Task list</strong>
      <span>Use the taskbar to switch between open windows.</span>
      <span>Right-click a window or taskbar button for more actions.</span>
      <span>Press Alt+Tab to cycle through visible windows.</span>
    </div>
  );
}

function MailApp() {
  return <p style={{ margin: 0 }}>Inbox · 3 unread messages</p>;
}

function SettingsApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <strong>Desktop settings</strong>
      <span>Use the workspace buttons to switch between virtual desktops.</span>
      <span>Minimized windows stay in the taskbar until restored.</span>
    </div>
  );
}

const apps: DesktopApp[] = [
  {
    id: 'notes',
    title: 'Notes',
    icon: <Icon icon="file-text-outline" pack="nebular-essentials" aria-hidden="true" />,
    content: <NotesApp />,
    defaultWidth: 540,
    defaultHeight: 340,
    pinned: true
  },
  {
    id: 'tasks',
    title: 'Tasks',
    icon: <Icon icon="checkmark-outline" pack="nebular-essentials" aria-hidden="true" />,
    content: <TasksApp />,
    defaultWidth: 420,
    defaultHeight: 260
  },
  {
    id: 'mail',
    title: 'Mail',
    icon: <Icon icon="email-outline" pack="nebular-essentials" aria-hidden="true" />,
    content: <MailApp />,
    defaultWidth: 460,
    defaultHeight: 280,
    singleInstance: true,
    pinned: true
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Icon icon="expand-outline" pack="nebular-essentials" aria-hidden="true" />,
    content: <SettingsApp />,
    defaultWidth: 420,
    defaultHeight: 260
  }
];

function windowState(
  id: string,
  appId: string,
  x: number,
  y: number,
  zIndex: number,
  overrides: Partial<DesktopWindowState> = {}
): DesktopWindowState {
  return {
    id,
    appId,
    x,
    y,
    width: 520,
    height: 320,
    minimized: false,
    maximized: false,
    zIndex,
    ...overrides
  };
}

export function Showcase() {
  return (
    <Desktop
      fullscreen
      apps={apps}
      defaultWindows={[windowState('welcome', 'notes', 80, 64, 1)]}
      systemTray={
        <Icon icon="alert-triangle-outline" pack="nebular-essentials" aria-label="Notifications" />
      }
    />
  );
}

export function TaskbarPositions() {
  const [position, setPosition] = React.useState<DesktopTaskbarPosition>('bottom');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(['bottom', 'top', 'left', 'right'] as const).map((value) => (
          <Button
            key={value}
            size="small"
            appearance={position === value ? 'filled' : 'outline'}
            onClick={() => setPosition(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      <div style={{ height: '32rem' }}>
        <Desktop
          apps={apps}
          taskbarPosition={position}
          defaultWindows={[windowState('notes-window', 'notes', 48, 48, 1)]}
        />
      </div>
    </div>
  );
}

export function GroupedWindows() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        defaultWindows={[
          windowState('notes-1', 'notes', 40, 40, 1),
          windowState('notes-2', 'notes', 120, 100, 2),
          windowState('mail-1', 'mail', 260, 160, 3),
          windowState('settings-1', 'settings', 320, 220, 4)
        ]}
      />
    </div>
  );
}

export function WindowSnapping() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop apps={apps} defaultWindows={[windowState('snap-notes', 'notes', 120, 80, 1)]} />
    </div>
  );
}

export function VirtualWorkspaces() {
  const workspaces: DesktopWorkspace[] = [
    { id: 'main', title: 'Main', background: '#edf1f7' },
    { id: 'focus', title: 'Focus', background: '#e9f2ff', accentColor: '#3366ff' },
    { id: 'chat', title: 'Chat', background: '#f2ecff', accentColor: '#8b5cf6' }
  ];

  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        workspaces={workspaces}
        defaultWorkspace="main"
        defaultWindows={[
          { ...windowState('main-notes', 'notes', 60, 60, 1), workspaceId: 'main' },
          { ...windowState('focus-tasks', 'tasks', 90, 90, 2), workspaceId: 'focus' }
        ]}
      />
    </div>
  );
}

export function DesktopIcons() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        defaultWindows={[]}
        icons={[
          {
            id: 'notes-shortcut',
            label: 'Notes',
            appId: 'notes',
            icon: <Icon icon="file-text-outline" pack="nebular-essentials" aria-hidden="true" />
          },
          {
            id: 'tasks-shortcut',
            label: 'Tasks',
            appId: 'tasks',
            icon: <Icon icon="checkmark-outline" pack="nebular-essentials" aria-hidden="true" />
          },
          {
            id: 'settings-shortcut',
            label: 'Settings',
            appId: 'settings',
            icon: <Icon icon="expand-outline" pack="nebular-essentials" aria-hidden="true" />,
            x: 100,
            y: 20
          }
        ]}
      />
    </div>
  );
}

export function MultiDisplay() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        displayMode="span"
        displays={[
          {
            id: 'left',
            label: 'Left',
            primary: true,
            bounds: { x: 0, y: 0, width: 560, height: 480 }
          },
          {
            id: 'right',
            label: 'Right',
            bounds: { x: 560, y: 0, width: 560, height: 480 }
          }
        ]}
        defaultWindows={[
          windowState('left-notes', 'notes', 40, 40, 1),
          { ...windowState('right-tasks', 'tasks', 620, 80, 2), displayId: 'right' }
        ]}
      />
    </div>
  );
}

export function Notifications() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        defaultWindows={[windowState('notify-notes', 'notes', 60, 60, 1)]}
        notifications={[
          {
            id: 'one',
            title: 'Build finished',
            message: 'The documentation build completed successfully.',
            timestamp: '2026-02-06T10:30:00Z',
            status: 'success'
          },
          {
            id: 'two',
            title: 'New file uploaded',
            message: 'report.pdf was added to Documents.',
            timestamp: '2026-02-06T10:20:00Z',
            read: true
          }
        ]}
      />
    </div>
  );
}

export function CompactLayout() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        compact
        apps={apps}
        defaultWindows={[windowState('compact-notes', 'notes', 0, 0, 1, { maximized: true })]}
      />
    </div>
  );
}

export function TaskbarOverflow() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        groupTaskbar={false}
        maxTaskbarItems={2}
        defaultWindows={[
          windowState('overflow-1', 'notes', 40, 40, 1),
          windowState('overflow-2', 'tasks', 80, 80, 2),
          windowState('overflow-3', 'mail', 120, 120, 3),
          windowState('overflow-4', 'settings', 160, 160, 4)
        ]}
      />
    </div>
  );
}

export function PersistedLayout() {
  return (
    <div style={{ height: '32rem' }}>
      <Desktop
        apps={apps}
        storageKey="nebular-desktop-demo"
        defaultWindows={[windowState('persisted-notes', 'notes', 70, 70, 1)]}
      />
    </div>
  );
}
