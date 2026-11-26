import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { NebularProvider } from '@nebular-react/core';
import {
  GlobalLogicalPosition,
  GlobalPhysicalPosition,
  useLogicalPositionQueue,
  usePositionHelper
} from '@nebular-react/hooks';
import {
  disableScrollStyles,
  enableScrollStyles,
  ScrollStylesState,
  supportsScrollBehavior
  // Scroll locking is internal and has no entry point in the public hooks package.
  // eslint-disable-next-line import-x/no-relative-packages
} from '../../src/nebular-react-hooks/src/use-overlay/get-scroll-styles/get-scroll-styles';

function directionWrapper(dir: 'ltr' | 'rtl') {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NebularProvider
        dir={dir}
        withGlobalStyles={false}
        withNormalizeCSS={false}
        withOverlayStyles={false}
      >
        {children}
      </NebularProvider>
    );
  };
}

describe('usePositionHelper', () => {
  it('usePositionHelper_LogicalPositions_ShouldBeReturnedAsIs', () => {
    const { result } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('ltr')
    });

    Object.values(GlobalLogicalPosition).forEach((position) => {
      expect(result.current.toLogicalPosition(position)).toBe(position);
    });
  });

  it('usePositionHelper_Ltr_ShouldMapPhysicalToLogicalPositions', () => {
    const { result } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('ltr')
    });

    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.TOP_RIGHT)).toBe(
      GlobalLogicalPosition.TOP_END
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.TOP_LEFT)).toBe(
      GlobalLogicalPosition.TOP_START
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.BOTTOM_RIGHT)).toBe(
      GlobalLogicalPosition.BOTTOM_END
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.BOTTOM_LEFT)).toBe(
      GlobalLogicalPosition.BOTTOM_START
    );
  });

  it('usePositionHelper_Rtl_ShouldMirrorPhysicalPositions', () => {
    const { result } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('rtl')
    });

    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.TOP_RIGHT)).toBe(
      GlobalLogicalPosition.TOP_START
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.TOP_LEFT)).toBe(
      GlobalLogicalPosition.TOP_END
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.BOTTOM_RIGHT)).toBe(
      GlobalLogicalPosition.BOTTOM_START
    );
    expect(result.current.toLogicalPosition(GlobalPhysicalPosition.BOTTOM_LEFT)).toBe(
      GlobalLogicalPosition.BOTTOM_END
    );
  });

  it('usePositionHelper_ToPhysicalPosition_ShouldMapLogicalPositions', () => {
    const { result: ltr } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('ltr')
    });
    const { result: rtl } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('rtl')
    });

    Object.values(GlobalPhysicalPosition).forEach((position) => {
      expect(ltr.current.toPhysicalPosition(position)).toBe(position);
    });

    expect(ltr.current.toPhysicalPosition(GlobalLogicalPosition.TOP_START)).toBe(
      GlobalPhysicalPosition.TOP_LEFT
    );
    expect(ltr.current.toPhysicalPosition(GlobalLogicalPosition.TOP_END)).toBe(
      GlobalPhysicalPosition.TOP_RIGHT
    );
    expect(ltr.current.toPhysicalPosition(GlobalLogicalPosition.BOTTOM_START)).toBe(
      GlobalPhysicalPosition.BOTTOM_LEFT
    );
    expect(ltr.current.toPhysicalPosition(GlobalLogicalPosition.BOTTOM_END)).toBe(
      GlobalPhysicalPosition.BOTTOM_RIGHT
    );

    expect(rtl.current.toPhysicalPosition(GlobalLogicalPosition.TOP_START)).toBe(
      GlobalPhysicalPosition.TOP_RIGHT
    );
    expect(rtl.current.toPhysicalPosition(GlobalLogicalPosition.TOP_END)).toBe(
      GlobalPhysicalPosition.TOP_LEFT
    );
    expect(rtl.current.toPhysicalPosition(GlobalLogicalPosition.BOTTOM_START)).toBe(
      GlobalPhysicalPosition.BOTTOM_RIGHT
    );
    expect(rtl.current.toPhysicalPosition(GlobalLogicalPosition.BOTTOM_END)).toBe(
      GlobalPhysicalPosition.BOTTOM_LEFT
    );
  });

  it('usePositionHelper_Predicates_ShouldDetectTopAndRightPositions', () => {
    const { result } = renderHook(() => usePositionHelper(), {
      wrapper: directionWrapper('ltr')
    });

    expect(result.current.isTopPosition(GlobalLogicalPosition.TOP_START)).toBe(true);
    expect(result.current.isTopPosition(GlobalLogicalPosition.TOP_END)).toBe(true);
    expect(result.current.isTopPosition(GlobalLogicalPosition.BOTTOM_START)).toBe(false);
    expect(result.current.isTopPosition(GlobalPhysicalPosition.TOP_RIGHT)).toBe(true);

    expect(result.current.isRightPosition(GlobalPhysicalPosition.TOP_RIGHT)).toBe(true);
    expect(result.current.isRightPosition(GlobalPhysicalPosition.BOTTOM_RIGHT)).toBe(true);
    expect(result.current.isRightPosition(GlobalPhysicalPosition.TOP_LEFT)).toBe(false);
    expect(result.current.isRightPosition(GlobalLogicalPosition.TOP_END)).toBe(true);
    expect(result.current.isRightPosition(GlobalLogicalPosition.BOTTOM_START)).toBe(false);
  });
});

describe('useLogicalPositionQueue', () => {
  it('useLogicalPositionQueue_InitialValues_ShouldBeSplitBetweenStatesAndQueues', () => {
    const initialValues = {
      [GlobalLogicalPosition.TOP_START]: [1, 2, 3],
      [GlobalLogicalPosition.TOP_END]: [4],
      [GlobalLogicalPosition.BOTTOM_START]: [],
      [GlobalLogicalPosition.BOTTOM_END]: []
    };
    const { result } = renderHook(() =>
      useLogicalPositionQueue<number>({ initialValues, limit: 2 })
    );

    expect(result.current.states[GlobalLogicalPosition.TOP_START]).toEqual([1, 2]);
    expect(result.current.queues[GlobalLogicalPosition.TOP_START]).toEqual([3]);
    expect(result.current.states[GlobalLogicalPosition.TOP_END]).toEqual([4]);
  });

  it('useLogicalPositionQueue_Add_ShouldRespectTheLimitAndFeedTheQueue', () => {
    const { result } = renderHook(() => useLogicalPositionQueue<number>({ limit: 2 }));

    act(() => result.current.add([1, 2, 3], GlobalLogicalPosition.TOP_START));

    expect(result.current.states[GlobalLogicalPosition.TOP_START]).toEqual([1, 2]);
    expect(result.current.queues[GlobalLogicalPosition.TOP_START]).toEqual([3]);

    act(() => result.current.add([4], GlobalLogicalPosition.TOP_START));

    expect(result.current.states[GlobalLogicalPosition.TOP_START]).toEqual([1, 2]);
    expect(result.current.queues[GlobalLogicalPosition.TOP_START]).toEqual([3, 4]);
  });

  it('useLogicalPositionQueue_Update_ShouldRebalanceStatesAndQueues', () => {
    const { result } = renderHook(() => useLogicalPositionQueue<number>({ limit: 2 }));

    act(() => result.current.add([1, 2, 3, 4], GlobalLogicalPosition.TOP_START));
    act(() =>
      result.current.update(
        (items) => items.filter((item) => item !== 2),
        GlobalLogicalPosition.TOP_START
      )
    );

    expect(result.current.states[GlobalLogicalPosition.TOP_START]).toEqual([1, 3]);
    expect(result.current.queues[GlobalLogicalPosition.TOP_START]).toEqual([4]);
  });

  it('useLogicalPositionQueue_CleanQueue_ShouldDropQueuedItemsOnly', () => {
    const { result } = renderHook(() => useLogicalPositionQueue<number>({ limit: 1 }));

    act(() => result.current.add([1, 2, 3], GlobalLogicalPosition.BOTTOM_END));
    act(() => result.current.cleanQueue(GlobalLogicalPosition.BOTTOM_END));

    expect(result.current.states[GlobalLogicalPosition.BOTTOM_END]).toEqual([1]);
    expect(result.current.queues[GlobalLogicalPosition.BOTTOM_END]).toEqual([]);
  });
});

describe('get-scroll-styles', () => {
  const createState = (): ScrollStylesState => ({
    isEnabled: false,
    previousHTMLStyles: { top: '', left: '' },
    previousScrollPositions: { top: 0, left: 0 }
  });

  const setScrollableBody = (scrollHeight = 2000, scrollWidth = 0) => {
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      value: scrollHeight
    });
    Object.defineProperty(document.body, 'scrollWidth', {
      configurable: true,
      value: scrollWidth
    });
  };

  beforeEach(() => {
    document.documentElement.classList.remove('global-scrollblock');
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
    document.documentElement.getBoundingClientRect = () => ({ top: -100, left: -50 }) as DOMRect;
    window.scroll = jest.fn();
    setScrollableBody();
  });

  afterEach(() => {
    document.documentElement.classList.remove('global-scrollblock');
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
  });

  it('enableScrollStyles_ShouldLockThePageAndCachePreviousStyles', () => {
    const state = { current: createState() };
    document.documentElement.style.top = '5px';
    document.documentElement.style.left = '6px';

    enableScrollStyles(state);

    expect(state.current.isEnabled).toBe(true);
    expect(state.current.previousHTMLStyles).toEqual({ top: '5px', left: '6px' });
    expect(state.current.previousScrollPositions).toEqual({ top: 100, left: 50 });
    expect(document.documentElement.classList.contains('global-scrollblock')).toBe(true);
    expect(document.documentElement.style.top).toBe('-100px');
    expect(document.documentElement.style.left).toBe('-50px');
  });

  it('enableScrollStyles_ShouldBeIdempotent', () => {
    const state = { current: createState() };

    enableScrollStyles(state);
    state.current.previousHTMLStyles = { top: 'changed', left: 'changed' };
    enableScrollStyles(state);

    expect(state.current.previousHTMLStyles).toEqual({ top: 'changed', left: 'changed' });
  });

  it('enableScrollStyles_ShouldSkipWhenThePageCannotScroll', () => {
    setScrollableBody(0, 0);
    const state = { current: createState() };

    enableScrollStyles(state);

    expect(state.current.isEnabled).toBe(false);
    expect(document.documentElement.classList.contains('global-scrollblock')).toBe(false);
  });

  it('disableScrollStyles_ShouldRestoreStylesAndScrollPosition', () => {
    const state = { current: createState() };
    document.documentElement.style.top = '5px';
    document.documentElement.style.left = '6px';

    enableScrollStyles(state);
    disableScrollStyles(state);

    expect(state.current.isEnabled).toBe(false);
    expect(document.documentElement.style.top).toBe('5px');
    expect(document.documentElement.style.left).toBe('6px');
    expect(document.documentElement.classList.contains('global-scrollblock')).toBe(false);
    expect(window.scroll).toHaveBeenCalledWith(50, 100);
  });

  it('disableScrollStyles_ShouldNoopWhenNotEnabled', () => {
    const state = { current: createState() };

    disableScrollStyles(state);

    expect(window.scroll).not.toHaveBeenCalled();
  });

  it('supportsScrollBehavior_ShouldBeCached', () => {
    expect(typeof supportsScrollBehavior()).toBe('boolean');
    expect(supportsScrollBehavior()).toBe(supportsScrollBehavior());
  });
});
