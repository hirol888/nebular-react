import React from 'react';
import { NbCard, NbCardBody, NbAlert } from '@nebular-react';
import './alert-example.scoped.scss';

const AlertOutline: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-last-child-no-b-margin">
        <NbAlert outline="basic">Primary. You have been successfully authenticated!</NbAlert>
        <NbAlert outline="primary">Primary. You have been successfully authenticated!</NbAlert>
        <NbAlert outline="success">Success. You have been successfully authenticated!</NbAlert>
        <NbAlert outline="info">Info. You have been successfully authenticated!</NbAlert>
        <NbAlert outline="danger">Danger. You have been successfully authenticated!</NbAlert>
        <NbAlert outline="warning">Warning. You have been successfully authenticated!</NbAlert>
        <div className="control-status-example">
          <NbAlert outline="control">Control. You have been successfully authenticated!</NbAlert>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { AlertOutline };
