import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonHero: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Hero</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton appearance="hero" status="primary">
          primary
        </NbButton>
        <NbButton appearance="hero" status="success">
          success
        </NbButton>
        <NbButton appearance="hero" status="info">
          info
        </NbButton>
        <NbButton appearance="hero" status="warning">
          warning
        </NbButton>
        <NbButton appearance="hero" status="danger">
          danger
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonHero };
