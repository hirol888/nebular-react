import { NbCard, NbCardBack, NbCardBody, NbCardFooter, NbCardFront, NbCardHeader, NbFlipCard } from '@nebular-react';

export function FlipCardFull() {
  return (
    <NbFlipCard>
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
    </NbFlipCard>
  );
}
