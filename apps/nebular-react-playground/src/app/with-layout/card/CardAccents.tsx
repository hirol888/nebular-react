import React from 'react';
import { NbCard, NbCardBody, NbCardHeader } from '@nebular-react';

const CardAccents: React.FC = () => {
  return (
    <>
      <NbCard accent="info">
        <NbCardHeader>Nebula</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
      </NbCard>

      <NbCard accent="danger">
        <NbCardHeader>Nebula</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
      </NbCard>

      <NbCard accent="primary" status="warning">
        <NbCardHeader>Nebula</NbCardHeader>
        <NbCardBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other
          ionized gases. Originally, nebula was a name for any diffuse
          astronomical object, including galaxies beyond the Milky Way.
        </NbCardBody>
      </NbCard>
    </>
  );
};

export default CardAccents;
