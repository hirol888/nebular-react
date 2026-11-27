import React, { useState } from 'react';
import { Button } from '../Button';
import { Modal } from './Modal';

export default { title: 'Modal', component: Modal };

export function Showcase() {
  const [opened, setOpened] = useState<boolean>(false);
  const [accepted, setAccepted] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open modal</Button>
      <span style={{ marginLeft: '0.5rem' }}>
        {accepted ? 'Terms accepted' : 'Terms not accepted yet'}
      </span>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Terms of service"
        ariaLabel="Terms of service"
      >
        <p style={{ margin: 0 }}>
          By continuing you agree to the terms of service and the privacy policy of this
          application.
        </p>
        <p style={{ marginBottom: 0 }}>
          Use the close button, press Escape, or click outside the dialog to dismiss it.
        </p>
        <Button
          onClick={() => {
            setAccepted(true);
            setOpened(false);
          }}
        >
          Accept terms
        </Button>
      </Modal>
    </>
  );
}

export function WithFooter() {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <>
      <Button status="primary" onClick={() => setOpened(true)}>
        Edit profile
      </Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Edit profile"
        footer={
          <>
            <Button appearance="ghost" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button status="primary" onClick={() => setOpened(false)}>
              Save changes
            </Button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Update your display name and contact details before saving the changes.
        </p>
      </Modal>
    </>
  );
}

export function Centered() {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setOpened(true)}>Open centered modal</Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Centered modal"
        centered
        size={560}
      >
        <p style={{ margin: 0 }}>
          This dialog is vertically centered and constrained to a custom size. It uses CSS variables
          such as --modal-background-color and --modal-backdrop-color.
        </p>
      </Modal>
    </>
  );
}
