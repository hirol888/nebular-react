/** Object that holds the scroll position of the viewport in each direction. */
export interface ViewportScrollPosition {
  top: number;
  left: number;
}

/** Gets the (top, left) scroll position of the viewport. */
export function getViewportScrollPosition(
  window: Window & typeof globalThis
): ViewportScrollPosition {
  // The top-left-corner of the viewport is determined by the scroll position of the document
  // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
  // whether `document.body` or `document.documentElement` is the scrolled element, so reading
  // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
  // `document.documentElement` works consistently, where the `top` and `left` values will
  // equal negative the scroll position.
  const documentElement = document.documentElement!;
  const documentRect = documentElement.getBoundingClientRect();

  const top =
    -documentRect.top ||
    document.body.scrollTop ||
    window.scrollY ||
    documentElement.scrollTop ||
    0;

  const left =
    -documentRect.left ||
    document.body.scrollLeft ||
    window.scrollX ||
    documentElement.scrollLeft ||
    0;

  return { top, left };
}

/** Returns the viewport's width and height. */
export function getViewportSize(
  window: Window & typeof globalThis
): Readonly<{ width: number; height: number }> {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}
