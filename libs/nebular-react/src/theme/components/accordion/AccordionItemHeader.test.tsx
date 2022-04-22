/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccordionContext, AccordionItemContext, NbAccordionItemHeader } from '.';

describe('NbAccordionItemHeader', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should have collapsed attributes and class', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: true, disabled: false, toggle: mToggle }}>
          <NbAccordionItemHeader data-testid="itemheader">Accordion Header</NbAccordionItemHeader>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    ));
    const itemHeader = screen.getByTestId('itemheader');

    expect(itemHeader).toHaveClass('accordion-item-header-collapsed');
    expect(itemHeader).toHaveAttribute('aria-expanded', 'false');
    expect(itemHeader).toHaveAttribute('aria-disabled', 'false');
    expect(itemHeader).toHaveAttribute('tabindex', '0');

    const expansionIndicator = itemHeader?.querySelector('.expansion-indicator');
    expect(expansionIndicator).toHaveStyle({ transform: 'rotate(0deg)' });
  });

  it('should have expanded attributes and class', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: false, disabled: false, toggle: mToggle }}>
          <NbAccordionItemHeader data-testid="itemheader">Accordion Header</NbAccordionItemHeader>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    ));
    const itemHeader = screen.getByTestId('itemheader');

    expect(itemHeader).toHaveClass('accordion-item-header-expanded');
    expect(itemHeader).toHaveAttribute('aria-expanded', 'true');
    expect(itemHeader).toHaveAttribute('aria-disabled', 'false');
    expect(itemHeader).toHaveAttribute('tabindex', '0');

    const expansionIndicator = itemHeader?.querySelector('.expansion-indicator');
    expect(expansionIndicator).toHaveStyle({ transform: 'rotate(180deg)' });
  });

  it('should have disabled attributes and no expansion indicator', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: false, disabled: true, toggle: mToggle }}>
          <NbAccordionItemHeader data-testid="itemheader">Accordion Header</NbAccordionItemHeader>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    ));
    const itemHeader = screen.getByTestId('itemheader');

    expect(itemHeader).toHaveClass('accordion-item-header-collapsed');
    expect(itemHeader).toHaveAttribute('aria-expanded', 'false');
    expect(itemHeader).toHaveAttribute('aria-disabled', 'true');
    expect(itemHeader).toHaveAttribute('tabindex', '-1');

    const expansionIndicator = itemHeader?.querySelector('.expansion-indicator');
    expect(expansionIndicator).toBeNull();
  });
});
