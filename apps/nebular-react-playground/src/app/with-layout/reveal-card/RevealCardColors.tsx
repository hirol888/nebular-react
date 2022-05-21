import { NbCard, NbCardBack, NbCardBody, NbCardFront, NbCardHeader, NbRevealCard } from '@nebular-react';

export function RevealCardColors() {
  return (
    <NbRevealCard>
      <NbCardFront>
        <NbCard status="success">
          <NbCardHeader>Front Card Header</NbCardHeader>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
        </NbCard>
      </NbCardFront>
      <NbCardBack>
        <NbCard status="danger">
          <NbCardHeader>Back Card Header</NbCardHeader>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
        </NbCard>
      </NbCardBack>
    </NbRevealCard>
  );
}
