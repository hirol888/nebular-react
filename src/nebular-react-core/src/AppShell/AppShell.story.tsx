import React from 'react';
import { Button } from '../Button';
import { AppShell } from './AppShell';

export default { title: 'AppShell', component: AppShell };

const navItems = ['Dashboard', 'Reports', 'Projects', 'Settings'];

function NavbarDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.75rem' }}>
      {navItems.map((item) => (
        <a key={item} href={`#${item.toLowerCase()}`} style={{ padding: '0.5rem 0.75rem' }}>
          {item}
        </a>
      ))}
    </div>
  );
}

export function Showcase() {
  return (
    <AppShell
      ariaLabel="Application shell"
      header={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <strong>Nebular</strong>
          <span style={{ color: '#8f9bb3' }}>Workspace</span>
        </div>
      }
      navbar={<NavbarDemo />}
      aside={
        <div style={{ padding: '0.75rem' }}>
          <h3 style={{ marginTop: 0 }}>Activity</h3>
          <p>No new notifications.</p>
        </div>
      }
      footer={<span>Nebular React · v0.4.0</span>}
    >
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Main content is rendered inside the central landmark.</p>
      <Button status="primary">Create project</Button>
    </AppShell>
  );
}

export function StickyHeader() {
  return (
    <AppShell
      stickyHeader
      header={<strong>Sticky header</strong>}
      navbar={<NavbarDemo />}
      footer={<span>Footer</span>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index} style={{ margin: 0 }}>
            Scrollable content row {index + 1}
          </p>
        ))}
      </div>
    </AppShell>
  );
}

export function CollapsedByDefault() {
  return (
    <AppShell
      defaultNavbarCollapsed
      defaultAsideCollapsed
      header={<strong>Collapsed panels</strong>}
      navbar={<NavbarDemo />}
      aside={
        <div style={{ padding: '0.75rem' }}>
          <p>Aside content</p>
        </div>
      }
    >
      <p>Toggle the panels with the header buttons.</p>
    </AppShell>
  );
}
