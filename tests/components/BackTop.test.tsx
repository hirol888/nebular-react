import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
// Internal unit is imported directly because the public entry point does not expose it yet.
import { BackTop } from '@nebular-react/core';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value });
};

describe('BackTop', () => {
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    setScrollY(0);
    scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
    jest.restoreAllMocks();
    setScrollY(0);
  });

  it('BackTop_InitialRender_ShouldStayHidden', () => {
    render(<BackTop />);

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('BackTop_ScrollPastVisibilityHeight_ShouldShowTheButton', () => {
    render(<BackTop />);

    setScrollY(500);
    fireEvent.scroll(window);

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('BackTop_ScrollBelowVisibilityHeight_ShouldKeepTheButtonHidden', () => {
    render(<BackTop />);

    setScrollY(399);
    fireEvent.scroll(window);

    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();
  });

  it('BackTop_CustomVisibilityHeight_ShouldRespectTheThreshold', () => {
    render(<BackTop visibilityHeight={100} />);

    setScrollY(120);
    fireEvent.scroll(window);

    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('BackTop_Click_ShouldInvokeCallbackAndSmoothScrollToTop', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<BackTop onClick={onClick} />);

    setScrollY(500);
    fireEvent.scroll(window);
    await user.click(screen.getByRole('button', { name: 'Back to top' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('BackTop_SmoothDisabled_ShouldScrollWithAutoBehavior', async () => {
    const user = userEvent.setup();

    render(<BackTop smooth={false} visibilityHeight={0} />);

    fireEvent.scroll(window);
    await user.click(screen.getByRole('button', { name: 'Back to top' }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('BackTop_CustomTarget_ShouldListenAndScrollTheTargetElement', async () => {
    const user = userEvent.setup();
    const target = document.createElement('div');
    const targetScrollTo = jest.fn();

    target.scrollTop = 600;
    Object.defineProperty(target, 'scrollTo', { configurable: true, value: targetScrollTo });
    document.body.appendChild(target);

    render(<BackTop target={() => target} />);

    fireEvent.scroll(target);
    await user.click(screen.getByRole('button', { name: 'Back to top' }));

    expect(targetScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(window.scrollTo).not.toHaveBeenCalled();

    target.remove();
  });

  it('BackTop_AriaLabel_ShouldBeConfigurable', () => {
    render(<BackTop ariaLabel="Voltar ao topo" />);

    setScrollY(500);
    fireEvent.scroll(window);

    expect(screen.getByRole('button', { name: 'Voltar ao topo' })).toBeInTheDocument();
  });

  it('BackTop_Children_ShouldReplaceTheDefaultIcon', () => {
    render(<BackTop visibilityHeight={0}>Topo</BackTop>);

    fireEvent.scroll(window);

    expect(screen.getByText('Topo')).toBeInTheDocument();
  });

  it('BackTop_Position_ShouldApplyTheRequestedCorner', () => {
    render(<BackTop position="top-start" visibilityHeight={0} />);

    fireEvent.scroll(window);

    const button = screen.getByRole('button', { name: 'Back to top' });

    expect(button).toHaveAttribute('data-position', 'top-start');
    expect(getComputedStyle(button).position).toBe('fixed');
    expect(getComputedStyle(button).getPropertyValue('top')).toBe('24px');
  });

  it('BackTop_Unmount_ShouldRemoveTheScrollListener', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackTop />);

    const scrollHandler = addSpy.mock.calls.find(([type]) => type === 'scroll')?.[1];

    expect(scrollHandler).toEqual(expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', scrollHandler);
  });

  it('BackTop_Accessibility_ShouldHaveNoViolations', async () => {
    const { container } = render(<BackTop />);

    setScrollY(500);
    fireEvent.scroll(window);

    expect(await axe(container)).toHaveNoViolations();
  });
});
