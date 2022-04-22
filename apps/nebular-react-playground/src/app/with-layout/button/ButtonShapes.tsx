import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonShapes: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Shapes</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton shape="rectangle" status="primary">
          Rectangle Primary
        </NbButton>
        <NbButton shape="semi-round" status="info">
          Semi-round Info
        </NbButton>
        <NbButton shape="round" size="small" status="success">
          Round Small Success
        </NbButton>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonShapes };
