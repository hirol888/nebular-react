import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import {
  useLongPress,
  useOnlineStatus,
  useSwipeGesture,
  type UseLongPressOptions,
  type UseSwipeGestureOptions
} from '@nebular-react/core';

interface PointerEventInit {
  x?: number;
  y?: number;
  pointerType?: string;
  pointerId?: number;
  button?: number;
  isPrimary?: boolean;
}

function pointerEvent(type: string, init: PointerEventInit = {}): MouseEvent {
  const { x = 0, y = 0, pointerType = 'touch', pointerId = 1, button = 0, isPrimary = true } = init;
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button
  });

  Object.defineProperties(event, {
    pointerType: { configurable: true, value: pointerType },
    pointerId: { configurable: true, value: pointerId },
    isPrimary: { configurable: true, value: isPrimary }
  });

  return event;
}

interface LongPressFixtureProps extends Omit<UseLongPressOptions<HTMLDivElement>, 'onLongPress'> {
  onLongPress: jest.Mock;
}

function LongPressFixture({ onLongPress, ...options }: LongPressFixtureProps) {
  const { handlers, pressing } = useLongPress<HTMLDivElement>({ onLongPress, ...options });

  return (
    <div data-testid="gesture-target" {...handlers}>
      <span data-testid="pressing">{pressing ? 'pressing' : 'idle'}</span>
    </div>
  );
}

interface SwipeFixtureProps extends Omit<UseSwipeGestureOptions<HTMLDivElement>, 'onSwipe'> {
  onSwipe: jest.Mock;
}

function SwipeFixture({ onSwipe, ...options }: SwipeFixtureProps) {
  const { handlers, swiping } = useSwipeGesture<HTMLDivElement>({ onSwipe, ...options });

  return (
    <div data-testid="swipe-target" {...handlers}>
      <span data-testid="swiping">{swiping ? 'swiping' : 'idle'}</span>
    </div>
  );
}

describe('useLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('fires after the configured delay and keeps pressing until release', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);

    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    expect(screen.getByTestId('pressing')).toHaveTextContent('pressing');

    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onLongPress.mock.calls[0][0].clientX).toBe(10);
    expect(screen.getByTestId('pressing')).toHaveTextContent('pressing');

    fireEvent(target, pointerEvent('pointerup', { x: 10, y: 10 }));
    expect(screen.getByTestId('pressing')).toHaveTextContent('idle');
  });

  it('honors a custom delay', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} delayMs={200} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));

    act(() => {
      jest.advanceTimersByTime(199);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('cancels when the pointer moves past the threshold', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    fireEvent(target, pointerEvent('pointermove', { x: 21, y: 10 }));
    expect(screen.getByTestId('pressing')).toHaveTextContent('idle');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('tolerates movement up to the threshold', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} moveThreshold={10} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    fireEvent(target, pointerEvent('pointermove', { x: 20, y: 10 }));

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it.each(['pointerup', 'pointercancel', 'pointerout'])('cancels on %s', (eventType: string) => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    fireEvent(target, pointerEvent(eventType, { x: 10, y: 10 }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('pressing')).toHaveTextContent('idle');
  });

  it('clears the pending timer on unmount', () => {
    const onLongPress = jest.fn();
    const { unmount } = render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('ignores mouse pointers by default and accepts them when configured', () => {
    const onLongPress = jest.fn();
    const { rerender } = render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { pointerType: 'mouse' }));
    expect(screen.getByTestId('pressing')).toHaveTextContent('idle');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();

    rerender(<LongPressFixture onLongPress={onLongPress} pointerTypes={['mouse']} />);
    fireEvent(
      screen.getByTestId('gesture-target'),
      pointerEvent('pointerdown', { pointerType: 'mouse' })
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it('ignores secondary buttons and non-primary pointers', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { button: 2 }));
    fireEvent(target, pointerEvent('pointerdown', { isPrimary: false }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('suppresses the click and context menu produced after a long press', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));

    act(() => {
      jest.advanceTimersByTime(500);
    });
    fireEvent(target, pointerEvent('pointerup', { x: 10, y: 10 }));

    expect(fireEvent.click(target)).toBe(false);
    expect(
      fireEvent(target, new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    ).toBe(false);
  });

  it('does not suppress a short press click', () => {
    const onLongPress = jest.fn();

    render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    fireEvent(target, pointerEvent('pointerup', { x: 10, y: 10 }));

    expect(fireEvent.click(target)).toBe(true);
  });

  it('cancels when disabled', () => {
    const onLongPress = jest.fn();
    const { rerender } = render(<LongPressFixture onLongPress={onLongPress} />);
    const target = screen.getByTestId('gesture-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 10, y: 10 }));
    rerender(<LongPressFixture onLongPress={onLongPress} enabled={false} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLongPress).not.toHaveBeenCalled();
    expect(screen.getByTestId('pressing')).toHaveTextContent('idle');
  });
});

describe('useSwipeGesture', () => {
  it.each([
    ['right', 180, 100],
    ['left', 20, 100],
    ['down', 100, 180],
    ['up', 100, 20]
  ] as const)('detects %s swipes', (direction, endX, endY) => {
    const onSwipe = jest.fn();

    render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    expect(screen.getByTestId('swiping')).toHaveTextContent('swiping');
    fireEvent(target, pointerEvent('pointermove', { x: endX, y: endY }));
    fireEvent(target, pointerEvent('pointerup', { x: endX, y: endY }));

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe.mock.calls[0][0]).toBe(direction);
    expect(screen.getByTestId('swiping')).toHaveTextContent('idle');
  });

  it('requires the dominant distance to reach the threshold', () => {
    const onSwipe = jest.fn();

    render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointermove', { x: 139, y: 100 }));
    fireEvent(target, pointerEvent('pointerup', { x: 139, y: 100 }));
    expect(onSwipe).not.toHaveBeenCalled();

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointermove', { x: 140, y: 100 }));
    fireEvent(target, pointerEvent('pointerup', { x: 140, y: 100 }));
    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe.mock.calls[0][0]).toBe('right');
  });

  it('uses the dominant axis', () => {
    const onSwipe = jest.fn();

    render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointermove', { x: 140, y: 139 }));
    fireEvent(target, pointerEvent('pointerup', { x: 140, y: 139 }));

    expect(onSwipe.mock.calls[0][0]).toBe('right');
  });

  it('respects the directions allow list', () => {
    const horizontalOnly = jest.fn();
    const { rerender } = render(
      <SwipeFixture onSwipe={horizontalOnly} directions={['left', 'right']} />
    );
    let target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointerup', { x: 100, y: 200 }));
    expect(horizontalOnly).not.toHaveBeenCalled();

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointerup', { x: 200, y: 100 }));
    expect(horizontalOnly).toHaveBeenCalledWith('right', expect.anything());

    const verticalOnly = jest.fn();
    rerender(<SwipeFixture onSwipe={verticalOnly} directions={['up', 'down']} />);
    target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointerup', { x: 200, y: 100 }));
    expect(verticalOnly).not.toHaveBeenCalled();
  });

  it('ignores movement that was already prevented', () => {
    const onSwipe = jest.fn();

    render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));

    const move = pointerEvent('pointermove', { x: 200, y: 100 });
    move.preventDefault();
    fireEvent(target, move);
    fireEvent(target, pointerEvent('pointerup', { x: 200, y: 100 }));

    expect(onSwipe).not.toHaveBeenCalled();
    expect(screen.getByTestId('swiping')).toHaveTextContent('idle');
  });

  it('ignores mouse pointers by default and accepts them when configured', () => {
    const onSwipe = jest.fn();
    const { rerender } = render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100, pointerType: 'mouse' }));
    fireEvent(target, pointerEvent('pointerup', { x: 200, y: 100, pointerType: 'mouse' }));
    expect(onSwipe).not.toHaveBeenCalled();

    rerender(<SwipeFixture onSwipe={onSwipe} pointerTypes={['mouse']} />);
    fireEvent(
      screen.getByTestId('swipe-target'),
      pointerEvent('pointerdown', { x: 100, y: 100, pointerType: 'mouse' })
    );
    fireEvent(
      screen.getByTestId('swipe-target'),
      pointerEvent('pointerup', { x: 200, y: 100, pointerType: 'mouse' })
    );
    expect(onSwipe).toHaveBeenCalledTimes(1);
  });

  it('cancels on pointer cancel or leave', () => {
    const onSwipe = jest.fn();

    render(<SwipeFixture onSwipe={onSwipe} />);
    const target = screen.getByTestId('swipe-target');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointercancel', { x: 200, y: 100 }));
    expect(screen.getByTestId('swiping')).toHaveTextContent('idle');

    fireEvent(target, pointerEvent('pointerdown', { x: 100, y: 100 }));
    fireEvent(target, pointerEvent('pointerout', { x: 200, y: 100 }));
    expect(screen.getByTestId('swiping')).toHaveTextContent('idle');

    fireEvent(target, pointerEvent('pointerup', { x: 200, y: 100 }));
    expect(onSwipe).not.toHaveBeenCalled();
  });
});

describe('useOnlineStatus', () => {
  afterEach(() => {
    Reflect.deleteProperty(window.navigator, 'onLine');
  });

  it('initializes from navigator.onLine', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('reacts to the online and offline events', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current).toBe(true);
  });

  it('removes its listeners on unmount', () => {
    const removeListener = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeListener).toHaveBeenCalledWith('offline', expect.any(Function));
    removeListener.mockRestore();
  });
});
