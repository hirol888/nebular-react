import { NbCard, NbCardBody, NbInput } from '@nebular-react';
import React from 'react';

const InputShowcase: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbInput type="text" placeholder="Text field" />
        <NbInput type="text" placeholder="Disabled Text field" disabled />
      </NbCardBody>
    </NbCard>
  );
};

export { InputShowcase };
