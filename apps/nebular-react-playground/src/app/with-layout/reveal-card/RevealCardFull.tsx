import { NbCard, NbCardBack, NbCardBody, NbCardFooter, NbCardFront, NbCardHeader, NbRevealCard } from '@nebular-react';

export function RevealCardFull() {
  return (
    <NbRevealCard>
      <NbCardFront>
        <NbCard>
          <NbCardHeader>Nebula</NbCardHeader>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
          <NbCardFooter>By Wikipedia</NbCardFooter>
        </NbCard>
      </NbCardFront>
      <NbCardBack>
        <NbCard>
          <NbCardHeader>Nebula</NbCardHeader>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
          <NbCardFooter>By Wikipedia</NbCardFooter>
        </NbCard>
      </NbCardBack>
    </NbRevealCard>
  );
}
