import React, { useRef } from 'react';
import { Menu, MenuItem } from '../Menu';
import { Button } from '../Button';
import { Card } from '../Card';
import { ContextMenu } from './ContextMenu';
import { ExampleItemsRows } from '../Shared';

export default { title: 'ContextMenu' };

export function Showcase() {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Card>
      <Card.Body>
        <Button appearance="outline" ref={triggerRef}>
          Show menu
        </Button>
        <ContextMenu triggerRef={triggerRef}>
          <Menu>
            <MenuItem id="Profile" title="Profile" />
            <MenuItem id="Logout" title="Logout" />
          </Menu>
        </ContextMenu>
      </Card.Body>
    </Card>
  );
}

export function Modes() {
  const clickTriggerRef = useRef<HTMLButtonElement>(null);
  const focusTriggerRef = useRef<HTMLButtonElement>(null);
  const hoverTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <Card>
      <Card.Body>
        <ExampleItemsRows>
          <Button ref={clickTriggerRef}>Click Mode</Button>
          <ContextMenu triggerRef={clickTriggerRef}>
            <Menu>
              <MenuItem id="Profile" title="Profile" />
              <MenuItem id="Logout" title="Logout" />
            </Menu>
          </ContextMenu>
          <Button ref={focusTriggerRef}>Focus (Tab) Mode</Button>
          <ContextMenu triggerRef={focusTriggerRef} triggerType="focus">
            <Menu>
              <MenuItem id="Profile" title="Profile" />
              <MenuItem id="Logout" title="Logout" />
            </Menu>
          </ContextMenu>
          <Button ref={hoverTriggerRef}>Hover Mode</Button>
          <ContextMenu triggerRef={hoverTriggerRef} triggerType="hover">
            <Menu>
              <MenuItem id="Profile" title="Profile" />
              <MenuItem id="Logout" title="Logout" />
            </Menu>
          </ContextMenu>
        </ExampleItemsRows>
      </Card.Body>
    </Card>
  );
}
