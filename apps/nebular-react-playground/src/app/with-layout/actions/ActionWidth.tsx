import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody } from '@nebular-react';

const ActionWidth: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <NbActions size="small" fullWidth>
          <NbAction icon="search-outline"></NbAction>
          <NbAction icon="power-outline"></NbAction>
        </NbActions>
      </NbCardBody>
    </NbCard>
  );
};

export { ActionWidth };
