import { NbButtonGroup, NbButtonToggle, NbCard, NbCardBody } from '@nebular-react';
import React from 'react';

const ButtonGroupMultiple: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <NbButtonGroup multiple status="primary">
          <NbButtonToggle id="fa" pressed>
            A
          </NbButtonToggle>
          <NbButtonToggle id="fb" pressed>
            B
          </NbButtonToggle>
          <NbButtonToggle id="fc">C</NbButtonToggle>
        </NbButtonGroup>
      </NbCardBody>
    </NbCard>
  );
};

export { ButtonGroupMultiple };
