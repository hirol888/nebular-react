import { NbCard, NbCardBack, NbCardBody, NbCardFront, NbFlipCard } from '@nebular-react';

export function FlipCardShowcase() {
  return (
    <NbFlipCard>
      <NbCardFront>
        <NbCard accent="danger">
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
        </NbCard>
      </NbCardFront>
      <NbCardBack>
        <NbCard>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
        </NbCard>
      </NbCardBack>
    </NbFlipCard>
  );
}
