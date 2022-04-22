/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NbAccordion, NbAccordionItem, NbAccordionItemBody, NbAccordionItemHeader, NbAccordionRef } from '..';

describe('NbAccordion', () => {
  let unmount: () => void;

  afterEach(() => {
    unmount();
  });

  it('should all be collapsed by default', () => {
    ({ unmount } = render(
      <NbAccordion>
        <NbAccordionItem id="item1" data-testid="item1">
          <NbAccordionItemHeader data-testid="header1">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item2" data-testid="item2">
          <NbAccordionItemHeader data-testid="header2">Header 2</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 2</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item3" data-testid="item3">
          <NbAccordionItemHeader data-testid="header3">Header 3</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 3</NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
    ));
    const item1 = screen.getByTestId('item1');
    const item2 = screen.getByTestId('item2');
    const item3 = screen.getByTestId('item3');
    const header1 = screen.getByTestId('header1');
    const header2 = screen.getByTestId('header2');
    const header3 = screen.getByTestId('header3');

    expect(item1).toHaveClass('collapsed');
    expect(item2).toHaveClass('collapsed');
    expect(item3).toHaveClass('collapsed');
    expect(header1).toHaveClass('accordion-item-header-collapsed');
    expect(header2).toHaveClass('accordion-item-header-collapsed');
    expect(header3).toHaveClass('accordion-item-header-collapsed');
  });

  it('should all be expanded', () => {
    ({ unmount } = render(
      <NbAccordion multiple>
        <NbAccordionItem id="item1" expanded data-testid="item1">
          <NbAccordionItemHeader data-testid="header1">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item2" expanded data-testid="item2">
          <NbAccordionItemHeader data-testid="header2">Header 2</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 2</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item3" expanded data-testid="item3">
          <NbAccordionItemHeader data-testid="header3">Header 3</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 3</NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
    ));
    const item1 = screen.getByTestId('item1');
    const item2 = screen.getByTestId('item2');
    const item3 = screen.getByTestId('item3');
    const header1 = screen.getByTestId('header1');
    const header2 = screen.getByTestId('header2');
    const header3 = screen.getByTestId('header3');

    expect(item1).toHaveClass('expanded');
    expect(item2).toHaveClass('expanded');
    expect(item3).toHaveClass('expanded');
    expect(header1).toHaveClass('accordion-item-header-expanded');
    expect(header2).toHaveClass('accordion-item-header-expanded');
    expect(header3).toHaveClass('accordion-item-header-expanded');
  });

  it('should be expanded when clicking a header', () => {
    ({ unmount } = render(
      <NbAccordion>
        <NbAccordionItem id="item1" data-testid="item1">
          <NbAccordionItemHeader data-testid="header1">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item2" data-testid="item2">
          <NbAccordionItemHeader data-testid="header2">Header 2</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 2</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item3" data-testid="item3">
          <NbAccordionItemHeader data-testid="header3">Header 3</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 3</NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
    ));
    const item1 = screen.getByTestId('item1');
    const item2 = screen.getByTestId('item2');
    const item3 = screen.getByTestId('item3');
    const header1 = screen.getByTestId('header1');
    const header2 = screen.getByTestId('header2');
    const header3 = screen.getByTestId('header3');

    fireEvent.click(header1);

    expect(item1).toHaveClass('expanded');
    expect(item2).toHaveClass('collapsed');
    expect(item3).toHaveClass('collapsed');
    expect(header1).toHaveClass('accordion-item-header-expanded');
    expect(header2).toHaveClass('accordion-item-header-collapsed');
    expect(header3).toHaveClass('accordion-item-header-collapsed');
  });

  it('should be expanded and not close others when clicking a header and it it multiple', () => {
    ({ unmount } = render(
      <NbAccordion multiple>
        <NbAccordionItem id="item1" data-testid="item1">
          <NbAccordionItemHeader data-testid="header1">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item2" data-testid="item2">
          <NbAccordionItemHeader data-testid="header2">Header 2</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 2</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item3" data-testid="item3">
          <NbAccordionItemHeader data-testid="header3">Header 3</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 3</NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
    ));
    const item1 = screen.getByTestId('item1');
    const item2 = screen.getByTestId('item2');
    const item3 = screen.getByTestId('item3');
    const header1 = screen.getByTestId('header1');
    const header2 = screen.getByTestId('header2');
    const header3 = screen.getByTestId('header3');

    fireEvent.click(header1);
    fireEvent.click(header2);

    expect(item1).toHaveClass('expanded');
    expect(item2).toHaveClass('expanded');
    expect(item3).toHaveClass('collapsed');
    expect(header1).toHaveClass('accordion-item-header-expanded');
    expect(header2).toHaveClass('accordion-item-header-expanded');
    expect(header3).toHaveClass('accordion-item-header-collapsed');
  });

  it('should open all items', () => {
    const ref = React.createRef<NbAccordionRef>();

    ({ unmount } = render(
      <NbAccordion multiple ref={ref}>
        <NbAccordionItem id="item1" data-testid="item1">
          <NbAccordionItemHeader data-testid="header1">Header 1</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 1</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item2" data-testid="item2">
          <NbAccordionItemHeader data-testid="header2">Header 2</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 2</NbAccordionItemBody>
        </NbAccordionItem>
        <NbAccordionItem id="item3" data-testid="item3">
          <NbAccordionItemHeader data-testid="header3">Header 3</NbAccordionItemHeader>
          <NbAccordionItemBody>Body 3</NbAccordionItemBody>
        </NbAccordionItem>
      </NbAccordion>
    ));
    const item1 = screen.getByTestId('item1');
    const item2 = screen.getByTestId('item2');
    const item3 = screen.getByTestId('item3');
    const header1 = screen.getByTestId('header1');
    const header2 = screen.getByTestId('header2');
    const header3 = screen.getByTestId('header3');

    act(() => {
      ref.current?.openAll();
    });

    expect(item1).toHaveClass('expanded');
    expect(item2).toHaveClass('expanded');
    expect(item3).toHaveClass('expanded');
    expect(header1).toHaveClass('accordion-item-header-expanded');
    expect(header2).toHaveClass('accordion-item-header-expanded');
    expect(header3).toHaveClass('accordion-item-header-expanded');
  });
});
