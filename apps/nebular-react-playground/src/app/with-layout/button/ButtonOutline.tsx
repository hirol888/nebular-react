import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonOutline: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Outline</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton appearance="outline" status="primary">
          primary
        </NbButton>
        <NbButton appearance="outline" status="success">
          success
        </NbButton>
        <NbButton appearance="outline" status="info">
          info
        </NbButton>
        <NbButton appearance="outline" status="warning">
          warning
        </NbButton>
        <NbButton appearance="outline" status="danger">
          danger
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonOutline };
