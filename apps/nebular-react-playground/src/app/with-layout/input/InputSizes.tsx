import { NbCard, NbCardBody, NbInput } from '@nebular-react';
import React from 'react';

const InputSizes: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbInput type="text" fullWidth fieldSize="tiny" placeholder="Tiny" />
        <NbInput type="text" fullWidth fieldSize="small" placeholder="Small" />
        <NbInput type="text" fullWidth fieldSize="medium" placeholder="Medium" />
        <NbInput type="text" fullWidth fieldSize="large" placeholder="Large" />
        <NbInput type="text" fullWidth fieldSize="giant" placeholder="Giant" />
      </NbCardBody>
    </NbCard>
  );
};

export { InputSizes };
