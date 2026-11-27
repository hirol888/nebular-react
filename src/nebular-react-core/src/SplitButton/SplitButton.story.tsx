import React from 'react';
import { SplitButton } from './SplitButton';
import { Icon } from '../Icon';

export default { title: 'SplitButton', component: SplitButton };

const items = [
  { key: 'save-draft', label: 'Save as draft', onClick: () => undefined },
  { key: 'save-template', label: 'Save as template', onClick: () => undefined },
  { key: 'publish-now', label: 'Publish now', onClick: () => undefined },
  { key: 'archive', label: 'Archive', disabled: true }
];

export function Basic() {
  return (
    <div style={{ padding: '1rem' }}>
      <SplitButton label="Save" items={items} onClick={() => undefined} />
    </div>
  );
}

export function WithIcons() {
  return (
    <div style={{ display: 'flex', gap: '1rem', padding: '1rem', flexWrap: 'wrap' }}>
      <SplitButton
        label="Publish"
        ariaLabel="Publishing actions"
        menuAriaLabel="More publishing actions"
        onClick={() => undefined}
        items={[
          {
            key: 'schedule',
            label: 'Schedule',
            icon: <Icon icon="calendar-outline" pack="nebular-essentials" />,
            onClick: () => undefined
          },
          {
            key: 'duplicate',
            label: 'Duplicate',
            icon: <Icon icon="copy-outline" pack="nebular-essentials" />,
            onClick: () => undefined
          },
          {
            key: 'discard',
            label: 'Discard',
            icon: <Icon icon="trash-2-outline" pack="nebular-essentials" />,
            onClick: () => undefined
          }
        ]}
      />
      <SplitButton
        label="Delete"
        status="danger"
        appearance="outline"
        onClick={() => undefined}
        items={items}
      />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ padding: '1rem' }}>
      <SplitButton label="Save" disabled onClick={() => undefined} items={items} />
    </div>
  );
}
