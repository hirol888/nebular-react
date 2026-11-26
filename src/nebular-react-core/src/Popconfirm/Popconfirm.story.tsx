import React, { useState } from 'react';
import { Button } from '../Button';
import { Popconfirm } from './Popconfirm';

export default { title: 'Popconfirm', component: Popconfirm };

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
  padding: '8rem'
};

export function Showcase() {
  const [status, setStatus] = useState<string>('No action yet');

  return (
    <div style={containerStyle}>
      <Popconfirm
        title="Delete record"
        message="This action cannot be undone."
        onConfirm={() => setStatus('Record deleted')}
        onCancel={() => setStatus('Delete cancelled')}
      >
        <Button status="danger">Delete record</Button>
      </Popconfirm>
      <Popconfirm
        position="bottom"
        message="Archive this record?"
        confirmLabel="Archive"
        onConfirm={() => setStatus('Record archived')}
      >
        <Button>Archive record</Button>
      </Popconfirm>
      <span>{status}</span>
    </div>
  );
}

export function Controlled() {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <div style={containerStyle}>
      <Popconfirm
        opened={opened}
        onOpenChange={setOpened}
        title="Publish changes"
        message="The current draft will become visible to everyone."
        confirmLabel="Publish"
        onConfirm={() => setOpened(false)}
        onCancel={() => setOpened(false)}
      >
        <Button status="primary">Publish draft</Button>
      </Popconfirm>
      <Button appearance="ghost" onClick={() => setOpened(!opened)}>
        Toggle confirmation
      </Button>
    </div>
  );
}
