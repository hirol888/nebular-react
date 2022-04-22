import React from 'react';
import { NbAccordion, NbAccordionItem, NbAccordionItemBody, NbAccordionItemHeader } from '@nebular-react';

const AccordionShowcase: React.FC = () => {
  return (
    <NbAccordion>
      <NbAccordionItem id="item1">
        <NbAccordionItemHeader>Product Details</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>

      <NbAccordionItem id="item2">
        <NbAccordionItemHeader>Reviews</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>

      <NbAccordionItem id="item3" disabled>
        <NbAccordionItemHeader>Edit</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>
    </NbAccordion>
  );
};

export { AccordionShowcase };
