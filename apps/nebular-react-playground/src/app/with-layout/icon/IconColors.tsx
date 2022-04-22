import React from 'react';
import { NbCard, NbCardBody, NbIcon } from '@nebular-react';
import './IconColors.scoped.scss';

const IconColors: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbIcon icon="heart-outline"></NbIcon>
        <NbIcon icon="heart-outline" status="basic"></NbIcon>
        <NbIcon icon="heart-outline" status="primary"></NbIcon>
        <NbIcon icon="heart-outline" status="info"></NbIcon>
        <NbIcon icon="heart-outline" status="success"></NbIcon>
        <NbIcon icon="heart-outline" status="warning"></NbIcon>
        <NbIcon icon="heart-outline" status="danger"></NbIcon>
        <div className="control-status-example">
          <NbIcon icon="heart-outline" status="control"></NbIcon>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { IconColors };
