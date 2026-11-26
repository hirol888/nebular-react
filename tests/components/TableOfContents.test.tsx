import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { TableOfContents } from '@nebular-react/core';

const items = [
  { id: 'intro', label: 'Introduction' },
  { id: 'details', label: 'Details', depth: 1 }
];

const position = (element: HTMLElement, top: number, height: number) =>
  jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: top,
    left: 0,
    top,
    right: 100,
    bottom: top + height,
    width: 100,
    height,
    toJSON: () => ({})
  });

describe('TableOfContents', () => {
  it('tracks the section at the activation offset of an explicit scroll container', async () => {
    const onActiveChange = jest.fn();
    function Example() {
      const scrollRef = useRef<HTMLElement>(null);
      return (
        <>
          <TableOfContents
            items={items}
            scrollContainerRef={scrollRef}
            offset={12}
            onActiveChange={onActiveChange}
          />
          <section ref={scrollRef} aria-label="Article">
            <h2 id="intro">Introduction</h2>
            <h2 id="details">Details</h2>
          </section>
        </>
      );
    }

    const { container } = render(<Example />);
    const scrollContainer = screen.getByRole('region', { name: 'Article' });
    const scrollTo = jest.fn();
    Object.defineProperty(scrollContainer, 'scrollTo', { value: scrollTo });
    position(scrollContainer, 100, 300);
    position(screen.getByRole('heading', { name: 'Introduction' }), 112, 30);
    position(screen.getByRole('heading', { name: 'Details' }), 320, 30);
    fireEvent.scroll(scrollContainer);
    expect(screen.getByRole('link', { name: 'Introduction' })).toHaveAttribute(
      'aria-current',
      'location'
    );

    position(screen.getByRole('heading', { name: 'Introduction' }), -92, 30);
    position(screen.getByRole('heading', { name: 'Details' }), 125, 30);
    screen.getByRole('link', { name: 'Details' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(scrollTo).toHaveBeenCalledWith({ top: 13, behavior: 'smooth' });
    position(screen.getByRole('heading', { name: 'Details' }), 112, 30);
    fireEvent.scroll(scrollContainer);
    expect(screen.getByRole('link', { name: 'Details' })).toHaveAttribute(
      'aria-current',
      'location'
    );
    expect(onActiveChange).toHaveBeenLastCalledWith('details');
    expect(await axe(container)).toHaveNoViolations();
  });
});
