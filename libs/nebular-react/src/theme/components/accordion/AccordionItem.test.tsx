/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AccordionContext, NbAccordionItem, NbAccordionItemBody, NbAccordionItemHeader } from '.';

describe('NbAccordionItem', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should have collapsed class by default', () => {
    const mClostOthers = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <NbAccordionItem id="item1" data-testid="accordion">
          <NbAccordionItemHeader>Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
      </AccordionContext.Provider>
    ));
    const accordionItem = screen.getByTestId('accordion');

    expect(accordionItem).toHaveClass('collapsed');
  });

  it('should be expanded and close others when clicking header and it is not multiple', () => {
    const mClostOthers = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <NbAccordionItem id="item1" data-testid="accordion">
          <NbAccordionItemHeader data-testid="accordion-header">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
      </AccordionContext.Provider>
    ));
    const accordionItem = screen.getByTestId('accordion');
    const accordionItemHeader = screen.getByTestId('accordion-header');

    fireEvent.click(accordionItemHeader);

    expect(accordionItem).toHaveClass('expanded');
    expect(mClostOthers).toBeCalledTimes(1);
  });

  it('should be expanded and not close others when clicking header and it is multiple', () => {
    const mClostOthers = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: true, closeOthers: mClostOthers }}>
        <NbAccordionItem id="item1" data-testid="accordion">
          <NbAccordionItemHeader data-testid="accordion-header">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
      </AccordionContext.Provider>
    ));
    const accordionItem = screen.getByTestId('accordion');
    const accordionItemHeader = screen.getByTestId('accordion-header');

    fireEvent.click(accordionItemHeader);

    expect(accordionItem).not.toHaveClass('collapsed');
    expect(mClostOthers).toBeCalledTimes(0);
  });

  it('should be expanded when pressing space', () => {
    const mClostOthers = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <NbAccordionItem id="item1" data-testid="accordion">
          <NbAccordionItemHeader data-testid="accordion-header">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
      </AccordionContext.Provider>
    ));
    const accordionItem = screen.getByTestId('accordion');
    const accordionItemHeader = screen.getByTestId('accordion-header');
    accordionItemHeader.focus();

    fireEvent.keyDown(accordionItemHeader, {
      key: ' '
    });

    expect(accordionItem).toHaveClass('expanded');
    expect(mClostOthers).toBeCalledTimes(1);
  });

  it('should be stay collapsed when clicking header and it is disabled', () => {
    const mClostOthers = jest.fn();

    ({ unmount } = render(
      <AccordionContext.Provider value={{ multiple: false, closeOthers: mClostOthers }}>
        <NbAccordionItem id="item1" disabled data-testid="accordion">
          <NbAccordionItemHeader data-testid="accordion-header">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
      </AccordionContext.Provider>
    ));
    const accordionItem = screen.getByTestId('accordion');
    const accordionItemHeader = screen.getByTestId('accordion-header');

    fireEvent.click(accordionItemHeader);

    expect(accordionItem).toHaveClass('collapsed');
    expect(mClostOthers).toBeCalledTimes(0);
  });
});
