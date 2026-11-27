import React, { useEffect, useState } from 'react';
import { LogViewer } from './LogViewer';
import type { LogViewerEntry } from './LogViewer';

export default { title: 'LogViewer', component: LogViewer };

const sampleEntries: LogViewerEntry[] = Array.from({ length: 1200 }, (_, index) => ({
  id: index,
  timestamp: new Date(Date.UTC(2024, 0, 1, 14, 0, index)).toISOString().slice(11, 19),
  level: index % 9 === 0 ? 'WARN' : 'INFO',
  message:
    index % 9 === 0
      ? `Job ${index + 1} took longer than expected. Retrying after a transient connection timeout.`
      : `Job ${index + 1} completed.`
}));

export function Desktop() {
  return <LogViewer entries={sampleEntries} defaultFollowing={false} height={360} />;
}

export function Mobile() {
  return (
    <div style={{ maxWidth: 390 }}>
      <LogViewer
        entries={[
          ...sampleEntries,
          {
            id: 'final',
            timestamp: '15:04:00',
            level: 'ERROR',
            message:
              'The latest attempt failed because the HTTP response exceeded the configured timeout.\nRetry scheduled for 15:05:00.'
          }
        ]}
        defaultWrap
        height={272}
      />
    </div>
  );
}

export function Following() {
  const [entries, setEntries] = useState(() => sampleEntries.slice(0, 150));
  useEffect(() => {
    const timer = window.setInterval(() => {
      setEntries((current) => {
        const next = sampleEntries[current.length];
        return next ? [...current, next] : current;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, []);

  return <LogViewer entries={entries} height={280} />;
}
