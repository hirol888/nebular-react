import React, { useState } from 'react';
import { Button } from '../Button';
import { FileButton } from './FileButton';

export default { title: 'FileButton', component: FileButton };

export function Showcase() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileButton onChange={(files) => setFile(files?.[0] ?? null)} accept="image/*">
        <Button status="primary">Upload image</Button>
      </FileButton>
      <span>{file ? `Selected: ${file.name}` : 'No file selected'}</span>
    </div>
  );
}

export function Multiple() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <FileButton onChange={(next) => setFiles(next ?? [])} multiple reset>
        <Button status="success">Upload files</Button>
      </FileButton>
      <span>{files.length} file(s) selected</span>
    </div>
  );
}

export function Disabled() {
  return (
    <FileButton onChange={() => undefined} disabled>
      <Button disabled>Upload</Button>
    </FileButton>
  );
}
