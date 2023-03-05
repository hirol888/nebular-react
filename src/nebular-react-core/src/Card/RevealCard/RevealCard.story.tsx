import React from 'react';
import { Card } from '../Card';
import { RevealCard } from './RevealCard';

export default { title: 'RevealCard' };

export function Showcase() {
  return (
    <RevealCard
      front={
        <Card accent="success">
          <Card.Header>Front Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      back={
        <Card accent="primary">
          <Card.Header>Back Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
    />
  );
}

export function Accent() {
  return (
    <RevealCard
      front={
        <Card accent="info" status="warning">
          <Card.Header>Front Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      back={
        <Card accent="primary" status="info">
          <Card.Header>Back Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
    />
  );
}

export function Color() {
  return (
    <RevealCard
      front={
        <Card status="success">
          <Card.Header>Front Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      back={
        <Card status="danger">
          <Card.Header>Back Card Header</Card.Header>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
    />
  );
}

export function Size() {
  return (
    <>
      <RevealCard
        front={
          <Card size="tiny">
            <Card.Header>Front Card Header</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        }
        back={
          <Card size="tiny">
            <Card.Header>Back Card Header</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        }
      />
      <RevealCard
        front={
          <Card size="large">
            <Card.Header>Front Card Header</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        }
        back={
          <Card size="large">
            <Card.Header>Back Card Header</Card.Header>
            <Card.Body>
              A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
              Originally, nebula was a name for any diffuse astronomical object, including galaxies
              beyond the Milky Way.
            </Card.Body>
          </Card>
        }
      />
    </>
  );
}
