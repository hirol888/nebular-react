import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonFull: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Full Width</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton fullWidth={true} status="primary">
          primary
        </NbButton>
        <NbButton fullWidth={true} status="success">
          success
        </NbButton>
        <NbButton fullWidth={true} status="info">
          info
        </NbButton>
        <NbButton fullWidth={true} status="warning">
          warning
        </NbButton>
        <NbButton fullWidth={true} status="danger">
          danger
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonFull };
