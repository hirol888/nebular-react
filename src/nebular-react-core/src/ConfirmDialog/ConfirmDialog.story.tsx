import React, { useState } from 'react';
import { Button } from '../Button';
import { ConfirmDialog } from './ConfirmDialog';

export default { title: 'ConfirmDialog', component: ConfirmDialog };

export function Showcase() {
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button status="danger" onClick={() => setOpened(true)}>
        Delete record
      </Button>
      <span>Result: {result}</span>
      <ConfirmDialog
        opened={opened}
        title="Delete record?"
        message="This action cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => {
          setResult('cancelled');
          setOpened(false);
        }}
        onConfirm={() => {
          setResult('confirmed');
          setOpened(false);
        }}
      />
    </div>
  );
}

export function Loading() {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button onClick={() => setOpened(true)}>Save changes</Button>
      <ConfirmDialog
        opened={opened}
        title="Save changes?"
        message="The dialog stays open while the request is in progress."
        loading
        confirmLabel="Saving"
        onCancel={() => setOpened(false)}
        onConfirm={() => undefined}
      />
    </div>
  );
}

export function CustomLabels() {
  const [opened, setOpened] = useState(false);
  const [result, setResult] = useState('none');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Button status="warning" onClick={() => setOpened(true)}>
        Archive project
      </Button>
      <span>Result: {result}</span>
      <ConfirmDialog
        opened={opened}
        title="Archive project"
        message="Archived projects can be restored later from the settings page."
        confirmLabel="Archive project"
        cancelLabel="Keep project"
        onCancel={() => {
          setResult('kept');
          setOpened(false);
        }}
        onConfirm={() => {
          setResult('archived');
          setOpened(false);
        }}
      />
    </div>
  );
}
