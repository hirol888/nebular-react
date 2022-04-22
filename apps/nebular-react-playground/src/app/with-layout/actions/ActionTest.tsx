import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody, NbLayout, NbLayoutHeader, NbLayoutColumn } from '@nebular-react';

const ActionTest: React.FC = () => {
  const actionOnClick = (event: string) => {
    console.info(event);
  };

  // TODO: 1. NbUser, 2. NbLayoutHeader not displayed
  return (
    <NbLayout>
      <NbLayoutHeader>
        <NbActions>
          <NbAction icon="search-outline" onClick={() => actionOnClick('first')}></NbAction>
          <NbAction icon="search-outline"></NbAction>
          <NbAction>{/* <nb-user></nb-user> */}</NbAction>
          <NbAction icon="search-outline"></NbAction>
          <NbAction icon="search-outline"></NbAction>
          <NbAction icon="search-outline" disabled></NbAction>
          <NbAction>Hello</NbAction>
        </NbActions>
      </NbLayoutHeader>
      <NbLayoutColumn>
        <NbCard>
          <NbCardBody>
            <NbActions>
              <NbAction icon="search-outline" onClick={() => actionOnClick('first')}></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction>{/* <nb-user></nb-user> */}</NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline" disabled></NbAction>
              <NbAction>Hello</NbAction>
            </NbActions>
          </NbCardBody>
        </NbCard>

        <NbCard>
          <NbCardBody>
            <NbActions size="medium">
              <NbAction icon="search-outline" onClick={() => actionOnClick('first')}></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction>{/* <nb-user></nb-user> */}</NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline" disabled></NbAction>
              <NbAction>Hello</NbAction>
            </NbActions>
          </NbCardBody>
        </NbCard>

        <NbCard>
          <NbCardBody>
            <NbActions size="large">
              <NbAction icon="search-outline" onClick={() => actionOnClick('first')}></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction>{/* <nb-user></nb-user> */}</NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline"></NbAction>
              <NbAction icon="search-outline" disabled></NbAction>
              <NbAction>Hello</NbAction>
            </NbActions>
          </NbCardBody>
        </NbCard>

        <NbCard>
          <NbCardBody>
            <NbActions size="large">
              <NbAction badgeText="29" badgeStatus="success" badgePosition="bottom left">
                {/* <nb-user></nb-user> */}
              </NbAction>
              <NbAction badgeText="29" badgeStatus="danger" badgePosition="top left" icon="search-outline"></NbAction>
              <NbAction
                badgeText="29"
                badgeStatus="warning"
                badgePosition="bottom right"
                icon="search-outline"
              ></NbAction>
              <NbAction
                badgeText="29"
                badgeStatus="success"
                badgePosition="bottom left"
                icon="search-outline"
              ></NbAction>
              <NbAction badgeText="29" badgeStatus="info" badgePosition="top right" icon="search-outline"></NbAction>
              <NbAction
                badgeText="29"
                badgeStatus="info"
                badgePosition="top right"
                icon="search-outline"
                disabled
              ></NbAction>
              <NbAction badgeText="29">Badge</NbAction>
            </NbActions>
          </NbCardBody>
        </NbCard>
      </NbLayoutColumn>
    </NbLayout>
  );
};

export { ActionTest };
