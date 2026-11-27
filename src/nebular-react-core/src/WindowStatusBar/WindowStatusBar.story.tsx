import React, { useState } from 'react';
import { Icon } from '../Icon';
import type { WindowStatusItem } from './WindowStatusBar';
import { WindowStatusBar } from './WindowStatusBar';

export default { title: 'WindowStatusBar', component: WindowStatusBar };

const statusItems: WindowStatusItem[] = [
  {
    key: 'sync',
    icon: <Icon icon="cloud-upload-outline" />,
    label: 'Sync',
    value: 'Up to date',
    tone: 'success'
  },
  {
    key: 'branch',
    icon: <Icon icon="code-outline" />,
    label: 'main'
  },
  {
    key: 'errors',
    icon: <Icon icon="alert-circle-outline" />,
    label: '2 problems',
    tone: 'warning',
    title: 'Open problems panel'
  },
  {
    key: 'encoding',
    label: 'UTF-8'
  }
];

const toolbarButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: '0.2rem',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  padding: '0.1rem 0.25rem'
};

export function Default() {
  return (
    <div style={{ border: '1px solid #e4e9f2', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ height: 120, background: '#f7f9fc' }} />
      <WindowStatusBar
        start={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon icon="checkmark-circle-outline" />
            Ready
          </span>
        }
        items={statusItems}
        center="C:\Projects\AllApp\NebularCore\src\WindowStatusBar"
        end={
          <>
            <button type="button" style={toolbarButtonStyle}>
              Ln 12, Col 4
            </button>
            <button type="button" style={toolbarButtonStyle}>
              100%
            </button>
          </>
        }
      />
    </div>
  );
}

export function Tones() {
  return (
    <WindowStatusBar
      ariaLabel="Status tones"
      items={[
        { key: 'default', label: 'Default', value: 'Idle' },
        { key: 'info', label: 'Info', value: 'Running', tone: 'info' },
        { key: 'success', label: 'Success', value: 'Saved', tone: 'success' },
        { key: 'warning', label: 'Warning', value: 'Unsaved', tone: 'warning' },
        { key: 'danger', label: 'Danger', value: 'Offline', tone: 'danger' }
      ]}
    />
  );
}

export function Interactive() {
  const [running, setRunning] = useState(false);

  return (
    <WindowStatusBar
      start={<span>{running ? 'Task running…' : 'Task finished'}</span>}
      items={[
        {
          key: 'run',
          icon: <Icon icon="play-circle-outline" />,
          label: running ? 'Stop' : 'Run',
          tone: running ? 'warning' : 'success',
          onClick: () => setRunning((previous) => !previous)
        },
        { key: 'duration', label: 'Duration', value: '1.4s' }
      ]}
      end={<span>UTF-8</span>}
    />
  );
}

export function Sizes() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <WindowStatusBar
        ariaLabel="Compact status bar"
        size="sm"
        items={[
          { key: 'mode', label: 'Mode', value: 'Compact' },
          { key: 'encoding', label: 'UTF-8' }
        ]}
      />
      <WindowStatusBar
        ariaLabel="Regular status bar"
        size="md"
        items={[
          { key: 'mode', label: 'Mode', value: 'Regular' },
          { key: 'encoding', label: 'UTF-8' }
        ]}
      />
    </div>
  );
}
