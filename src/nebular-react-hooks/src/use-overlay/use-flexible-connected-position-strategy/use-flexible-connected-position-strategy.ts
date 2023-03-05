import React, { useCallback, useRef, useState } from 'react';
import { Direction } from '@nebular-react/styles';
import {
  Dimensions,
  OVERLAY_CONTAINER_CLASS,
  FlexibleFit,
  FallbackPosition,
  ConnectedPosition,
  Point
} from './types';
import { coerceCssPixelValue, extendStyles, getViewportScrollPosition } from '../../utils';
import { getPositions } from '../get-positions/get-positions';
import { Position, PositionAdjustment, POSITIONS } from '../get-positions/types';

export function useFlexibleConnectedPositionStrategy(
  position: Position,
  adjustment: PositionAdjustment,
  trigger: HTMLElement,
  dir: Direction,
  offset = 15,
  margin = 0,
  maxHeight?: number,
  maxWidth?: number,
  transformOriginSelector?: string
): {
  appliedPosition: Position;
  apply: () => void;
  paneRef: React.MutableRefObject<HTMLDivElement>;
  boundingBoxRef: React.MutableRefObject<HTMLDivElement>;
} {
  const [appliedPosition, setAppliedPosition] = useState<Position>();
  const paneRef = useRef<HTMLDivElement>(null);
  const boundingBoxRef = useRef<HTMLDivElement>(null);

  const apply = useCallback(() => {
    const viewportRect = getViewportRect(margin);
    const triggerRect = trigger.getBoundingClientRect();
    const overlayRect = paneRef.current?.getBoundingClientRect();
    const containerRect = document
      .querySelector(`.${OVERLAY_CONTAINER_CLASS}`)!
      .getBoundingClientRect();

    // Positions where the overlay will fit with flexible dimensions.
    const flexibleFits: FlexibleFit[] = [];

    // Fallback if none of the preferred positions fit within the viewport.
    let fallback: FallbackPosition | undefined;

    const _positions = getPositions(position, adjustment);
    const preferredPositions = _positions.map((pos) => POSITIONS[pos](offset) as ConnectedPosition);

    let transformOriginStyles: string;
    let overlayElementStyles: CSSStyleDeclaration;
    let boundingBoxStyles: CSSStyleDeclaration;
    let _appliedPosition: Position;

    // Go through each of the preferred positions looking for a good fit.
    // If a good fit is found, it will be applied immediately.
    preferredPositions.forEach((pos) => {
      // Get the exact (x, y) coordinate for the point-of-origin on the origin element.
      const triggerPoint = getTriggerPoint(triggerRect, containerRect, pos, dir);

      // From that point-of-origin, get the exact (x, y) coordinate for the top-left corner of the
      // overlay in this position. We use the top-left corner for calculations and later translate
      // this into an appropriate (top, left, bottom, right) style.
      const overlayPoint = getOverlayPoint(triggerPoint, overlayRect, pos, dir);

      // Calculate how well the overlay would fit into the viewport with this point.
      const overlayFit = getOverlayFit(overlayPoint, overlayRect, viewportRect);

      // If the overlay, without any further work, fits into the viewport, use this position.
      if (overlayFit.isCompletelyWithinViewport) {
        ({
          transformOriginStyles,
          overlayElementStyles,
          boundingBoxStyles,
          appliedPosition: _appliedPosition
        } = getStyles(
          _positions,
          pos,
          offset,
          triggerPoint,
          paneRef.current,
          dir,
          overlayRect,
          maxHeight,
          maxWidth
        ));
      }

      // If the current preferred position does not fit on the screen, remember the position
      // if it has more visible area on-screen than we've seen and move onto the next preferred
      // position.
      if (!fallback || fallback.overlayFit.visibleArea < overlayFit.visibleArea) {
        fallback = {
          overlayFit,
          overlayPoint,
          originPoint: triggerPoint,
          position: pos,
          overlayRect
        };
      }
    });

    // If there are any positions where the overlay would fit with flexible dimensions, choose the
    // one that has the greatest area available modified by the position's weight
    if (flexibleFits.length) {
      let bestFit: FlexibleFit | null = null;
      let bestScore = -1;
      flexibleFits.forEach((fit) => {
        const score =
          fit.boundingBoxRect.width * fit.boundingBoxRect.height * (fit.position.weight || 1);
        if (score > bestScore) {
          bestScore = score;
          bestFit = fit;
        }
      });

      ({
        transformOriginStyles,
        overlayElementStyles,
        boundingBoxStyles,
        appliedPosition: _appliedPosition
      } = getStyles(
        _positions,
        bestFit!.position,
        offset,
        bestFit!.origin,
        paneRef.current,
        dir,
        overlayRect,
        maxHeight,
        maxWidth
      ));
    }

    // All options for getting the overlay within the viewport have been exhausted, so go with the
    // position that went off-screen the least.
    ({
      transformOriginStyles,
      overlayElementStyles,
      boundingBoxStyles,
      appliedPosition: _appliedPosition
    } = getStyles(
      _positions,
      fallback!.position,
      offset,
      fallback!.originPoint,
      paneRef.current,
      dir,
      overlayRect,
      maxHeight,
      maxWidth
    ));

    setAppliedPosition(_appliedPosition);

    setTransformOrigin(transformOriginSelector, paneRef.current, transformOriginStyles);
    extendStyles(paneRef.current?.style, overlayElementStyles);
    extendStyles(boundingBoxRef.current?.style, boundingBoxStyles);
    boundingBoxRef.current.classList.add('overlay-connected-position-bounding-box');
    boundingBoxRef.current.setAttribute('dir', dir);
  }, [trigger, dir]);

  return { appliedPosition, apply, paneRef, boundingBoxRef };
}

function getViewportRect(viewportMargin: number): Dimensions {
  // We recalculate the viewport rect here ourselves, rather than using the ViewportRuler,
  // because we want to use the `clientWidth` and `clientHeight` as the base. The difference
  // being that the client properties don't include the scrollbar, as opposed to `innerWidth`
  // and `innerHeight` that do. This is necessary, because the overlay container uses
  // 100% `width` and `height` which don't include the scrollbar either.
  const width = document.documentElement!.clientWidth;
  const height = document.documentElement!.clientHeight;
  const scrollPosition = getViewportScrollPosition(window);

  return {
    top: scrollPosition.top + viewportMargin,
    left: scrollPosition.left + viewportMargin,
    right: scrollPosition.left + width - viewportMargin,
    bottom: scrollPosition.top + height - viewportMargin,
    width: width - 2 * viewportMargin,
    height: height - 2 * viewportMargin
  };
}

function setTransformOrigin(
  transformOriginSelector: string,
  pane: HTMLElement,
  transformOriginStyles: string
) {
  const elements: NodeListOf<HTMLElement> = pane.querySelectorAll(transformOriginSelector);

  for (let i = 0; i < elements.length; i++) {
    elements[i].style.transformOrigin = transformOriginStyles;
  }
}

/**
 * Gets the (x, y) coordinate of a connection point on the origin based on a relative position.
 */
function getTriggerPoint(
  triggerRect: Dimensions,
  containerRect: Dimensions,
  pos: ConnectedPosition,
  dir: Direction
): Point {
  let x: number;
  if (pos.originX === 'center') {
    // Note: when centering we should always use the `left`
    // offset, otherwise the position will be wrong in RTL.
    x = triggerRect.left + triggerRect.width / 2;
  } else {
    const startX = dir === 'rtl' ? triggerRect.right : triggerRect.left;
    const endX = dir === 'rtl' ? triggerRect.left : triggerRect.right;
    x = pos.originX === 'start' ? startX : endX;
  }

  // When zooming in Safari the container rectangle contains negative values for the position
  // and we need to re-add them to the calculated coordinates.
  if (containerRect.left < 0) {
    x -= containerRect.left;
  }

  let y: number;
  if (pos.originY === 'center') {
    y = triggerRect.top + triggerRect.height / 2;
  } else {
    y = pos.originY === 'top' ? triggerRect.top : triggerRect.bottom;
  }

  // Normally the containerRect's top value would be zero, however when the overlay is attached to an input
  // (e.g. in an autocomplete), mobile browsers will shift everything in order to put the input in the middle
  // of the screen and to make space for the virtual keyboard. We need to account for this offset,
  // otherwise our positioning will be thrown off.
  // Additionally, when zooming in Safari this fixes the vertical position.
  if (containerRect.top < 0) {
    y -= containerRect.top;
  }

  return { x, y };
}

/**
 * Gets the (x, y) coordinate of the top-left corner of the overlay given a given position and
 * origin point to which the overlay should be connected.
 */
function getOverlayPoint(
  triggerPoint: Point,
  overlayRect: Dimensions,
  pos: ConnectedPosition,
  dir: Direction
): Point {
  // Calculate the (overlayStartX, overlayStartY), the start of the
  // potential overlay position relative to the origin point.
  let paneStartX: number;
  if (pos.overlayX === 'center') {
    paneStartX = -overlayRect.width / 2;
  } else if (pos.overlayX === 'start') {
    paneStartX = dir === 'rtl' ? -overlayRect.width : 0;
  } else {
    paneStartX = dir === 'rtl' ? 0 : -overlayRect.width;
  }

  let paneStartY: number;
  if (pos.overlayY === 'center') {
    paneStartY = -overlayRect.height / 2;
  } else {
    paneStartY = pos.overlayY === 'top' ? 0 : -overlayRect.height;
  }

  // The (x, y) coordinates of the overlay.
  return {
    x: triggerPoint.x + paneStartX,
    y: triggerPoint.y + paneStartY
  };
}

/** Gets how well an overlay at the given point will fit within the viewport. */
function getOverlayFit(point: Point, rawOverlayRect: Dimensions, viewport: Dimensions) {
  // Round the overlay rect when comparing against the
  // viewport, because the viewport is always rounded.
  const overlay = getRoundedBoundingClientRect(rawOverlayRect);
  const { x, y } = point;

  // How much the overlay would overflow at this position, on each side.
  const leftOverflow = 0 - x;
  const rightOverflow = x + overlay.width - viewport.width;
  const topOverflow = 0 - y;
  const bottomOverflow = y + overlay.height - viewport.height;

  // Visible parts of the element on each axis.
  const visibleWidth = subtractOverflows(overlay.width, leftOverflow, rightOverflow);
  const visibleHeight = subtractOverflows(overlay.height, topOverflow, bottomOverflow);
  const visibleArea = visibleWidth * visibleHeight;

  return {
    visibleArea,
    isCompletelyWithinViewport: overlay.width * overlay.height === visibleArea,
    fitsInViewportVertically: visibleHeight === overlay.height,
    fitsInViewportHorizontally: visibleWidth === overlay.width
  };
}

/**
 * Gets a version of an element's bounding `ClientRect` where all the values are rounded down to
 * the nearest pixel. This allows us to account for the cases where there may be sub-pixel
 * deviations in the `ClientRect` returned by the browser (e.g. when zoomed in with a percentage
 * size, see #21350).
 */
function getRoundedBoundingClientRect(clientRect: Dimensions): Dimensions {
  return {
    top: Math.floor(clientRect.top),
    right: Math.floor(clientRect.right),
    bottom: Math.floor(clientRect.bottom),
    left: Math.floor(clientRect.left),
    width: Math.floor(clientRect.width),
    height: Math.floor(clientRect.height)
  };
}

/** Subtracts the amount that an element is overflowing on an axis from its length. */
function subtractOverflows(length: number, ...overflows: number[]): number {
  return overflows.reduce(
    (currentValue: number, currentOverflow: number) => currentValue - Math.max(currentOverflow, 0),
    length
  );
}

/**
 * Applies a computed position to the overlay and emits a position change.
 * @param position The position preference
 * @param originPoint The point on the origin element where the overlay is connected.
 */
function getStyles(
  positions: Position[],
  position: ConnectedPosition,
  offset: number,
  originPoint: Point,
  pane: HTMLElement,
  dir: Direction,
  overlayRect: Dimensions,
  maxHeight?: number,
  maxWidth?: number
): {
  transformOriginStyles: string;
  overlayElementStyles: CSSStyleDeclaration;
  boundingBoxStyles: CSSStyleDeclaration;
  appliedPosition: Position;
} {
  const transformOriginStyles = getTransformOriginStyles(position, pane, dir);
  const overlayElementStyles = getOverlayElementStyles(
    originPoint,
    position,
    overlayRect,
    dir,
    maxHeight,
    maxWidth
  );
  const boundingBoxStyles = getBoundingBoxStyles();

  const appliedPosition = positions.find((_pos) =>
    comparePositions(POSITIONS[_pos](offset), position)
  );

  return { transformOriginStyles, overlayElementStyles, boundingBoxStyles, appliedPosition };
}

/** Sets the transform origin based on the configured selector and the passed-in position.  */
function getTransformOriginStyles(
  position: ConnectedPosition,
  boundingBox: HTMLElement,
  dir: Direction
): string {
  let xOrigin: 'left' | 'right' | 'center';
  const yOrigin: 'top' | 'bottom' | 'center' = position.overlayY;

  if (position.overlayX === 'center') {
    xOrigin = 'center';
  } else if (dir === 'rtl') {
    xOrigin = position.overlayX === 'start' ? 'right' : 'left';
  } else {
    xOrigin = position.overlayX === 'start' ? 'left' : 'right';
  }

  return `${xOrigin} ${yOrigin}`;
}

/** Sets positioning styles to the overlay element. */
function getOverlayElementStyles(
  originPoint: Point,
  position: ConnectedPosition,
  overlayRect: Dimensions,
  dir: Direction,
  maxHeight?: number,
  maxWidth?: number
): CSSStyleDeclaration {
  const styles = {} as CSSStyleDeclaration;

  extendStyles(styles, getExactOverlayY(position, originPoint, overlayRect, dir));
  extendStyles(styles, getExactOverlayX(position, originPoint, overlayRect, dir));

  // Use a transform to apply the offsets. We do this because the `center` positions rely on
  // being in the normal flex flow and setting a `top` / `left` at all will completely throw
  // off the position. We also can't use margins, because they won't have an effect in some
  // cases where the element doesn't have anything to "push off of". Finally, this works
  // better both with flexible and non-flexible positioning.
  let transformString = '';
  if (position.offsetX) {
    transformString += `translateX(${position.offsetX}px)`;
  }
  if (position.offsetY) {
    transformString += `translateY(${position.offsetY}px)`;
  }

  styles.transform = transformString.trim();

  // If a maxWidth or maxHeight is specified on the overlay, we remove them. We do this because
  // we need these values to both be set to "100%" for the automatic flexible sizing to work.
  // The maxHeight and maxWidth are set on the boundingBox in order to enforce the constraint.
  // Note that this doesn't apply when we have an exact position, in which case we do want to
  // apply them because they'll be cleared from the bounding box.
  if (maxHeight) {
    styles.maxHeight = coerceCssPixelValue(maxHeight);
  }

  if (maxWidth) {
    styles.maxWidth = coerceCssPixelValue(maxWidth);
  }

  return styles;
}

/** Gets the exact top/bottom for the overlay when not using flexible sizing or when pushing. */
function getExactOverlayY(
  position: ConnectedPosition,
  originPoint: Point,
  overlayRect: Dimensions,
  dir: Direction
): CSSStyleDeclaration {
  // Reset any existing styles. This is necessary in case the
  // preferred position has changed since the last `apply`.
  const styles = { top: '', bottom: '' } as CSSStyleDeclaration;
  const overlayPoint = getOverlayPoint(originPoint, overlayRect, position, dir);

  // We want to set either `top` or `bottom` based on whether the overlay wants to appear
  // above or below the origin and the direction in which the element will expand.
  if (position.overlayY === 'bottom') {
    // When using `bottom`, we adjust the y position such that it is the distance
    // from the bottom of the viewport rather than the top.
    const documentHeight = document.documentElement!.clientHeight;
    styles.bottom = `${documentHeight - (overlayPoint.y + overlayRect.height)}px`;
  } else {
    styles.top = coerceCssPixelValue(overlayPoint.y);
  }

  return styles;
}

/** Gets the exact left/right for the overlay when not using flexible sizing or when pushing. */
function getExactOverlayX(
  position: ConnectedPosition,
  originPoint: Point,
  overlayRect: Dimensions,
  dir: Direction
): CSSStyleDeclaration {
  // Reset any existing styles. This is necessary in case the preferred position has
  // changed since the last `apply`.
  const styles = { left: '', right: '' } as CSSStyleDeclaration;
  const overlayPoint = getOverlayPoint(originPoint, overlayRect, position, dir);

  // We want to set either `left` or `right` based on whether the overlay wants to appear "before"
  // or "after" the origin, which determines the direction in which the element will expand.
  // For the horizontal axis, the meaning of "before" and "after" change based on whether the
  // page is in RTL or LTR.
  let horizontalStyleProperty: 'left' | 'right';

  if (dir === 'rtl') {
    horizontalStyleProperty = position.overlayX === 'end' ? 'left' : 'right';
  } else {
    horizontalStyleProperty = position.overlayX === 'end' ? 'right' : 'left';
  }

  // When we're setting `right`, we adjust the x position such that it is the distance
  // from the right edge of the viewport rather than the left edge.
  if (horizontalStyleProperty === 'right') {
    const documentWidth = document.documentElement!.clientWidth;
    styles.right = `${documentWidth - (overlayPoint.x + overlayRect.width)}px`;
  } else {
    styles.left = coerceCssPixelValue(overlayPoint.x);
  }

  return styles;
}

/**
 * Sets the position and size of the overlay's sizing wrapper. The wrapper is positioned on the
 * origin's connection point and stetches to the bounds of the viewport.
 *
 * @param origin The point on the origin element where the overlay is connected.
 * @param position The position preference
 */
function getBoundingBoxStyles(): CSSStyleDeclaration {
  const styles = {} as CSSStyleDeclaration;

  styles.top = styles.left = '0';
  styles.bottom = styles.right = styles.maxHeight = styles.maxWidth = '';
  styles.width = styles.height = '100%';

  return styles;
}

function comparePositions(p1: ConnectedPosition, p2: ConnectedPosition): boolean {
  return (
    p1.originX === p2.originX &&
    p1.originY === p2.originY &&
    p1.overlayX === p2.overlayX &&
    p1.overlayY === p2.overlayY
  );
}
