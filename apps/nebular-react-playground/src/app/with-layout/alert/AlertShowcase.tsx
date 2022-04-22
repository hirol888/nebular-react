import React from 'react';
import { NbCard, NbCardBody, NbAlert } from '@nebular-react';

const AlertShowcase: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-last-child-no-b-margin">
        <NbAlert status="success" closable>
          You have been successfully authenticated!
        </NbAlert>
      </NbCardBody>
    </NbCard>
  );
};

export { AlertShowcase };
