import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader, NbIcon } from '@nebular-react';

const ButtonIcon: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Icon</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton status="primary">
          <NbIcon icon="star"></NbIcon>
          primary
        </NbButton>
        <NbButton status="success">
          success
          <NbIcon icon="star"></NbIcon>
        </NbButton>
        <NbButton status="danger">
          <NbIcon icon="star"></NbIcon>
        </NbButton>
        <NbButton status="danger" appearance="ghost">
          <NbIcon icon="star"></NbIcon>
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonIcon };
