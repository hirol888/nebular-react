import React, { useState } from 'react';
import { ExampleItemsCol } from '../Shared';
import { FileInput, FileInputValue } from './FileInput';

export default { title: 'FileInput', component: FileInput };

export function Showcase() {
  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <FileInput label="Resume" ariaLabel="Resume" accept=".pdf,.doc,.docx" />
      <FileInput label="Avatar" ariaLabel="Avatar" accept="image/*" buttonLabel="Upload image" />
      <FileInput label="Disabled" ariaLabel="Disabled" disabled />
    </ExampleItemsCol>
  );
}

export function Clearable() {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (value: FileInputValue) => {
    setFile(Array.isArray(value) ? (value[0] ?? null) : value);
  };

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <FileInput
        label="Attachment"
        ariaLabel="Attachment"
        clearable
        value={file}
        onChange={handleChange}
        placeholder="No attachment selected"
      />
      <FileInput label="Not clearable" ariaLabel="Not clearable" clearable={false} />
    </ExampleItemsCol>
  );
}

export function Multiple() {
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (value: FileInputValue) => {
    setFiles(Array.isArray(value) ? value : value ? [value] : []);
  };

  return (
    <ExampleItemsCol style={{ alignItems: 'stretch' }}>
      <FileInput
        multiple
        maxFiles={3}
        label="Attachments"
        ariaLabel="Attachments"
        accept=".pdf,.png,.jpg"
        buttonLabel="Add files"
        placeholder="No files selected"
        value={files}
        onChange={handleChange}
      />
      <FileInput multiple label="Unlimited attachments" ariaLabel="Unlimited attachments" />
    </ExampleItemsCol>
  );
}
