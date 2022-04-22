import React from 'react';
import { NbCard, NbCardBody, NbIcon } from '@nebular-react';

const IconShowcase: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbIcon icon="heart-outline"></NbIcon>
        <NbIcon icon="star"></NbIcon>
      </NbCardBody>
    </NbCard>
  );
};

export { IconShowcase };
