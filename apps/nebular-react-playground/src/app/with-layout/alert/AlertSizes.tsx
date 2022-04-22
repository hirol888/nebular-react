import React from 'react';
import { NbCard, NbCardBody, NbAlert } from '@nebular-react';

const AlertSizes: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-last-child-no-b-margin">
        <NbAlert status="primary" size="tiny">
          Tiny. You have been successfully authenticated!
        </NbAlert>
        <NbAlert status="primary" size="small">
          Small. You have been successfully authenticated!
        </NbAlert>
        <NbAlert status="primary" size="medium">
          Medium. You have been successfully authenticated!
        </NbAlert>
        <NbAlert status="primary" size="large">
          Large. You have been successfully authenticated!
        </NbAlert>
        <NbAlert status="primary" size="giant">
          Giant. You have been successfully authenticated!
        </NbAlert>
      </NbCardBody>
    </NbCard>
  );
};

export { AlertSizes };
