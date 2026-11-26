import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { VirtualList } from '@nebular-react/core';

const items = Array.from({ length: 100 }, (_, index) => `Item ${index}`);

function renderVirtualList(props: Record<string, unknown> = {}) {
  return render(
    <VirtualList
      items={items}
      height={200}
      itemHeight={20}
      renderItem={(item) => <span>{item}</span>}
      {...props}
    />
  );
}

function getScroller(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

describe('VirtualList', () => {
  it('VirtualList_Render_ShouldRenderVisibleWindowPlusOverscan', () => {
    renderVirtualList();

    const list = screen.getByRole('list', { name: 'Virtual list' });
    const rendered = within(list).getAllByRole('listitem');

    expect(rendered).toHaveLength(13);
    expect(rendered[0]).toHaveTextContent('Item 0');
    expect(rendered[12]).toHaveTextContent('Item 12');
    expect(screen.queryByText('Item 13')).not.toBeInTheDocument();
  });

  it('VirtualList_Render_ShouldRenderTopAndBottomSpacers', () => {
    const { container } = renderVirtualList();

    expect(container.querySelector('[data-virtual-spacer="top"]')).toHaveStyle({ height: '0px' });
    expect(container.querySelector('[data-virtual-spacer="bottom"]')).toHaveStyle({
      height: '1740px'
    });
  });

  it('VirtualList_Scroll_ShouldShiftTheRenderedWindow', () => {
    const renderItem = jest.fn((item: string) => <span>{item}</span>);
    const { container } = renderVirtualList({ renderItem });
    const scroller = getScroller(container);

    expect(scroller).toHaveStyle({ height: '200px', overflowY: 'auto' });

    fireEvent.scroll(scroller, { target: { scrollTop: 400 } });

    const list = screen.getByRole('list');

    expect(within(list).getAllByRole('listitem')).toHaveLength(16);
    expect(screen.getByText('Item 17')).toBeInTheDocument();
    expect(screen.queryByText('Item 16')).not.toBeInTheDocument();
    expect(container.querySelector('[data-virtual-spacer="top"]')).toHaveStyle({
      height: '340px'
    });
    expect(container.querySelector('[data-virtual-spacer="bottom"]')).toHaveStyle({
      height: '1340px'
    });
    expect(renderItem).toHaveBeenCalledWith('Item 17', 17);
  });

  it('VirtualList_ScrollToBottom_ShouldCollapseBottomSpacer', () => {
    const { container } = renderVirtualList();
    const scroller = getScroller(container);

    fireEvent.scroll(scroller, { target: { scrollTop: 1800 } });

    const rendered = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(rendered[rendered.length - 1]).toHaveTextContent('Item 99');
    expect(container.querySelector('[data-virtual-spacer="bottom"]')).toHaveStyle({
      height: '0px'
    });
  });

  it('VirtualList_EndReached_ShouldFireOncePerReachingTheEnd', () => {
    const onEndReached = jest.fn();
    const { container } = renderVirtualList({ onEndReached });
    const scroller = getScroller(container);

    expect(onEndReached).not.toHaveBeenCalled();

    fireEvent.scroll(scroller, { target: { scrollTop: 1900 } });
    expect(onEndReached).toHaveBeenCalledTimes(1);

    fireEvent.scroll(scroller, { target: { scrollTop: 1950 } });
    expect(onEndReached).toHaveBeenCalledTimes(1);

    fireEvent.scroll(scroller, { target: { scrollTop: 0 } });
    fireEvent.scroll(scroller, { target: { scrollTop: 1900 } });
    expect(onEndReached).toHaveBeenCalledTimes(2);
  });

  it('VirtualList_GetKey_ShouldExposeProvidedKeys', () => {
    const keyedItems = [
      { id: 'alpha', label: 'Alpha' },
      { id: 'beta', label: 'Beta' },
      { id: 'gamma', label: 'Gamma' }
    ];

    const { container } = render(
      <VirtualList
        items={keyedItems}
        height={200}
        itemHeight={20}
        getKey={(item) => item.id}
        renderItem={(item) => <span>{item.label}</span>}
      />
    );

    const renderedKeys = Array.from(container.querySelectorAll('[role="listitem"]')).map((node) =>
      node.getAttribute('data-key')
    );

    expect(renderedKeys).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('VirtualList_GetKeyOmitted_ShouldFallBackToTheItemIndex', () => {
    const { container } = renderVirtualList({ items: items.slice(0, 3) });

    const renderedKeys = Array.from(container.querySelectorAll('[role="listitem"]')).map((node) =>
      node.getAttribute('data-key')
    );

    expect(renderedKeys).toEqual(['0', '1', '2']);
  });

  it('VirtualList_Items_ShouldExposeSetSizeAndPosition', () => {
    renderVirtualList({ items: items.slice(0, 3) });

    const rendered = within(screen.getByRole('list')).getAllByRole('listitem');

    expect(rendered[0]).toHaveAttribute('aria-setsize', '3');
    expect(rendered[0]).toHaveAttribute('aria-posinset', '1');
    expect(rendered[2]).toHaveAttribute('aria-posinset', '3');
  });

  it('VirtualList_AriaLabel_ShouldBeConfigurable', () => {
    renderVirtualList({ ariaLabel: 'Search results' });

    expect(screen.getByRole('list', { name: 'Search results' })).toBeInTheDocument();
  });

  it('VirtualList_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = renderVirtualList();

    expect(await axe(container)).toHaveNoViolations();
  });
});
