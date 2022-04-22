import React from 'react';
import { NbAction, NbActions, NbCard, NbCardBody, NbComponentSize } from '@nebular-react';

const ActionSizes: React.FC = () => {
  const sizes: NbComponentSize[] = ['tiny', 'small', 'medium', 'large', 'giant'];

  return (
    <>
      {sizes.map((size) => {
        return (
          <NbCard>
            <NbCardBody>
              <NbActions size={size}>
                <NbAction icon="search-outline"></NbAction>
                <NbAction icon="power-outline"></NbAction>
                <NbAction icon="person-outline"></NbAction>
                <NbAction icon="home-outline"></NbAction>
                <NbAction>Some Action</NbAction>
              </NbActions>
            </NbCardBody>
          </NbCard>
        );
      })}
    </>
  );
};

export { ActionSizes };
