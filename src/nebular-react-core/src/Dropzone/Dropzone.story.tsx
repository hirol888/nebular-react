import React, { useState } from 'react';
import { Button } from '../Button';
import { Dropzone } from './Dropzone';

export default { title: 'Dropzone', component: Dropzone };

export function Showcase() {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);

  const clear = () => {
    setAccepted([]);
    setRejected([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Dropzone
        ariaLabel="Upload documents"
        accept=".pdf,.png"
        maxSize={1024 * 1024}
        onDrop={(files) => setAccepted(files.map((file) => file.name))}
        onReject={(files) => setRejected(files.map((file) => file.name))}
      />
      <span>Accepted: {accepted.join(', ') || 'none'}</span>
      <span>Rejected: {rejected.join(', ') || 'none'}</span>
      <Button size="small" onClick={clear}>
        Clear selection
      </Button>
    </div>
  );
}

export function CustomContent() {
  const [file, setFile] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 360 }}>
      <Dropzone
        ariaLabel="Upload a single image"
        accept="image/*"
        multiple={false}
        maxSize={5 * 1024 * 1024}
        onDrop={(files) => setFile(files[0]?.name ?? 'none')}
      >
        <span style={{ fontWeight: 600 }}>Drop an image here</span>
        <span>PNG, JPG or SVG up to 5 MB</span>
      </Dropzone>
      <span>Selected image: {file}</span>
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Dropzone ariaLabel="Upload disabled" disabled onDrop={() => undefined}>
        <span style={{ fontWeight: 600 }}>Uploads are disabled</span>
        <span>Ask an administrator to enable them</span>
      </Dropzone>
    </div>
  );
}
