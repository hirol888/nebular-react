import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

/** Pointer input types accepted by the desktop gesture hooks. */
export type DesktopGesturePointerType = 'touch' | 'pen' | 'mouse';

/** Directions reported by `useSwipeGesture`. */
export type DesktopSwipeDirection = 'up' | 'down' | 'left' | 'right';

export const DESKTOP_LONG_PRESS_DEFAULT_DELAY = 500;
export const DESKTOP_LONG_PRESS_DEFAULT_MOVE_THRESHOLD = 10;
export const DESKTOP_SWIPE_DEFAULT_THRESHOLD = 40;

const DEFAULT_GESTURE_POINTER_TYPES: readonly DesktopGesturePointerType[] = ['touch', 'pen'];
const DEFAULT_SWIPE_DIRECTIONS: readonly DesktopSwipeDirection[] = ['up', 'down', 'left', 'right'];

function isAllowedPointerType(
  pointerType: string | undefined,
  allowed: readonly DesktopGesturePointerType[]
): boolean {
  // Older browsers and synthetic events may omit pointerType. Treat those as a
  // primary touch pointer so the hooks still work in tests and progressive apps.
  if (!pointerType) {
    return true;
  }

  return allowed.includes(pointerType.toLowerCase() as DesktopGesturePointerType);
}

function isPrimaryPointerDown(event: { button?: number; isPrimary?: boolean }): boolean {
  // Synthetic events in tests may omit `button`; treat that as the primary button.
  return (event.button === undefined || event.button === 0) && event.isPrimary !== false;
}

function getOnlineStatus(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') {
    return true;
  }

  return navigator.onLine;
}

export interface DesktopLongPressHandlers<T extends HTMLElement = HTMLElement> {
  onPointerDown(event: ReactPointerEvent<T>): void;
  onPointerMove(event: ReactPointerEvent<T>): void;
  onPointerUp(event: ReactPointerEvent<T>): void;
  onPointerCancel(event: ReactPointerEvent<T>): void;
  /** Cancels the pending press when the pointer leaves the element. */
  onPointerLeave(event: ReactPointerEvent<T>): void;
  /** Swallows the synthetic click produced after a long press. */
  onClick(event: ReactMouseEvent<T>): void;
  /** Swallows the context menu produced by a long press on touch devices. */
  onContextMenu(event: ReactMouseEvent<T>): void;
}

export interface UseLongPressOptions<T extends HTMLElement = HTMLElement> {
  /** Called once the pointer has been held for `delayMs` without moving. */
  onLongPress(event: ReactPointerEvent<T>): void;
  /** Hold duration in milliseconds. Defaults to 500. */
  delayMs?: number;
  /** Movement in pixels that cancels the press. Defaults to 10. */
  moveThreshold?: number;
  /** Disables the gesture without unmounting the handlers. Defaults to true. */
  enabled?: boolean;
  /** Pointer types accepted by the gesture. Defaults to touch and pen. */
  pointerTypes?: readonly DesktopGesturePointerType[];
}

export interface UseLongPressResult<T extends HTMLElement = HTMLElement> {
  handlers: DesktopLongPressHandlers<T>;
  /** True while a valid pointer is held down on the element. */
  pressing: boolean;
}

interface LongPressState {
  pointerId: number;
  x: number;
  y: number;
}

/**
 * Detects a long press with pointer events.
 *
 * The handlers are safe to spread on any interactive desktop surface. The
 * click and context menu emitted after a long press are suppressed until the
 * next pointer down so touch devices do not trigger the underlying action.
 */
export function useLongPress<T extends HTMLElement = HTMLElement>(
  options: UseLongPressOptions<T>
): UseLongPressResult<T> {
  const {
    onLongPress,
    delayMs = DESKTOP_LONG_PRESS_DEFAULT_DELAY,
    moveThreshold = DESKTOP_LONG_PRESS_DEFAULT_MOVE_THRESHOLD,
    enabled = true,
    pointerTypes = DEFAULT_GESTURE_POINTER_TYPES
  } = options;
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressRef = useRef<LongPressState | null>(null);
  const longPressFiredRef = useRef(false);
  const suppressClickRef = useRef(false);
  const optionsRef = useRef({ onLongPress, delayMs, moveThreshold, enabled, pointerTypes });
  optionsRef.current = { onLongPress, delayMs, moveThreshold, enabled, pointerTypes };

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cancelPress = useCallback(() => {
    clearTimer();
    pressRef.current = null;
    setPressing(false);
  }, [clearTimer]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      pressRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      cancelPress();
    }
  }, [enabled, cancelPress]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<T>) => {
      const currentOptions = optionsRef.current;
      const activePress = pressRef.current;

      if (activePress && activePress.pointerId !== event.pointerId) {
        return;
      }

      if (
        !currentOptions.enabled ||
        !isPrimaryPointerDown(event) ||
        !isAllowedPointerType(event.pointerType, currentOptions.pointerTypes)
      ) {
        return;
      }

      clearTimer();
      pressRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      longPressFiredRef.current = false;
      suppressClickRef.current = false;
      setPressing(true);

      timerRef.current = setTimeout(
        () => {
          timerRef.current = null;

          if (!pressRef.current) {
            return;
          }

          longPressFiredRef.current = true;
          suppressClickRef.current = true;
          optionsRef.current.onLongPress(event);
        },
        Math.max(0, currentOptions.delayMs)
      );
    },
    [clearTimer]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const activePress = pressRef.current;

      if (!activePress || activePress.pointerId !== event.pointerId) {
        return;
      }

      const threshold = Math.max(0, optionsRef.current.moveThreshold);
      const dx = event.clientX - activePress.x;
      const dy = event.clientY - activePress.y;

      if (dx * dx + dy * dy > threshold * threshold) {
        cancelPress();
      }
    },
    [cancelPress]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<T>) => {
      const activePress = pressRef.current;

      if (!activePress || activePress.pointerId !== event.pointerId) {
        return;
      }

      const fired = longPressFiredRef.current;
      cancelPress();

      if (fired && event.cancelable) {
        event.preventDefault();
      }
    },
    [cancelPress]
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<T>) => {
      const activePress = pressRef.current;

      if (!activePress || activePress.pointerId !== event.pointerId) {
        return;
      }

      cancelPress();
    },
    [cancelPress]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<T>) => {
      const activePress = pressRef.current;

      if (!activePress || activePress.pointerId !== event.pointerId) {
        return;
      }

      cancelPress();
    },
    [cancelPress]
  );

  const handleClick = useCallback((event: ReactMouseEvent<T>) => {
    if (!suppressClickRef.current) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleContextMenu = useCallback((event: ReactMouseEvent<T>) => {
    if (!longPressFiredRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handlers = useMemo<DesktopLongPressHandlers<T>>(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
      onClick: handleClick,
      onContextMenu: handleContextMenu
    }),
    [
      handlePointerDown,
      handlePointerMove,
      handlePointerUp,
      handlePointerCancel,
      handlePointerLeave,
      handleClick,
      handleContextMenu
    ]
  );

  return { handlers, pressing };
}

export interface DesktopSwipeHandlers<T extends HTMLElement = HTMLElement> {
  onPointerDown(event: ReactPointerEvent<T>): void;
  onPointerMove(event: ReactPointerEvent<T>): void;
  onPointerUp(event: ReactPointerEvent<T>): void;
  onPointerCancel(event: ReactPointerEvent<T>): void;
  /** Cancels the gesture when the pointer leaves the element. */
  onPointerLeave(event: ReactPointerEvent<T>): void;
}

export interface UseSwipeGestureOptions<T extends HTMLElement = HTMLElement> {
  /** Called on pointer up when the dominant movement passes `threshold`. */
  onSwipe(direction: DesktopSwipeDirection, event: ReactPointerEvent<T>): void;
  /** Minimum dominant distance in pixels. Defaults to 40. */
  threshold?: number;
  /** Directions that should be reported. Defaults to all four directions. */
  directions?: readonly DesktopSwipeDirection[];
  /** Disables the gesture without unmounting the handlers. Defaults to true. */
  enabled?: boolean;
  /** Pointer types accepted by the gesture. Defaults to touch and pen. */
  pointerTypes?: readonly DesktopGesturePointerType[];
}

export interface UseSwipeGestureResult<T extends HTMLElement = HTMLElement> {
  handlers: DesktopSwipeHandlers<T>;
  /** True while a valid pointer is held down on the element. */
  swiping: boolean;
}

interface SwipeState {
  pointerId: number;
  x: number;
  y: number;
}

/**
 * Detects a single-finger swipe with pointer events.
 *
 * Movement events already consumed by another handler (`defaultPrevented`)
 * abort the gesture so nested draggable surfaces keep working.
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>(
  options: UseSwipeGestureOptions<T>
): UseSwipeGestureResult<T> {
  const {
    onSwipe,
    threshold = DESKTOP_SWIPE_DEFAULT_THRESHOLD,
    directions = DEFAULT_SWIPE_DIRECTIONS,
    enabled = true,
    pointerTypes = DEFAULT_GESTURE_POINTER_TYPES
  } = options;
  const [swiping, setSwiping] = useState(false);
  const stateRef = useRef<SwipeState | null>(null);
  const optionsRef = useRef({ onSwipe, threshold, directions, enabled, pointerTypes });
  optionsRef.current = { onSwipe, threshold, directions, enabled, pointerTypes };

  const cancelSwipe = useCallback(() => {
    stateRef.current = null;
    setSwiping(false);
  }, []);

  useEffect(
    () => () => {
      stateRef.current = null;
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      cancelSwipe();
    }
  }, [enabled, cancelSwipe]);

  const handlePointerDown = useCallback((event: ReactPointerEvent<T>) => {
    const currentOptions = optionsRef.current;

    if (
      !currentOptions.enabled ||
      event.defaultPrevented ||
      !isPrimaryPointerDown(event) ||
      !isAllowedPointerType(event.pointerType, currentOptions.pointerTypes)
    ) {
      return;
    }

    if (stateRef.current) {
      if (stateRef.current.pointerId !== event.pointerId) {
        return;
      }

      stateRef.current = null;
    }

    stateRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    setSwiping(true);
  }, []);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      const state = stateRef.current;

      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      if (event.defaultPrevented) {
        cancelSwipe();
      }
    },
    [cancelSwipe]
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<T>) => {
      const state = stateRef.current;

      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      if (event.defaultPrevented) {
        cancelSwipe();
        return;
      }

      const currentOptions = optionsRef.current;
      const dx = event.clientX - state.x;
      const dy = event.clientY - state.y;
      const distanceX = Math.abs(dx);
      const distanceY = Math.abs(dy);
      const distance = Math.max(distanceX, distanceY);

      cancelSwipe();

      if (distance < Math.max(0, currentOptions.threshold)) {
        return;
      }

      const direction: DesktopSwipeDirection =
        distanceX >= distanceY ? (dx >= 0 ? 'right' : 'left') : dy >= 0 ? 'down' : 'up';

      if (!currentOptions.directions.includes(direction)) {
        return;
      }

      currentOptions.onSwipe(direction, event);
    },
    [cancelSwipe]
  );

  const handlePointerCancel = useCallback(
    (event: ReactPointerEvent<T>) => {
      const state = stateRef.current;

      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      cancelSwipe();
    },
    [cancelSwipe]
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<T>) => {
      const state = stateRef.current;

      if (!state || state.pointerId !== event.pointerId) {
        return;
      }

      cancelSwipe();
    },
    [cancelSwipe]
  );

  const handlers = useMemo<DesktopSwipeHandlers<T>>(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel, handlePointerLeave]
  );

  return { handlers, swiping };
}

/**
 * Tracks browser connectivity. Safe during SSR: the server render assumes
 * online and the client reconciles with `navigator.onLine` after mounting.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(getOnlineStatus);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(getOnlineStatus());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
