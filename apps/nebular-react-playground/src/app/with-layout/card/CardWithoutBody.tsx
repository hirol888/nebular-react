import React from 'react';
import { NbCard, NbCardBody, NbCardFooter, NbCardHeader } from '@nebular-react';

const CardWithoutBody: React.FC = () => {
  // TODO: need list component
  return (
    <NbCard size="medium">
      <NbCardHeader>List</NbCardHeader>
    </NbCard>
  );
};

export default CardWithoutBody;
