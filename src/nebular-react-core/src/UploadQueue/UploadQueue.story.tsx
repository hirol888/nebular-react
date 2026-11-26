import React, { useEffect, useId, useRef, useState } from 'react';
import { UploadQueue, UploadQueueItem, UploadQueueStatus } from './UploadQueue';

export default { title: 'UploadQueue', component: UploadQueue };

const sampleItems: UploadQueueItem[] = [
  { id: 'photo', name: 'photo.png', status: 'success' },
  { id: 'report', name: 'monthly-report.pdf', status: 'uploading', progress: 42 },
  { id: 'spreadsheet', name: 'finance.xlsx', status: 'error', error: 'The connection was lost.' },
  { id: 'archive', name: 'archive.zip', status: 'queued' }
];

export function Showcase() {
  return <UploadQueue items={sampleItems} style={{ maxWidth: 620 }} />;
}

export function Controlled() {
  const [items, setItems] = useState(sampleItems);
  const [rejected, setRejected] = useState<string[]>([]);
  const id = useId();
  const sequence = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setItems((current) => {
        if (!current.some((item) => item.status === 'uploading')) {
          return current;
        }
        return current.map((item) => {
          if (item.status !== 'uploading') {
            return item;
          }
          const progress = Math.min(100, (item.progress ?? 0) + 10);
          return { ...item, status: progress === 100 ? 'success' : 'uploading', progress };
        });
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const updateStatus = (itemId: string, status: UploadQueueStatus) => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, status, progress: 0, error: undefined } : item
      )
    );
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <UploadQueue
        items={items}
        accept=".png,.jpg,.pdf"
        onAddFiles={(files) => {
          const incoming = files.map<UploadQueueItem>((file) => {
            sequence.current += 1;
            return { id: `${id}-${sequence.current}`, name: file.name, status: 'uploading' };
          });
          setRejected([]);
          setItems((current) => [...current, ...incoming]);
        }}
        onRejectFiles={(files) => setRejected(files.map((file) => file.name))}
        onCancel={(itemId) => updateStatus(itemId, 'cancelled')}
        onRetry={(itemId) => updateStatus(itemId, 'uploading')}
      />
      {rejected.length > 0 && <p role="alert">Unsupported files: {rejected.join(', ')}</p>}
    </div>
  );
}

export function Narrow() {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <UploadQueue
        items={[
          ...sampleItems,
          {
            id: 'long-name',
            name: 'international-purchase-order-with-a-very-long-file-name.pdf',
            status: 'uploading'
          }
        ]}
        onCancel={() => {}}
        onRetry={() => {}}
      />
    </div>
  );
}
