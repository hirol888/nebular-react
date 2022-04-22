import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody } from '@nebular-react';

const ActionDotMode: React.FC = () => {
  return (
    <NbCard>
      <NbCardBody>
        <NbActions size="medium">
          <NbAction icon="bell-outline" badgeDot badgePosition="top right" badgeStatus="danger"></NbAction>
          <NbAction icon="person-outline" badgeDot badgePosition="top start" badgeStatus="warning"></NbAction>
          <NbAction icon="email-outline" badgeDot badgePosition="top left" badgeStatus="danger"></NbAction>
          <NbAction icon="calendar-outline" badgeDot badgePosition="top right" badgeStatus="info"></NbAction>
        </NbActions>
      </NbCardBody>
    </NbCard>
  );
};

export { ActionDotMode };
