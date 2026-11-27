import { act, renderHook } from '@testing-library/react';
import { useMeasure, useMeasureElement } from '@nebular-react/hooks';

type ObserverCallback = (entries: ResizeObserverEntry[]) => void;

const originalResizeObserver = window.ResizeObserver;
const observe = jest.fn();
const disconnect = jest.fn();
let observerCallback: ObserverCallback | null = null;

class MockResizeObserver {
  constructor(callback: ObserverCallback) {
    observerCallback = callback;
  }

  observe = observe;

  unobserve = jest.fn();

  disconnect = disconnect;
}

function createElement() {
  const element = document.createElement('div');

  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 1,
      y: 2,
      width: 30,
      height: 40,
      top: 2,
      left: 1,
      bottom: 42,
      right: 31
    })
  });

  return element;
}

describe('use-measure', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: MockResizeObserver
    });
  });

  beforeEach(() => {
    observe.mockClear();
    disconnect.mockClear();
    observerCallback = null;
  });

  afterAll(() => {
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      writable: true,
      value: originalResizeObserver
    });
  });

  it('observes the referenced element and reports its rect', () => {
    const element = createElement();
    const { result, unmount } = renderHook(() => useMeasure());

    expect(result.current[1]).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    });

    act(() => result.current[0](element));
    expect(observe).toHaveBeenCalledWith(element);

    act(() => {
      observerCallback?.([{ target: element } as unknown as ResizeObserverEntry]);
    });

    expect(result.current[1]).toEqual({
      x: 1,
      y: 2,
      width: 30,
      height: 40,
      top: 2,
      left: 1,
      bottom: 42,
      right: 31
    });

    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it('ignores empty observer entries', () => {
    const { result } = renderHook(() => useMeasure());

    act(() => {
      observerCallback?.([]);
    });

    expect(result.current[1].width).toBe(0);
  });

  it('keeps a null ref inert', () => {
    renderHook(() => useMeasure());

    expect(observe).not.toHaveBeenCalled();
  });

  it('measures an element passed by the consumer', () => {
    const element = createElement();
    const { result, rerender } = renderHook(({ target }) => useMeasureElement(target), {
      initialProps: { target: element as Element | undefined }
    });

    expect(observe).toHaveBeenCalledWith(element);

    act(() => {
      observerCallback?.([{ target: element } as unknown as ResizeObserverEntry]);
    });

    expect(result.current).toMatchObject({ width: 30, height: 40 });

    rerender({ target: undefined });
    expect(disconnect).toHaveBeenCalled();

    observe.mockClear();
    rerender({ target: undefined });
    expect(observe).not.toHaveBeenCalled();
  });
});
