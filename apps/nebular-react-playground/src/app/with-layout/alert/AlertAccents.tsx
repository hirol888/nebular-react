import React from 'react';
import { NbCard, NbCardBody, NbAlert } from '@nebular-react';
import './alert-example.scoped.scss';

const AlertAccents: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-last-child-no-b-margin">
        <NbAlert accent="basic">Basic. You have been successfully authenticated!</NbAlert>
        <NbAlert accent="primary">Primary. You have been successfully authenticated!</NbAlert>
        <NbAlert accent="success">Success. You have been successfully authenticated!</NbAlert>
        <NbAlert accent="info">Info. You have been successfully authenticated!</NbAlert>
        <NbAlert accent="warning">Warning. You have been successfully authenticated!</NbAlert>
        <NbAlert accent="danger">Danger. You have been successfully authenticated!</NbAlert>
        <div className="control-status-example">
          <NbAlert accent="control">Control. You have been successfully authenticated!</NbAlert>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { AlertAccents };
