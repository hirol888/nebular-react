import React, { useRef } from 'react';
import {
  NbAccordion,
  NbAccordionItem,
  NbAccordionItemBody,
  NbAccordionItemHeader,
  NbButton,
  NbCard,
  NbCardBody,
  NbAccordionRef
} from '@nebular-react';

const AccordionInteractive: React.FC = () => {
  const ref = useRef<NbAccordionRef>(null);

  const openAll = () => {
    ref.current?.openAll();
  };

  const closeAll = () => {
    ref.current?.closeAll();
  };

  const openItem = (id: string) => {
    ref.current?.openById(id);
  };

  const closeItem = (id: string) => {
    ref.current?.closeById(id);
  };

  return (
    <>
      <NbAccordion ref={ref} multiple>
        <NbAccordionItem id="item1" expanded>
          <NbAccordionItemHeader>Product Details</NbAccordionItemHeader>
          <NbAccordionItemBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbAccordionItemBody>
        </NbAccordionItem>

        <NbAccordionItem id="item2" expanded>
          <NbAccordionItemHeader>Reviews</NbAccordionItemHeader>
          <NbAccordionItemBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbAccordionItemBody>
        </NbAccordionItem>

        <NbAccordionItem id="item3" expanded>
          <NbAccordionItemHeader>Edit</NbAccordionItemHeader>
          <NbAccordionItemBody>
            A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases. Originally, nebula was
            a name for any diffuse astronomical object, including galaxies beyond the Milky Way.
          </NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
      <NbCard>
        <NbCardBody className="example-items-rows">
          <NbButton status="primary" onClick={closeAll}>
            Close all
          </NbButton>
          <NbButton status="info" onClick={openAll}>
            Open all
          </NbButton>
          <NbButton status="warning" onClick={() => closeItem('item1')}>
            Close item 1
          </NbButton>
          <NbButton status="danger" onClick={() => openItem('item1')}>
            Open item 1
          </NbButton>
        </NbCardBody>
      </NbCard>
    </>
  );
};

export { AccordionInteractive };
