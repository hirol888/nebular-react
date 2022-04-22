import { NbCard, NbCardBody, NbInput } from '@nebular-react';
import React from 'react';
import './input-colors.scoped.scss';

const InputColors: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbInput type="text" fullWidth status="basic" placeholder="Default" />
        <NbInput type="text" fullWidth status="primary" placeholder="Primary" />
        <NbInput type="text" fullWidth status="info" placeholder="Info" />
        <NbInput type="text" fullWidth status="success" placeholder="Success" />
        <NbInput type="text" fullWidth status="warning" placeholder="Warning" />
        <NbInput type="text" fullWidth status="danger" placeholder="Danger" />
        <div className="control-status-example">
          <NbInput type="text" fullWidth status="control" placeholder="Control" />
        </div>
      </NbCardBody>
    </NbCard>
  );
};

export { InputColors };
