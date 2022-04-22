import React from 'react';
import { NbCard, NbCardBody, NbCardFooter, NbCardHeader } from '@nebular-react';

const CardFull: React.FC = () => {
  return (
    <NbCard>
      <NbCardHeader>Nebular</NbCardHeader>
      <NbCardBody>
        A nebula is an interstellar cloud of dust, hydrogen, helium and other
        ionized gases. Originally, nebula was a name for any diffuse
        astronomical object, including galaxies beyond the Milky Way.
      </NbCardBody>
      <NbCardFooter>By Wikipedia</NbCardFooter>
    </NbCard>
  );
};

export default CardFull;
