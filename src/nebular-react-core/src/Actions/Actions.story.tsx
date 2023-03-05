import React from 'react';
import { ComponentSize } from '@nebular-react/styles';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { Action } from './Action';
import { Actions } from './Actions';
import { Badge } from '../Badge';

export default { title: 'Actions' };

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <Actions size="medium">
          <Action icon={<Icon icon="search-outline" />}>Pause</Action>
          <Action icon={<Icon icon="power-outline" />} />
          <Action icon={<Icon icon="person-outline" />} />
          <Action
            component="a"
            href="https://www.google.com"
            disabled
            icon={<Icon icon="home-outline" />}
          />
          <Action disabled icon={<Icon icon="settings-2-outline" pack="eva" />} />
          <Action>Custom Action</Action>
        </Actions>
      </Card.Body>
    </Card>
  );
}

export function Badges() {
  return (
    <Card>
      <Card.Body>
        <Actions size="medium">
          <Action
            badge={<Badge text="99+" status="danger" />}
            icon={<Icon icon="search-outline" />}
          />
          <Action
            badge={<Badge text="12" status="warning" position="bottom right" />}
            icon={<Icon icon="power-outline" />}
          />
          <Action
            badge={<Badge text="M" status="info" position="top right" />}
            icon={<Icon icon="person-outline" />}
          />
        </Actions>
      </Card.Body>
    </Card>
  );
}

export function DotMode() {
  return (
    <Card>
      <Card.Body>
        <Actions size="medium">
          <Action
            badge={<Badge dotMode position="top right" status="danger" />}
            icon={<Icon icon="bell-outline" />}
          />
          <Action
            badge={<Badge dotMode position="top start" status="warning" />}
            icon={<Icon icon="person-outline" />}
          />
          <Action
            badge={<Badge dotMode position="top left" status="danger" />}
            icon={<Icon icon="email-outline" />}
          />
          <Action
            badge={<Badge dotMode position="top right" status="info" />}
            icon={<Icon icon="calendar-outline" />}
          />
        </Actions>
      </Card.Body>
    </Card>
  );
}

export function Size() {
  const sizes: ComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];

  return (
    <>
      {sizes.map((size) => (
        <Card key={size}>
          <Card.Body>
            <Actions fullWidth size={size}>
              <Action icon={<Icon icon="search-outline" />} />
              <Action icon={<Icon icon="power-outline" />} />
              <Action icon={<Icon icon="person-outline" />} />
              <Action icon={<Icon icon="home-outline" />} />
              <Action>Some Action</Action>
            </Actions>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}
