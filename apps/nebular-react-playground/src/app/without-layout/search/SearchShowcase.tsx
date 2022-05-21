import {
  NbCard,
  NbCardBody,
  NbCardHeader,
  NbLayout,
  NbLayoutColumn,
  NbLayoutHeader,
  NbSearch,
  NbSidebar
} from '@nebular-react';

export function SearchShowcase() {
  return (
    <NbLayout>
      <NbLayoutHeader fixed>
        <NbSearch type="rotate-layout"></NbSearch>
      </NbLayoutHeader>
      <NbSidebar>Sidebar</NbSidebar>
      <NbLayoutColumn className="colored-column-basic">
        <NbCard accent="info">
          <NbCardHeader>Interstellar Cloud</NbCardHeader>
          <NbCardBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbCardBody>
        </NbCard>
      </NbLayoutColumn>
    </NbLayout>
  );
}
