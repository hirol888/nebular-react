import React, { useState } from 'react';
import { SwitchGroup } from './SwitchGroup';

export default { title: 'SwitchGroup', component: SwitchGroup };

const notifications = [
  { label: 'Email', value: 'email' },
  { label: 'Push', value: 'push' },
  { label: 'SMS', value: 'sms' }
];

export function Showcase() {
  const [value, setValue] = useState<string[]>(['email']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 360 }}>
      <SwitchGroup
        label="Notifications"
        description="Choose every channel you want to receive alerts on."
        data={notifications}
        value={value}
        onChange={setValue}
        required
      />

      <SwitchGroup label="Horizontal" orientation="horizontal" data={notifications} />

      <SwitchGroup
        label="Disabled"
        description="This group is disabled"
        data={notifications}
        disabled
        error="Not available right now"
      />
    </div>
  );
}
