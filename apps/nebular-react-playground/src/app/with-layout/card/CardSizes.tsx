import React from 'react';
import { NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const CardSizes: React.FC = () => {
  return (
    <>
      <NbCard size="small">
        <NbCardHeader>Small card</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
      </NbCard>

      <NbCard size="large">
        <NbCardHeader>Large card</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
      </NbCard>
    </>
  );
};

export default CardSizes;
