import React from 'react';
import { Icon } from '../Icon';
import type { WindowBreadcrumbItem } from './WindowBreadcrumb';
import { WindowBreadcrumb } from './WindowBreadcrumb';

export default { title: 'WindowBreadcrumb', component: WindowBreadcrumb };

const items: WindowBreadcrumbItem[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <Icon icon="home-outline" />,
    href: '#home'
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: <Icon icon="folder-outline" />,
    href: '#projects'
  },
  {
    key: 'nebular',
    label: 'Nebular',
    icon: <Icon icon="folder-outline" />,
    href: '#nebular'
  },
  {
    key: 'readme',
    label: 'README.md',
    icon: <Icon icon="file-text-outline" />
  }
];

const deepItems: WindowBreadcrumbItem[] = [
  ...items.slice(0, 3),
  { key: 'src', label: 'src', href: '#src' },
  { key: 'components', label: 'components', href: '#components' },
  { key: 'window', label: 'Window', href: '#window' },
  { key: 'breadcrumb', label: 'WindowBreadcrumb.tsx' }
];

const toolbarButtonStyle: React.CSSProperties = {
  border: 0,
  borderRadius: '0.25rem',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  padding: '0.2rem 0.35rem'
};

export function Default() {
  return (
    <div style={{ width: 640, border: '1px solid #e4e9f2', borderRadius: 6 }}>
      <WindowBreadcrumb items={items} ariaLabel="Current location" />
    </div>
  );
}

export function WithNavigationSlots() {
  return (
    <div style={{ width: 640, border: '1px solid #e4e9f2', borderRadius: 6 }}>
      <WindowBreadcrumb
        items={items}
        ariaLabel="File location"
        leading={
          <>
            <button type="button" style={toolbarButtonStyle} aria-label="Back">
              ←
            </button>
            <button type="button" style={toolbarButtonStyle} aria-label="Forward">
              →
            </button>
          </>
        }
        trailing={
          <input
            type="search"
            aria-label="Filter path"
            placeholder="Filter…"
            style={{
              width: 120,
              border: '1px solid #e4e9f2',
              borderRadius: '0.25rem',
              font: 'inherit',
              padding: '0.1rem 0.3rem'
            }}
          />
        }
      />
    </div>
  );
}

export function CollapsedItems() {
  return (
    <div style={{ width: 560, border: '1px solid #e4e9f2', borderRadius: 6 }}>
      <WindowBreadcrumb items={deepItems} maxItems={5} ariaLabel="Deep file location" />
    </div>
  );
}

export function HorizontalOverflow() {
  return (
    <div style={{ width: 320, border: '1px solid #e4e9f2', borderRadius: 6 }}>
      <WindowBreadcrumb
        items={deepItems}
        collapse={false}
        separator="/"
        ariaLabel="Overflowing file location"
      />
    </div>
  );
}
