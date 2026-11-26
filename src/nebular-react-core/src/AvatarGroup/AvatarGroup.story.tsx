import React from 'react';
import { Card } from '../Card';
import { User } from '../User';
import { AvatarGroup } from './AvatarGroup';

export default { title: 'AvatarGroup', component: AvatarGroup };

const members = ['John Doe', 'Jane Smith', 'Mike Ross', 'Ana Silva', 'Ravi Patel', 'Emma Stone'];

function avatar(name: string) {
  return <User key={name} name={name} size="large" showName={false} showTitle={false} />;
}

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        <AvatarGroup>{members.slice(0, 4).map(avatar)}</AvatarGroup>
      </Card.Body>
    </Card>
  );
}

export function Max() {
  return (
    <>
      <Card>
        <Card.Body>
          <p>Max 2 visible avatars, remaining counted from the children</p>
          <AvatarGroup max={2}>{members.map(avatar)}</AvatarGroup>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p>Max 3 visible avatars, remaining counted from total</p>
          <AvatarGroup max={3} total={24}>
            {members.slice(0, 5).map(avatar)}
          </AvatarGroup>
        </Card.Body>
      </Card>
    </>
  );
}

export function CustomMore() {
  return (
    <Card>
      <Card.Body>
        <AvatarGroup max={3} total={20} renderMore={(count) => <span>{count} more</span>}>
          {members.map(avatar)}
        </AvatarGroup>
      </Card.Body>
    </Card>
  );
}
