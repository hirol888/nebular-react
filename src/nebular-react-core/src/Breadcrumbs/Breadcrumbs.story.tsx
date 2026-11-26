import React, { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

export default { title: 'Breadcrumbs', component: Breadcrumbs };

export function Showcase() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '#' },
        { label: 'Projects', href: '#' },
        { label: 'Nebular', href: '#' },
        { label: 'Breadcrumbs' }
      ]}
    />
  );
}

export function CustomSeparator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Breadcrumbs
        ariaLabel="Documentation breadcrumb"
        separator="›"
        items={[
          { label: 'Documentation', href: '#' },
          { label: 'Components', href: '#' },
          { label: 'Navigation', href: '#' },
          { label: 'Breadcrumbs' }
        ]}
      />
      <Breadcrumbs
        ariaLabel="Settings breadcrumb"
        separator="|"
        items={[
          { label: 'Workspace', href: '#' },
          { label: 'Members', href: '#' },
          { label: 'Permissions' }
        ]}
      />
    </div>
  );
}

export function WithClickHandler() {
  const [current, setCurrent] = useState('Overview');

  const navigate = (section: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setCurrent(section);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Breadcrumbs
        ariaLabel="Account breadcrumb"
        items={[
          { label: 'Account', href: '#', onClick: navigate('Account') },
          { label: 'Security', href: '#', onClick: navigate('Security') },
          { label: 'Sessions', href: '#', onClick: navigate('Sessions') }
        ]}
      />
      <span>Current section: {current}</span>
    </div>
  );
}
