import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { Affix } from '@nebular-react/core';

const setRect = (element: Element, rect: Partial<DOMRect>) => {
  const value = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect
  } as DOMRect;

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => value
  });

  return value;
};

describe('Affix', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
  });

  it('Affix_Render_ShouldRenderChildrenAndClassName', () => {
    const { container } = render(
      <Affix className="custom-affix">
        <span>Pinned content</span>
      </Affix>
    );

    expect(screen.getByText('Pinned content')).toBeInTheDocument();
    expect(container.querySelector('[data-affix-root]')).toHaveClass('custom-affix');
    expect(container.querySelector('[data-affix-placeholder]')).not.toBeInTheDocument();

    const content = container.querySelector('[data-affix-content]') as HTMLElement;

    expect(getComputedStyle(content).position).not.toBe('fixed');
  });

  it('Affix_ScrollPastOffsetTop_ShouldFixContentAndReserveSpace', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Affix onChange={onChange}>
        <button type="button">Pinned action</button>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: 120, bottom: 160, left: 24, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).not.toHaveBeenCalled();

    setRect(root, { top: -10, bottom: 30, left: 24, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenLastCalledWith(true);

    const content = container.querySelector('[data-affix-content]') as HTMLElement;
    const placeholder = container.querySelector('[data-affix-placeholder]') as HTMLElement;

    expect(content).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '24px',
      width: '200px'
    });
    expect(placeholder).toHaveStyle({ height: '40px' });
  });

  it('Affix_ScrollBackAboveOffset_ShouldRestoreContentInFlow', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Affix onChange={onChange}>
        <span>Pinned content</span>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: -10, bottom: 30, width: 200, height: 40 });
    fireEvent.scroll(window);
    expect(onChange).toHaveBeenLastCalledWith(true);

    setRect(root, { top: 400, bottom: 440, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(container.querySelector('[data-affix-placeholder]')).not.toBeInTheDocument();

    const content = container.querySelector('[data-affix-content]') as HTMLElement;

    expect(getComputedStyle(content).position).not.toBe('fixed');
  });

  it('Affix_OffsetTop_ShouldOnlyAffixAfterTheConfiguredThreshold', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Affix offsetTop={50} onChange={onChange}>
        <span>Pinned content</span>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: 60, bottom: 100, width: 200, height: 40 });
    fireEvent.scroll(window);
    expect(onChange).not.toHaveBeenCalled();

    setRect(root, { top: 40, bottom: 80, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenLastCalledWith(true);

    const content = container.querySelector('[data-affix-content]') as HTMLElement;

    expect(content).toHaveStyle({ position: 'fixed', top: '50px' });
  });

  it('Affix_OffsetBottom_ShouldAffixNearTheBottomEdge', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Affix offsetBottom={100} onChange={onChange}>
        <span>Pinned content</span>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: 600, bottom: 700, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenLastCalledWith(true);

    const content = container.querySelector('[data-affix-content]') as HTMLElement;

    expect(content).toHaveStyle({ position: 'fixed', bottom: '100px' });

    setRect(root, { top: 500, bottom: 600, width: 200, height: 40 });
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it('Affix_CustomTarget_ShouldListenToTheTargetScroll', () => {
    const target = document.createElement('div');

    document.body.appendChild(target);
    Object.defineProperty(target, 'clientHeight', { configurable: true, value: 500 });
    setRect(target, { top: 0, bottom: 500, width: 400, height: 500 });

    const onChange = jest.fn();
    const { container } = render(
      <Affix target={() => target} onChange={onChange}>
        <span>Pinned content</span>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: 100, bottom: 140, width: 200, height: 40 });
    fireEvent.scroll(target);
    expect(onChange).not.toHaveBeenCalled();

    target.scrollTop = 120;
    setRect(root, { top: -20, bottom: 20, width: 200, height: 40 });
    fireEvent.scroll(target);

    expect(onChange).toHaveBeenLastCalledWith(true);

    target.remove();
  });

  it('Affix_ScrollWithoutStateChange_ShouldNotifyOnlyOnce', () => {
    const onChange = jest.fn();
    const { container } = render(
      <Affix onChange={onChange}>
        <span>Pinned content</span>
      </Affix>
    );
    const root = container.querySelector('[data-affix-root]') as HTMLElement;

    setRect(root, { top: -10, bottom: 30, width: 200, height: 40 });
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    fireEvent.scroll(window);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Affix_Unmount_ShouldRemoveScrollAndResizeListeners', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <Affix>
        <span>Pinned content</span>
      </Affix>
    );

    const scrollHandler = addSpy.mock.calls.find(([type]) => type === 'scroll')?.[1];
    const resizeHandler = addSpy.mock.calls.find(([type]) => type === 'resize')?.[1];

    expect(scrollHandler).toEqual(expect.any(Function));
    expect(resizeHandler).toEqual(expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', scrollHandler);
    expect(removeSpy).toHaveBeenCalledWith('resize', resizeHandler);
  });

  it('Affix_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(
      <Affix>
        <a href="#main">Skip to content</a>
      </Affix>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
