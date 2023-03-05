import React, { useState } from 'react';
import { Accordion } from './Accordion';

export default { title: 'Accrodion' };

export function Showcase() {
  return (
    <Accordion>
      <Accordion.Item
        value="Product Details"
        header={<Accordion.Item.Header>Product Details</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Reviews"
        header={<Accordion.Item.Header>Reviews</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Edit"
        disabled
        header={<Accordion.Item.Header>Edit</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
    </Accordion>
  );
}

export function Multiple() {
  return (
    <Accordion<true> multiple expanded={['Product Details']}>
      <Accordion.Item
        value="Product Details"
        header={<Accordion.Item.Header>Product Details</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            111A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Reviews"
        header={<Accordion.Item.Header>Reviews</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Edit"
        header={<Accordion.Item.Header>Edit</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
    </Accordion>
  );
}

export function Controlled() {
  const [expanded, setExpanded] = useState<string[]>(['Product Details']);

  return (
    <Accordion<true>
      multiple
      expanded={expanded}
      onChange={(openedItems) => setExpanded(openedItems)}
    >
      <Accordion.Item
        value="Product Details"
        header={<Accordion.Item.Header>Product Details</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            111A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Reviews"
        header={<Accordion.Item.Header>Reviews</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
      <Accordion.Item
        value="Edit"
        header={<Accordion.Item.Header>Edit</Accordion.Item.Header>}
        body={
          <Accordion.Item.Body>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.
            Originally, nebula was a name for any diffuse astronomical object, including galaxies
            beyond the Milky Way.
          </Accordion.Item.Body>
        }
      />
    </Accordion>
  );
}
