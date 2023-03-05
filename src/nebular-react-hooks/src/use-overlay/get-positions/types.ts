export type Position =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'start'
  | 'end'
  | 'top-end'
  | 'top-start'
  | 'bottom-end'
  | 'bottom-start'
  | 'end-top'
  | 'end-bottom'
  | 'start-top'
  | 'start-bottom';
export type PositionAdjustment =
  | 'noop'
  | 'clockwise'
  | 'counterclockwise'
  | 'vertical'
  | 'horizontal';

export const POSITIONS = {
  right(offset: number) {
    return {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: offset
    };
  },
  bottom(offset: number) {
    return {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: offset
    };
  },
  left(offset: number) {
    return {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -offset
    };
  },
  top(offset: number) {
    return {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -offset
    };
  },
  start(offset: number) {
    return this.left(offset);
  },
  end(offset: number) {
    return this.right(offset);
  },
  'end-top': function (offset: number) {
    return {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetX: offset
    };
  },
  'end-bottom': function (offset: number) {
    return { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offset };
  },
  'bottom-start': function (offset: number) {
    return { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: offset };
  },
  'bottom-end': function (offset: number) {
    return {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: offset
    };
  },
  'start-top': function (offset: number) {
    return {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetX: -offset
    };
  },
  'start-bottom': function (offset: number) {
    return { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offset };
  },
  'top-start': function (offset: number) {
    return {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -offset
    };
  },
  'top-end': function (offset: number) {
    return {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -offset
    };
  }
};

export const COUNTER_CLOCKWISE_POSITIONS: Position[] = [
  'top',
  'top-end',
  'top-start',
  'start',
  'start-top',
  'start-bottom',
  'bottom',
  'bottom-start',
  'bottom-end',
  'end',
  'end-bottom',
  'end-top'
];
export const CLOCKWISE_POSITIONS: Position[] = [
  'top',
  'top-start',
  'top-end',
  'end',
  'end-top',
  'end-bottom',
  'bottom',
  'bottom-end',
  'bottom-start',
  'start',
  'start-bottom',
  'start-top'
];
export const VERTICAL_POSITIONS: Position[] = ['bottom', 'top'];
export const HORIZONTAL_POSITIONS: Position[] = ['start', 'end'];
