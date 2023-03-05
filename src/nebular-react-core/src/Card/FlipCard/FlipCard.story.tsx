import React from 'react';
import { Icon } from '../../Icon';
import { Card } from '../Card';
import { FlipCard } from './FlipCard';

export default { title: 'FlipCard' };

export function Showcase() {
  return (
    <FlipCard
      front={
        <Card accent="danger">
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      back={
        <Card>
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
    <FlipCard
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
    <FlipCard
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
      <FlipCard
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
      <FlipCard
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

export function CustomToggleButton() {
  return (
    <FlipCard
      front={
        <Card accent="danger">
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      back={
        <Card>
          <Card.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Card.Body>
        </Card>
      }
      customToggleButton={<Icon icon="chevron-right-outline" pack="nebular-essentials" />}
    />
  );
}
