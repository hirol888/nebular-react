import React, { useState } from 'react';
import { Icon } from '../Icon';
import { Button } from '../Button';
import { Desktop, useDesktopWindow, type DesktopApp, type DesktopTaskbarPosition } from './Desktop';

export default { title: 'Desktop', component: Desktop };

function NotesApp() {
  const { openWindow } = useDesktopWindow();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <p style={{ margin: 0 }}>
        This window behaves like a desktop window: drag the title bar, resize it from the edges,
        maximize it, or minimize it to the taskbar.
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
                  This child blocks the window that opened it until it is closed.
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

function SettingsApp() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <strong>Desktop settings</strong>
      <span>Use the taskbar to switch between open windows.</span>
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
    defaultHeight: 340
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: <Icon icon="settings-outline" pack="nebular-essentials" aria-hidden="true" />,
    content: <SettingsApp />,
    defaultWidth: 420,
    defaultHeight: 260
  }
];

export function Showcase() {
  return (
    <Desktop
      fullscreen
      apps={apps}
      defaultWindows={[
        {
          id: 'welcome',
          appId: 'notes',
          x: 80,
          y: 64,
          width: 540,
          height: 340,
          minimized: false,
          maximized: false,
          zIndex: 1
        }
      ]}
      systemTray={<Icon icon="bell-outline" pack="nebular-essentials" aria-label="Notifications" />}
    />
  );
}

export function TaskbarPositions() {
  const [position, setPosition] = useState<DesktopTaskbarPosition>('bottom');

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
          defaultWindows={[
            {
              id: 'notes-window',
              appId: 'notes',
              x: 48,
              y: 48,
              width: 480,
              height: 300,
              minimized: false,
              maximized: false,
              zIndex: 1
            }
          ]}
        />
      </div>
    </div>
  );
}
