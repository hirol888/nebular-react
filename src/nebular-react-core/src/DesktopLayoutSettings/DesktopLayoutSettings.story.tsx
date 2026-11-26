import React, { useState } from 'react';
import { DesktopLayoutSettings, type DesktopLayoutScope } from './DesktopLayoutSettings';
import { getDesktopDeviceId } from '../Desktop';

export default {
  title: 'DesktopLayoutSettings',
  component: DesktopLayoutSettings
};

export function DeviceAndShared() {
  const [scope, setScope] = useState<DesktopLayoutScope>('device');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutSettings
        scope={scope}
        onScopeChange={(next) => {
          setScope(next);
          setSaved(false);
        }}
        deviceId={getDesktopDeviceId()}
        saving={saving}
        saved={saved}
        onSave={() => {
          setSaving(true);
          setSaved(false);
          window.setTimeout(() => {
            setSaving(false);
            setSaved(true);
          }, 500);
        }}
      />
    </div>
  );
}

export function ReadOnly() {
  return (
    <div style={{ maxWidth: '40rem', padding: '1rem' }}>
      <DesktopLayoutSettings scope="shared" deviceId="browser-demo" disabled />
    </div>
  );
}
