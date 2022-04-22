import React from 'react';
import { NbBadge, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const BadgeShowcase: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader style={{ position: 'relative' }}>
        <NbBadge text="new" status="success" position="top right"></NbBadge>
        <NbBadge text="99+" status="danger" position="top left"></NbBadge>
      </NbCardHeader>
      <NbCardBody>Card body.</NbCardBody>
    </NbCard>
  );
};

export { BadgeShowcase };
