import React, { useState } from 'react';
import { SpeedDial } from './SpeedDial';
import { Icon } from '../Icon';

export default { title: 'SpeedDial', component: SpeedDial };

const actions = [
  {
    key: 'share',
    label: 'Share',
    icon: <Icon icon="share-outline" pack="nebular-essentials" />,
    onClick: () => undefined
  },
  {
    key: 'copy',
    label: 'Copy link',
    icon: <Icon icon="copy-outline" pack="nebular-essentials" />,
    onClick: () => undefined
  },
  {
    key: 'favorite',
    label: 'Add to favorites',
    icon: <Icon icon="star-outline" pack="nebular-essentials" />,
    onClick: () => undefined
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: <Icon icon="archive-outline" pack="nebular-essentials" />,
    disabled: true
  }
];

export function Basic() {
  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <p>The dial stays anchored to the bottom end corner of the viewport.</p>
      <SpeedDial actions={actions} ariaLabel="Quick actions" />
    </div>
  );
}

export function DirectionsAndPositions() {
  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <SpeedDial
        actions={actions}
        ariaLabel="Top actions"
        direction="down"
        position="top-start"
        icon={<Icon icon="chevron-down-outline" pack="nebular-essentials" />}
      />
      <SpeedDial
        actions={actions}
        ariaLabel="Side actions"
        direction="left"
        position="bottom-end"
        icon={<Icon icon="arrow-forward-outline" pack="nebular-essentials" />}
      />
    </div>
  );
}

export function Controlled() {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <div style={{ minHeight: 480, padding: '1rem' }}>
      <p>Opened: {String(opened)}</p>
      <SpeedDial
        actions={actions}
        ariaLabel="Controlled actions"
        opened={opened}
        onOpenChange={setOpened}
      />
    </div>
  );
}
