import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonShowcase: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton>Active</NbButton>
        <NbButton disabled>Disabled</NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonShowcase };
