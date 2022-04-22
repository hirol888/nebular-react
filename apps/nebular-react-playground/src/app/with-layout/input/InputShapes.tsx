import { NbCard, NbCardBody, NbInput } from '@nebular-react';
import React from 'react';

const InputShapes: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbInput type="text" fullWidth shape="rectangle" placeholder="Rectangle" />
        <NbInput type="text" fullWidth shape="semi-round" placeholder="Semi round" />
        <NbInput type="text" fullWidth shape="round" placeholder="Round" />
      </NbCardBody>
    </NbCard>
  );
};

export { InputShapes };
