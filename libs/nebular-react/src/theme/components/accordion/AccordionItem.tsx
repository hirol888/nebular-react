/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import classNames from 'classnames';
import React, { Children, isValidElement, useContext, useImperativeHandle, useState } from 'react';
import './accordion-item.scoped.scss';
import { NbAccordionItemHeader } from './AccordionItemHeader';
import { NbAccordionItemBody } from './AccordionItemBody';
import { AccordionContext, AccordionItemContext } from './Accordion.context';

export type NbAccordionItemRef = {
  /**
   * Open the item.
   */
  open: () => void;
  /**
   * Collapse the item.
   */
  close: () => void;
  /**
   * Get the item id.
   */
  getId: () => string;
};

export type NbAccordionItemProps = {
  /**
   * Item id, it's mandatory and must be unique
   * @type {string}
   */
  id: string;
  /**
   * Item is disabled and cannot be opened.
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Item is expanded (`false` by default)
   * @type {boolean}
   */
  expanded?: boolean;
};

/**
 * Component intended to be used within `<NbAccordion>` component
 */
const NbAccordionItem = React.forwardRef<
  NbAccordionItemRef,
  NbAccordionItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ id, disabled = false, expanded = false, className, children, ...otherProps }, ref) => {
  const [collapsed, setCollapsed] = useState<boolean>(!expanded);
  const { multiple, closeOthers } = useContext(AccordionContext);

  // Open/close the item
  const toggle = () => {
    if (!disabled) {
      setCollapsed(!collapsed);
      if (!multiple) {
        closeOthers(id ?? '');
      }
    }
  };

  const headerElement = Children.toArray(children).filter((c) => {
    return isValidElement(c) && c.type === NbAccordionItemHeader;
  });

  const bodyElement = Children.toArray(children).filter((c) => {
    return isValidElement(c) && c.type === NbAccordionItemBody;
  });

  useImperativeHandle(ref, () => ({
    open: () => {
      !disabled && setCollapsed(false);
    },
    close: () => {
      !disabled && setCollapsed(true);
    },
    getId: () => {
      return id ?? '';
    }
  }));

  return (
    <AccordionItemContext.Provider value={{ collapsed, disabled, toggle }}>
      <div
        className={classNames('nb-accordion-item', className, {
          collapsed: collapsed,
          expanded: !collapsed,
          disabled: disabled
        })}
        {...otherProps}
      >
        {headerElement}
        {bodyElement}
      </div>
    </AccordionItemContext.Provider>
  );
});

export { NbAccordionItem };
