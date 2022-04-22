import React from 'react';
import { NbCard, NbCardBody, NbCheckbox } from '@nebular-react';

const CheckboxDisabled: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody className="example-items-rows">
        <NbCheckbox disabled={true}>Disabled</NbCheckbox>
        <NbCheckbox checked={true} indeterminate={true} disabled={true}>
          Indeterminate disabled
        </NbCheckbox>
        <NbCheckbox checked={true} disabled={true}>
          Checked disabled
        </NbCheckbox>
      </NbCardBody>
    </NbCard>
  );
};

export { CheckboxDisabled };
