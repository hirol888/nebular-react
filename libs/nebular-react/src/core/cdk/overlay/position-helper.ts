import { injectable } from 'inversify';
import { NbLayoutDirectionService } from '../../services';

export type NbAdjustmentValues = 'noop' | 'clockwise' | 'counterclockwise' | 'vertical' | 'horizontal';
export enum NbAdjustment {
  NOOP = 'noop',
  CLOCKWISE = 'clockwise',
  COUNTERCLOCKWISE = 'counterclockwise',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal'
}

// eslint-disable-next-line max-len
export type NbPositionValues =
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
export enum NbPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  START = 'start',
  END = 'end',
  TOP_END = 'top-end',
  TOP_START = 'top-start',
  BOTTOM_END = 'bottom-end',
  BOTTOM_START = 'bottom-start',
  END_TOP = 'end-top',
  END_BOTTOM = 'end-bottom',
  START_TOP = 'start-top',
  START_BOTTOM = 'start-bottom'
}

export enum NbGlobalLogicalPosition {
  TOP_START = 'top-start',
  TOP_END = 'top-end',
  BOTTOM_START = 'bottom-start',
  BOTTOM_END = 'bottom-end'
}

export enum NbGlobalPhysicalPosition {
  TOP_RIGHT = 'top-right',
  TOP_LEFT = 'top-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_LEFT = 'bottom-left'
}

export type NbGlobalPosition = NbGlobalPhysicalPosition | NbGlobalLogicalPosition;

@injectable()
export class NbPositionHelper {
  constructor(protected layoutDirection: NbLayoutDirectionService) {}

  toLogicalPosition(position: NbGlobalPosition): NbGlobalLogicalPosition {
    if (Object.values(NbGlobalLogicalPosition).includes(position as NbGlobalLogicalPosition)) {
      return position as NbGlobalLogicalPosition;
    }

    if (this.layoutDirection.isLtr()) {
      return this.toLogicalPositionWhenLtr(position as NbGlobalPhysicalPosition);
    } else {
      return this.toLogicalPositionWhenRtl(position as NbGlobalPhysicalPosition);
    }
  }

  toPhysicalPosition(position: NbGlobalPosition): NbGlobalPhysicalPosition {
    if (Object.values(NbGlobalPhysicalPosition).includes(position as NbGlobalPhysicalPosition)) {
      return position as NbGlobalPhysicalPosition;
    }

    if (this.layoutDirection.isLtr()) {
      return this.toPhysicalPositionWhenLtr(position as NbGlobalLogicalPosition);
    } else {
      return this.toPhysicalPositionWhenRtl(position as NbGlobalLogicalPosition);
    }
  }

  isTopPosition(position: NbGlobalPosition) {
    const logicalPosition = this.toLogicalPosition(position);

    return logicalPosition === NbGlobalLogicalPosition.TOP_END || logicalPosition === NbGlobalLogicalPosition.TOP_START;
  }

  isRightPosition(position: NbGlobalPosition) {
    const physicalPosition = this.toPhysicalPosition(position);

    return (
      physicalPosition === NbGlobalPhysicalPosition.TOP_RIGHT ||
      physicalPosition === NbGlobalPhysicalPosition.BOTTOM_RIGHT
    );
  }

  protected toLogicalPositionWhenLtr(position: NbGlobalPhysicalPosition): NbGlobalLogicalPosition {
    switch (position) {
      case NbGlobalPhysicalPosition.TOP_RIGHT:
        return NbGlobalLogicalPosition.TOP_END;
      case NbGlobalPhysicalPosition.TOP_LEFT:
        return NbGlobalLogicalPosition.TOP_START;
      case NbGlobalPhysicalPosition.BOTTOM_RIGHT:
        return NbGlobalLogicalPosition.BOTTOM_END;
      case NbGlobalPhysicalPosition.BOTTOM_LEFT:
        return NbGlobalLogicalPosition.BOTTOM_START;
    }
  }

  protected toLogicalPositionWhenRtl(position: NbGlobalPhysicalPosition): NbGlobalLogicalPosition {
    switch (position) {
      case NbGlobalPhysicalPosition.TOP_RIGHT:
        return NbGlobalLogicalPosition.TOP_START;
      case NbGlobalPhysicalPosition.TOP_LEFT:
        return NbGlobalLogicalPosition.TOP_END;
      case NbGlobalPhysicalPosition.BOTTOM_RIGHT:
        return NbGlobalLogicalPosition.BOTTOM_START;
      case NbGlobalPhysicalPosition.BOTTOM_LEFT:
        return NbGlobalLogicalPosition.BOTTOM_END;
    }
  }

  protected toPhysicalPositionWhenLtr(position: NbGlobalLogicalPosition): NbGlobalPhysicalPosition {
    switch (position) {
      case NbGlobalLogicalPosition.TOP_START:
        return NbGlobalPhysicalPosition.TOP_LEFT;
      case NbGlobalLogicalPosition.TOP_END:
        return NbGlobalPhysicalPosition.TOP_RIGHT;
      case NbGlobalLogicalPosition.BOTTOM_START:
        return NbGlobalPhysicalPosition.BOTTOM_LEFT;
      case NbGlobalLogicalPosition.BOTTOM_END:
        return NbGlobalPhysicalPosition.BOTTOM_RIGHT;
    }
  }

  protected toPhysicalPositionWhenRtl(position: NbGlobalLogicalPosition): NbGlobalPhysicalPosition {
    switch (position) {
      case NbGlobalLogicalPosition.TOP_START:
        return NbGlobalPhysicalPosition.TOP_RIGHT;
      case NbGlobalLogicalPosition.TOP_END:
        return NbGlobalPhysicalPosition.TOP_LEFT;
      case NbGlobalLogicalPosition.BOTTOM_START:
        return NbGlobalPhysicalPosition.BOTTOM_RIGHT;
      case NbGlobalLogicalPosition.BOTTOM_END:
        return NbGlobalPhysicalPosition.BOTTOM_LEFT;
    }
  }
}

export function getContainerPositionClasses(position: NbPosition) {
  return {
    'nb-overlay-top': position === NbPosition.TOP,
    'nb-overlay-top-start': position === NbPosition.TOP_START,
    'nb-overlay-top-end': position === NbPosition.TOP_END,
    'nb-overlay-right': position === NbPosition.RIGHT || position === NbPosition.END,
    'nb-overlay-end-top': position === NbPosition.END_TOP,
    'nb-overlay-end-bottom': position === NbPosition.END_BOTTOM,
    'nb-overlay-bottom': position === NbPosition.BOTTOM,
    'nb-overlay-bottom-start': position === NbPosition.BOTTOM_START,
    'nb-overlay-bottom-end': position === NbPosition.BOTTOM_END,
    'nb-overlay-left': position === NbPosition.LEFT || position === NbPosition.START,
    'nb-overlay-start-top': position === NbPosition.START_TOP,
    'nb-overlay-start-bottom': position === NbPosition.START_BOTTOM
  };
}
