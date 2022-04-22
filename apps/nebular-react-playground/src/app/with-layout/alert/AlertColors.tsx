import React from 'react';
import { NbCard, NbCardBody, NbAlert } from '@nebular-react';
import './alert-example.scoped.scss';

const AlertColors: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-last-child-no-b-margin">
        <NbAlert status="basic">Basic. You have been successfully authenticated!</NbAlert>
        <NbAlert status="primary">Primary. You have been successfully authenticated!</NbAlert>
        <NbAlert status="success">Success. You have been successfully authenticated!</NbAlert>
        <NbAlert status="info">Info. You have been successfully authenticated!</NbAlert>
        <NbAlert status="danger">Danger. You have been successfully authenticated!</NbAlert>
        <NbAlert status="warning">Warning. You have been successfully authenticated!</NbAlert>
        <div className="control-status-example">
          <NbAlert status="control">Control. You have been successfully authenticated!</NbAlert>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { AlertColors };
