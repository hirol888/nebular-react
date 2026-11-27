import { act, renderHook } from '@testing-library/react';
import { useListKeyManager } from '@nebular-react/hooks';

const items = [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }];

describe('useListKeyManager', () => {
  function press(
    result: { current: ReturnType<typeof useListKeyManager> },
    key: string,
    init: KeyboardEventInit = {}
  ) {
    const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init });
    act(() => result.current.onKeyDown(event));
    return event;
  }

  it('useListKeyManager_ArrowKeys_ShouldMoveAndPreventDefault', () => {
    const { result } = renderHook(() => useListKeyManager(items));

    const down = press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(1);
    expect(down.defaultPrevented).toBe(true);

    press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(2);

    press(result, 'ArrowUp');
    expect(result.current.activeItemIndex).toBe(1);
  });

  it('useListKeyManager_HomeAndEnd_ShouldJumpToBounds', () => {
    const { result } = renderHook(() => useListKeyManager(items));

    press(result, 'End');
    expect(result.current.activeItemIndex).toBe(2);

    press(result, 'Home');
    expect(result.current.activeItemIndex).toBe(0);
  });

  it('useListKeyManager_HomeAndEndDisabled_ShouldIgnoreTheKeys', () => {
    const { result } = renderHook(() =>
      useListKeyManager(items, undefined, 0, null, undefined, true, true, [], false)
    );

    const home = press(result, 'Home');
    const end = press(result, 'End');

    expect(result.current.activeItemIndex).toBe(0);
    expect(home.defaultPrevented).toBe(false);
    expect(end.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_Wrap_ShouldCycleAndSkipDisabledItems', () => {
    const withDisabled = [
      { label: 'Apple' },
      { label: 'Banana', disabled: true },
      { label: 'Cherry' }
    ];
    const { result } = renderHook(() => useListKeyManager(withDisabled));

    press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(2);

    press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(0);

    press(result, 'ArrowUp');
    expect(result.current.activeItemIndex).toBe(2);
  });

  it('useListKeyManager_WithoutWrap_ShouldStopAtTheEdges', () => {
    const { result } = renderHook(() =>
      useListKeyManager(items, undefined, 0, null, undefined, false)
    );

    press(result, 'ArrowUp');
    expect(result.current.activeItemIndex).toBe(0);

    press(result, 'End');
    press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(2);
  });

  it('useListKeyManager_CustomSkipPredicate_ShouldBeRespected', () => {
    const { result } = renderHook(() =>
      useListKeyManager(items, undefined, 0, null, (item) => item.label === 'Banana')
    );

    press(result, 'ArrowDown');
    expect(result.current.activeItemIndex).toBe(2);
  });

  it('useListKeyManager_HorizontalLtr_ShouldMoveWithLeftAndRight', () => {
    const { result } = renderHook(() => useListKeyManager(items, undefined, 0, 'ltr'));

    press(result, 'ArrowRight');
    expect(result.current.activeItemIndex).toBe(1);

    press(result, 'ArrowLeft');
    expect(result.current.activeItemIndex).toBe(0);
  });

  it('useListKeyManager_HorizontalRtl_ShouldInvertLeftAndRight', () => {
    const { result } = renderHook(() => useListKeyManager(items, undefined, 0, 'rtl'));

    press(result, 'ArrowRight');
    expect(result.current.activeItemIndex).toBe(2);

    press(result, 'ArrowLeft');
    expect(result.current.activeItemIndex).toBe(0);
  });

  it('useListKeyManager_WithoutDirection_ShouldIgnoreHorizontalKeys', () => {
    const { result } = renderHook(() => useListKeyManager(items, undefined, 0, null));

    const right = press(result, 'ArrowRight');
    const left = press(result, 'ArrowLeft');

    expect(result.current.activeItemIndex).toBe(0);
    expect(right.defaultPrevented).toBe(false);
    expect(left.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_VerticalDisabled_ShouldIgnoreVerticalKeys', () => {
    const { result } = renderHook(() =>
      useListKeyManager(items, undefined, 0, null, undefined, true, false)
    );

    const down = press(result, 'ArrowDown');
    const up = press(result, 'ArrowUp');

    expect(result.current.activeItemIndex).toBe(0);
    expect(down.defaultPrevented).toBe(false);
    expect(up.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_Modifiers_ShouldBlockUnlistedModifiers', () => {
    const { result } = renderHook(() => useListKeyManager(items));

    const event = press(result, 'ArrowDown', { ctrlKey: true });

    expect(result.current.activeItemIndex).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_AllowedModifier_ShouldAllowNavigation', () => {
    const { result } = renderHook(() =>
      useListKeyManager(items, undefined, 0, null, undefined, true, true, ['ctrlKey'])
    );

    const event = press(result, 'ArrowDown', { ctrlKey: true });

    expect(result.current.activeItemIndex).toBe(1);
    expect(event.defaultPrevented).toBe(true);

    const blocked = press(result, 'ArrowDown', { altKey: true });
    expect(blocked.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_Tab_ShouldCallTheTabOutHandler', () => {
    const onTabOut = jest.fn();
    const { result } = renderHook(() => useListKeyManager(items, onTabOut));

    const event = press(result, 'Tab');

    expect(onTabOut).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
  });

  it('useListKeyManager_NegativeInitialIndex_ShouldStartFromTheEdges', () => {
    const { result } = renderHook(() => useListKeyManager(items, undefined, -1));

    act(() => result.current.setNextItemActive());
    expect(result.current.activeItemIndex).toBe(0);

    act(() => result.current.setPreviousItemActive());
    expect(result.current.activeItemIndex).toBe(2);
  });

  it('useListKeyManager_SetActiveItemByIndex_ShouldIgnoreInvalidIndexes', () => {
    const { result } = renderHook(() => useListKeyManager(items));

    act(() => result.current.setActiveItemByIndex(10));
    expect(result.current.activeItemIndex).toBe(0);

    act(() => result.current.setActiveItemByIndex(-5));
    expect(result.current.activeItemIndex).toBe(0);
  });

  it('useListKeyManager_AllItemsSkipped_ShouldKeepTheCurrentIndex', () => {
    const allDisabled = [
      { label: 'Apple', disabled: true },
      { label: 'Banana', disabled: true }
    ];
    const { result } = renderHook(() => useListKeyManager(allDisabled, undefined, 0));

    act(() => result.current.setLastItemActive());
    expect(result.current.activeItemIndex).toBe(0);
  });

  it('useListKeyManager_TypeAhead_ShouldFindTheNextMatchingItem', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useListKeyManager(items));

    try {
      const event = press(result, 'b');
      expect(event.defaultPrevented).toBe(false);

      act(() => jest.advanceTimersByTime(200));

      expect(result.current.activeItemIndex).toBe(1);
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });

  it('useListKeyManager_TypeAheadWithShift_ShouldBeAllowed', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useListKeyManager(items));

    try {
      press(result, 'c', { shiftKey: true });
      act(() => jest.advanceTimersByTime(200));

      expect(result.current.activeItemIndex).toBe(2);
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });

  it('useListKeyManager_UnknownKey_ShouldNotPreventDefault', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useListKeyManager(items));

    try {
      const event = press(result, 'Enter');
      expect(event.defaultPrevented).toBe(false);
      act(() => jest.advanceTimersByTime(200));
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });
});
