/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccordionContext, AccordionItemContext, NbAccordionItemBody } from '.';

describe('NbAccordionItemBody', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should have collapsed class when it is collapsed', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: true, disabled: false, toggle: mToggle }}>
          <NbAccordionItemBody data-testid="itembody">Accordion Item Body</NbAccordionItemBody>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    ));

    const itemBody = screen.getByTestId('itembody');

    expect(itemBody).toHaveClass('collapsed');
  });

  it('should not have collapsed class when it is not collapsed', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: false, disabled: false, toggle: mToggle }}>
          <NbAccordionItemBody data-testid="itembody">Accordion Item Body</NbAccordionItemBody>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    ));

    const itemBody = screen.getByTestId('itembody');

    expect(itemBody).not.toHaveClass('collapsed');
  });

  it('should have collapsed class when it is disabled', () => {
    const mClostOthers = jest.fn();
    const mToggle = jest.fn();

    const { unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <AccordionItemContext.Provider value={{ collapsed: false, disabled: true, toggle: mToggle }}>
          <NbAccordionItemBody data-testid="itembody">Accordion Item Body</NbAccordionItemBody>
        </AccordionItemContext.Provider>
      </AccordionContext.Provider>
    );

    const itemBody = screen.getByTestId('itembody');

    expect(itemBody).toHaveClass('collapsed');

    unmount();
  });
});
