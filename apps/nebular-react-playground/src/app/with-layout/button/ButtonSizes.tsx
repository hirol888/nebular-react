import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonSizes: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Sizes</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton size="tiny" status="primary">
          tiny
        </NbButton>
        <NbButton size="small" status="success">
          small
        </NbButton>
        <NbButton size="medium" status="info">
          medium
        </NbButton>
        <NbButton size="large" status="warning">
          large
        </NbButton>
        <NbButton size="giant" status="danger">
          giant
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonSizes };
