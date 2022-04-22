import React from 'react';
import { NbButton, NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const ButtonColors: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Button Colors</NbCardHeader>
      <NbCardBody className="example-items-rows">
        <NbButton status="basic">basic</NbButton>
        <NbButton status="primary">primary</NbButton>
        <NbButton status="success">success</NbButton>
        <NbButton status="info">info</NbButton>
        <NbButton status="warning">warning</NbButton>
        <NbButton status="danger">danger</NbButton>
        <div className="control-status-example">
          <NbButton status="control">control</NbButton>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonColors };
