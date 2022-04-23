import React from 'react';

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
 * Accordion item context
 */
export const AccordionItemContext = React.createContext<{
  /**
   * Item is collapsed (`true` by default)
   * @type {boolean}
   */
  collapsed: boolean;
  /**
   * Item is disabled and cannot be opened.
   * @type {boolean}
   */
  disabled: boolean;
  /**
   * Open/close the item
   */
  toggle: () => void;
}>({ collapsed: true, disabled: false, toggle: () => ({}) });
