export const OVERLAY_CONTAINER_CLASS = 'overlay-container';

export interface ConnectedPosition {
  originX: 'start' | 'center' | 'end';
  originY: 'top' | 'center' | 'bottom';

  overlayX: 'start' | 'center' | 'end';
  overlayY: 'top' | 'center' | 'bottom';

  weight?: number;
  offsetX?: number;
  offsetY?: number;
}

/** Equivalent of `DOMRect` without some of the properties we don't care about. */
export type Dimensions = Omit<DOMRect, 'x' | 'y' | 'toJSON'>;

/** Record of measures determining how well a given position will fit with flexible dimensions. */
export interface FlexibleFit {
  position: ConnectedPosition;
  origin: Point;
  overlayRect: Dimensions;
  boundingBoxRect: BoundingBoxRect;
}

/** A simple (x, y) coordinate. */
export interface Point {
  x: number;
  y: number;
}

/** Position and size of the overlay sizing wrapper for a specific position. */
export interface BoundingBoxRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  height: number;
  width: number;
}

/** Record of the measurements determining whether an overlay will fit in a specific position. */
export interface FallbackPosition {
  position: ConnectedPosition;
  originPoint: Point;
  overlayPoint: Point;
  overlayFit: OverlayFit;
  overlayRect: Dimensions;
}

/** Record of measurements for how an overlay (at a given position) fits into the viewport. */
export interface OverlayFit {
  /** Whether the overlay fits completely in the viewport. */
  isCompletelyWithinViewport: boolean;

  /** Whether the overlay fits in the viewport on the y-axis. */
  fitsInViewportVertically: boolean;

  /** Whether the overlay fits in the viewport on the x-axis. */
  fitsInViewportHorizontally: boolean;

  /** The total visible area (in px^2) of the overlay inside the viewport. */
  visibleArea: number;
}
