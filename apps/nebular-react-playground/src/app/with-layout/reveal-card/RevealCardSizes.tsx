import { NbCard, NbCardBack, NbCardBody, NbCardFront, NbCardHeader, NbRevealCard } from '@nebular-react';

export function RevealCardSizes() {
  return (
    <>
      <NbRevealCard>
        <NbCardFront>
          <NbCard size="tiny">
            <NbCardHeader>Front Card Header</NbCardHeader>
            <NbCardBody>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula
              was a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
            </NbCardBody>
          </NbCard>
        </NbCardFront>
        <NbCardBack>
          <NbCard size="tiny">
            <NbCardHeader>Back Card Header</NbCardHeader>
            <NbCardBody>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula
              was a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
            </NbCardBody>
          </NbCard>
        </NbCardBack>
      </NbRevealCard>
      <NbRevealCard>
        <NbCardFront>
          <NbCard size="large">
            <NbCardHeader>Front Card Header</NbCardHeader>
            <NbCardBody>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula
              was a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
            </NbCardBody>
          </NbCard>
        </NbCardFront>
        <NbCardBack>
          <NbCard size="large">
            <NbCardHeader>Back Card Header</NbCardHeader>
            <NbCardBody>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula
              was a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
            </NbCardBody>
          </NbCard>
        </NbCardBack>
      </NbRevealCard>
    </>
  );
}
