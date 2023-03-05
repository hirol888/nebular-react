import React, { useState } from 'react';
import { Card } from '../Card';
import { Sidebar } from '../Sidebar';
import { Layout } from '../Layout';
import { Search } from './Search';

export default { title: 'Search' };

export function Showcase() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="rotate-layout" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ColumnCurtain() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="column-curtain" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function Curtain() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="curtain" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ModalDrop() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="modal-drop" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ModalHalf() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="modal-half" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ModalMove() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="modal-move" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function ModalZoomin() {
  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="modal-zoomin" />
        </Layout.Header>
      }
      sidebars={<Sidebar>Sidebar</Sidebar>}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>Interstellar Cloud</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}

export function Event() {
  const [value, setValue] = useState<string>();

  return (
    <Layout
      header={
        <Layout.Header fixed>
          <Search type="rotate-layout" onSearch={(term) => setValue(term)} />
        </Layout.Header>
      }
      sidebars={<Sidebar />}
      columns={
        <Layout.Column>
          <Card accent="info">
            <Card.Header>You searched for:</Card.Header>
            <Card.Body>
              <h3>{value || '-'}</h3>
            </Card.Body>
          </Card>
        </Layout.Column>
      }
      styles={{
        layout: {
          minHeight: 'calc(var(--layout-min-height) - 2rem)'
        },
        layoutContainer: {
          minHeight: 'calc(var(--layout-min-height) - var(--header-height) - 2rem) !important'
        }
      }}
    />
  );
}
