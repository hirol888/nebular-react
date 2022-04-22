import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody } from '@nebular-react';

const ActionBadge: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <NbActions size="medium">
          <NbAction icon="search-outline" badgeText="99+" badgeStatus="danger"></NbAction>
          <NbAction icon="power-outline" badgeText="12" badgePosition="bottom right" badgeStatus="warning"></NbAction>
          <NbAction icon="person-outline" badgeText="M" badgePosition="top right" badgeStatus="info"></NbAction>
        </NbActions>
      </NbCardBody>
    </NbCard>
  );
};

export { ActionBadge };
