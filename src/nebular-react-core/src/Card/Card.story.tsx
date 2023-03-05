import React from 'react';
import { createStyles } from '@nebular-react/styles';
import { Card } from './Card';

export default { title: 'Card' };

function CardsContainer(props) {
  const { classes, cx } = createStyles(() => ({
    root: {
      display: 'block',
      maxHeight: '25rem',
      overflowX: 'hidden',
      overflowY: 'auto'
    }
  }))();

  return <div className={cx(classes.root)}>{props.children}</div>;
}

function CardRow(props) {
  const { classes, cx } = createStyles(() => ({
    root: {
      display: 'flex',
      margin: '0 -0.5rem'
    }
  }))();

  return <div className={cx(classes.root)}>{props.children}</div>;
}

function CardCol(props) {
  const { classes, cx } = createStyles(() => ({
    root: {
      flex: '1 0 calc(50% - 1rem)',
      margin: '0 0.5rem'
    }
  }))();

  return <div className={cx(classes.root)}>{props.children}</div>;
}

export function Showcase() {
  return (
    <Card>
      <Card.Body>
        A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
        Originally, nebula was a name for any diffuse astronomical object, including galaxies beyond
        the Milky Way.
      </Card.Body>
    </Card>
  );
}

export function Accent() {
  return (
    <>
      <Card accent="info">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
      </Card>
      <Card accent="danger">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
      </Card>
      <Card status="primary" accent="warning">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
      </Card>
    </>
  );
}

export function Color() {
  return (
    <>
      <Card status="success">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          {' '}
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
        <Card.Footer>By Wikipedia</Card.Footer>
      </Card>
      <Card status="warning">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
        <Card.Footer>By Wikipedia</Card.Footer>
      </Card>
      <Card status="danger">
        <Card.Header>Nebular</Card.Header>
        <Card.Body>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
          Originally, nebula was a name for any diffuse astronomical object, including galaxies
          beyond the Milky Way.
        </Card.Body>
        <Card.Footer>By Wikipedia</Card.Footer>
      </Card>
    </>
  );
}

export function SizeCombinations() {
  return (
    <CardsContainer>
      <CardRow>
        <CardCol>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
          <Card size="tiny">
            <Card.Header>Tiny Card</Card.Header>
          </Card>
        </CardCol>
        <CardCol>
          <Card size="medium">
            <Card.Header>Medium card</Card.Header>
          </Card>
        </CardCol>
      </CardRow>

      <CardRow>
        <CardCol>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
          <Card size="small">
            <Card.Header>Small card</Card.Header>
          </Card>
        </CardCol>
        <CardCol>
          <Card size="large">
            <Card.Header>Large card</Card.Header>
          </Card>
        </CardCol>
      </CardRow>

      <CardRow>
        <CardCol>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
          <Card size="medium">
            <Card.Header>Medium card</Card.Header>
          </Card>
        </CardCol>
        <CardCol>
          <Card size="giant">
            <Card.Header>Giant card</Card.Header>
          </Card>
        </CardCol>
      </CardRow>

      <CardRow>
        <CardCol>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
          <Card size="tiny">
            <Card.Header>Tiny card</Card.Header>
          </Card>
        </CardCol>
        <CardCol>
          <Card size="giant">
            <Card.Header>Giant card</Card.Header>
          </Card>
        </CardCol>
      </CardRow>

      <CardRow>
        <CardCol>
          <Card size="small">
            <Card.Header>Small card</Card.Header>
          </Card>
          <Card size="small">
            <Card.Header>Small card</Card.Header>
          </Card>
        </CardCol>
        <CardCol>
          <Card size="giant">
            <Card.Header>Giant card</Card.Header>
          </Card>
        </CardCol>
      </CardRow>
    </CardsContainer>
  );
}
