import React, { useState } from 'react';
import { Button } from '../Button';
import { HoverCard } from './HoverCard';

export default { title: 'HoverCard', component: HoverCard };

const profiles = [
  {
    id: 'alice',
    name: 'Alice Johnson',
    role: 'Administrator',
    email: 'alice@example.com'
  },
  {
    id: 'bruno',
    name: 'Bruno Costa',
    role: 'Editor',
    email: 'bruno@example.com'
  }
];

export function Showcase() {
  const [previewedId, setPreviewedId] = useState('alice');
  const previewed = profiles.find((profile) => profile.id === previewedId) ?? profiles[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {profiles.map((profile) => (
          <HoverCard
            key={profile.id}
            ariaLabel={`Profile of ${profile.name}`}
            content={
              <div>
                <strong>{profile.name}</strong>
                <div>
                  {profile.role} - {profile.email}
                </div>
              </div>
            }
          >
            <Button
              appearance="ghost"
              onMouseEnter={() => setPreviewedId(profile.id)}
              onFocus={() => setPreviewedId(profile.id)}
            >
              {profile.name}
            </Button>
          </HoverCard>
        ))}
      </div>
      <span>Last previewed profile: {previewed.name}</span>
    </div>
  );
}

export function Positions() {
  const positions = ['top', 'bottom', 'left', 'right'] as const;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4rem',
        padding: '4rem 2rem'
      }}
    >
      {positions.map((position) => (
        <HoverCard
          key={position}
          position={position}
          width={200}
          openDelay={0}
          closeDelay={0}
          ariaLabel={`${position} hover card`}
          content={<div>The card opens on the {position} side of the trigger.</div>}
        >
          <Button appearance="outline">Hover ({position})</Button>
        </HoverCard>
      ))}
    </div>
  );
}
