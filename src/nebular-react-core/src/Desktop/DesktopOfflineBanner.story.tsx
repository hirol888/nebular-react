import React from 'react';
import { DesktopConnectionStatus } from './DesktopConnectionStatus';
import { DesktopOfflineBanner } from './DesktopOfflineBanner';

export default {
  title: 'Desktop/Connection',
  component: DesktopOfflineBanner
};

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 220,
        padding: '1rem',
        borderRadius: '0.75rem',
        background: 'linear-gradient(135deg, #edf1f7 0%, #dbe4f0 100%)',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <Surface>
      <DesktopOfflineBanner
        offline
        description="Your layout stays available. Changes will sync when the connection returns."
        onRetry={() => undefined}
      />
    </Surface>
  );
}

export function BottomBanner() {
  return (
    <Surface>
      <DesktopOfflineBanner
        offline
        position="bottom"
        title="You are working offline"
        description="Open windows and preferences are stored on this device."
        onRetry={() => undefined}
      />
    </Surface>
  );
}

export function OnlineBanner() {
  return (
    <Surface>
      <DesktopOfflineBanner online description="The connection is back." />
    </Surface>
  );
}

export function ConnectionStatus() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <DesktopConnectionStatus online showLabel />
        <DesktopConnectionStatus online={false} showLabel />
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <DesktopConnectionStatus online />
        <DesktopConnectionStatus online={false} />
      </div>
    </div>
  );
}
