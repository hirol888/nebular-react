import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';

const ButtonGroupDisabled: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <NbButtonGroup disabled>
          <NbButtonToggle id="fa">A</NbButtonToggle>
          <NbButtonToggle id="fb">B</NbButtonToggle>
          <NbButtonToggle id="fc">C</NbButtonToggle>
        </NbButtonGroup>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupDisabled };
