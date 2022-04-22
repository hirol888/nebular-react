import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody, NbIconConfig } from '@nebular-react';

const ActionShowcase: React.FC = () => {
  const disabledIconConfig: NbIconConfig = {
    icon: 'settings-2-outline',
    pack: 'eva'
  };

  return (
    <NbCard>
      <NbCardBody>
        <NbActions size="medium">
          <NbAction icon="search-outline"></NbAction>
          <NbAction icon="power-outline"></NbAction>
          <NbAction icon="person-outline"></NbAction>
          <NbAction icon="home-outline"></NbAction>
          <NbAction icon={disabledIconConfig} disabled></NbAction>
          <NbAction>Custom Action</NbAction>
        </NbActions>
      </NbCardBody>
    </NbCard>
  );
};

export { ActionShowcase };
