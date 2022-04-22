import { NbCard, NbCardBody, NbInput } from '@nebular-react';
import React from 'react';

// TODO
const InputForm: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbInput type="text" fullWidth fieldSize="small" placeholder="Input" />
        <NbInput type="text" placeholder="Disabled Text field" disabled />
      </NbCardBody>
    </NbCard>
  );
};

export { InputForm };
