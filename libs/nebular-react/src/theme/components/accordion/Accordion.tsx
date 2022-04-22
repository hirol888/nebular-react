/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React, { Children, isValidElement, useImperativeHandle } from 'react';
import { NbAccordionItem, NbAccordionItemRef } from './AccordionItem';

export type NbAccordionRef = {
  /**
   * Opens all enabled accordion items.
   */
  openAll: () => void;
  /**
   * Closes all enabled accordion items.
   */
  closeAll: () => void;
  /**
   * Open accordion item by id
   */
  openById: (id: string) => void;
  /**
   * Close accordion item by id
   */
  closeById: (id: string) => void;
};

export type NbAccordionProps = {
  /**
   *  Allow multiple items to be expanded at the same time.
   * @type {boolean}
   */
  multiple?: boolean;
};

/**
 * Accordion context
 */
export const AccordionContext = React.createContext<{
  /**
   *  Allow multiple items to be expanded at the same time.
   * @type {boolean}
   */
  multiple: boolean;
  /**
   *  Close all other items when it is not multiple.
   */
  closeOthers: (excludedId: string) => void;
}>({ multiple: false, closeOthers: () => ({}) });

/**
 * An accordion allows to toggle the display of sections of content
 *
 * Basic example
 * @stacked-example(Showcase, accordion/accordion-showcase)
 *
 * ```ts
 * <NbAccordion>
 *  <NbAccordionItem>
 *   <NbAccordionItemHeader>Product Details</NbAccordionItemHeader>
 *   <NbAccordionItemBody>
 *     Item Content
 *   </NbAccordionItemBody>
 *  </NbAccordionItem>
 * </NbAccordion>
 * ```
 * ### Usage
 *
 * With `multiple` mode accordion can have multiple items expanded:
 * @stacked-example(Multiple expanded items, accordion/accordion-multiple)
 *
 * `NbAccordionItem` has several methods, for example it is possible to trigger item click/toggle:
 * @stacked-example(Expand API, accordion/accordion-toggle)
 *
 * @styles
 *
 * accordion-border-radius:
 * accordion-padding:
 * accordion-shadow:
 * accordion-header-text-color:
 * accordion-header-text-font-family:
 * accordion-header-text-font-size:
 * accordion-header-text-font-weight:
 * accordion-header-text-line-height:
 * accordion-header-disabled-text-color:
 * accordion-header-border-color:
 * accordion-header-border-style:
 * accordion-header-border-width:
 * accordion-item-background-color:
 * accordion-item-text-color:
 * accordion-item-text-font-family:
 * accordion-item-text-font-size:
 * accordion-item-text-font-weight:
 * accordion-item-text-line-height:
 */
const NbAccordion = React.forwardRef<NbAccordionRef, NbAccordionProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ multiple = false, className, children, ...otherProps }, ref) => {
    const itemRefs: { id: string; ref: React.RefObject<NbAccordionItemRef> }[] = [];

    useImperativeHandle(ref, () => ({
      openAll: () => {
        itemRefs.forEach((ir) => ir.ref.current?.open());
      },
      closeAll: () => {
        itemRefs.forEach((ir) => ir.ref.current?.close());
      },
      openById: (id: string) => {
        itemRefs.find((ir) => ir.id === id)?.ref.current?.open();
      },
      closeById: (id: string) => {
        itemRefs.find((ir) => ir.id === id)?.ref.current?.close();
      }
    }));

    // Close other items when it is not multiple
    const closeOthers = (excludedId: string) => {
      itemRefs.forEach((ir) => {
        if (ir.ref.current?.getId() !== excludedId) {
          ir.ref.current?.close();
        }
      });
    };

    const items = Children.map(children, (c) => {
      if (isValidElement(c) && c.type === NbAccordionItem) {
        const ref = React.createRef<NbAccordionItemRef>();
        itemRefs.push({ id: c.props.id, ref });
        return React.cloneElement(c, {
          ...c.props,
          ref
        });
      }
      return null;
    });

    return (
      <AccordionContext.Provider value={{ multiple, closeOthers }}>
        <div className={classNames('nb-accordion', className)} {...otherProps}>
          {items}
        </div>
      </AccordionContext.Provider>
    );
  }
);

export { NbAccordion };
