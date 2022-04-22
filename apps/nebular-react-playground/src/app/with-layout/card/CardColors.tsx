import React from 'react';
import { NbCard, NbCardBody, NbCardFooter, NbCardHeader } from '@nebular-react';

const CardColors: React.FC = () => {
  return (
    <>
      <NbCard status="success">
        <NbCardHeader>Nebula</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
        <NbCardFooter>By Wikipedia</NbCardFooter>
      </NbCard>

      <NbCard status="danger">
        <NbCardHeader>Nebula</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
        <NbCardFooter>By Wikipedia</NbCardFooter>
      </NbCard>
    </>
  );
};

export default CardColors;
