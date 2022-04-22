import React from 'react';
import { NbAccordion, NbAccordionItem, NbAccordionItemBody, NbAccordionItemHeader } from '@nebular-react';

const AccordionTest: React.FC = () => {
  return (
    <NbAccordion>
      <NbAccordionItem id="item1">
        <NbAccordionItemHeader>Accordion #1</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>

      <NbAccordionItem id="item2">
        <NbAccordionItemHeader>Accordion #2</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>

      <NbAccordionItem id="item3" expanded>
        <NbAccordionItemHeader>Accordion #3</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>

      <NbAccordionItem id="item4" disabled>
        <NbAccordionItemHeader>Accordion #4</NbAccordionItemHeader>
        <NbAccordionItemBody>
          A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was a
          name for any diffuse astronomical object, including galaxies beyond the Milky Way.
        </NbAccordionItemBody>
      </NbAccordionItem>
    </NbAccordion>
  );
};

export { AccordionTest };
