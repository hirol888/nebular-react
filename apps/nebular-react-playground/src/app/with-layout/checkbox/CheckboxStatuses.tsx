import React from 'react';
import { NbCard, NbCardBody, NbCheckbox } from '@nebular-react';

const CheckboxStatuses: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbCheckbox status="basic">Basic</NbCheckbox>
        <NbCheckbox status="primary">Primary</NbCheckbox>
        <NbCheckbox status="success">Success</NbCheckbox>
        <NbCheckbox status="danger">Danger</NbCheckbox>
        <NbCheckbox status="warning">Warning</NbCheckbox>
        <NbCheckbox status="info">Info</NbCheckbox>
        <div className="control-status-example">
          <NbCheckbox status="control">Control</NbCheckbox>
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { CheckboxStatuses };
