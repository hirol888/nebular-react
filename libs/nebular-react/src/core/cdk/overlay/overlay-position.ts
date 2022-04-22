import { inject, injectable, tagged } from "inversify";
import { TYPES } from "libs/nebular-react/src/ioc-types";
import { map, Observable } from "rxjs";
import { NbPlatform } from "../platform";
import { ViewportRuler } from "../scrolling";
import { NbOverlayRef } from "./overlay-ref";
import { GlobalPositionStrategy, NbConnectedOverlayPositionChange, NbConnectedPosition, NbConnectionPositionPair, NbFlexibleConnectedPositionStrategy, NbPositionStrategy } from "./position";
import { NbGlobalLogicalPosition } from "./position-helper";

export type NbAdjustmentValues = 'noop' | 'clockwise' | 'counterclockwise' | 'vertical' | 'horizontal';
export enum NbAdjustment {
  NOOP = 'noop',
  CLOCKWISE = 'clockwise',
  COUNTERCLOCKWISE = 'counterclockwise',
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

// eslint-disable-next-line max-len
export type NbPositionValues = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end' | 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' | 'end-top' | 'end-bottom' | 'start-top' | 'start-bottom';
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
  START_BOTTOM = 'start-bottom',
}

const POSITIONS = {
  [NbPosition.RIGHT](offset: number) {
    return { originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: offset };
  },
  [NbPosition.BOTTOM](offset: number) {
    return { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: offset };
  },
  [NbPosition.LEFT](offset: number) {
    return { originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -offset };
  },
  [NbPosition.TOP](offset: number) {
    return { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -offset };
  },
  [NbPosition.START](offset: number) {
    return this[NbPosition.LEFT](offset);
  },
  [NbPosition.END](offset: number) {
    return this[NbPosition.RIGHT](offset);
  },
  [NbPosition.END_TOP](offset: number) {
    return { originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom', offsetX: offset };
  },
  [NbPosition.END_BOTTOM](offset: number) {
    return { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: offset };
  },
  [NbPosition.BOTTOM_START](offset: number) {
    return { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: offset };
  },
  [NbPosition.BOTTOM_END](offset: number) {
    return { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: offset };
  },
  [NbPosition.START_TOP](offset: number) {
    return { originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom', offsetX: -offset };
  },
  [NbPosition.START_BOTTOM](offset: number) {
    return { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -offset };
  },
  [NbPosition.TOP_START](offset: number) {
    return { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -offset };
  },
  [NbPosition.TOP_END](offset: number) {
    return { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -offset };
  },
};

const COUNTER_CLOCKWISE_POSITIONS = [
  NbPosition.TOP,
  NbPosition.TOP_END,
  NbPosition.TOP_START,
  NbPosition.START,
  NbPosition.START_TOP,
  NbPosition.START_BOTTOM,
  NbPosition.BOTTOM,
  NbPosition.BOTTOM_START,
  NbPosition.BOTTOM_END,
  NbPosition.END,
  NbPosition.END_BOTTOM,
  NbPosition.END_TOP,
];
const CLOCKWISE_POSITIONS = [
  NbPosition.TOP,
  NbPosition.TOP_START,
  NbPosition.TOP_END,
  NbPosition.END,
  NbPosition.END_TOP,
  NbPosition.END_BOTTOM,
  NbPosition.BOTTOM,
  NbPosition.BOTTOM_END,
  NbPosition.BOTTOM_START,
  NbPosition.START,
  NbPosition.START_BOTTOM,
  NbPosition.START_TOP,
];
const VERTICAL_POSITIONS = [NbPosition.BOTTOM, NbPosition.TOP];
const HORIZONTAL_POSITIONS = [NbPosition.START, NbPosition.END];


function comparePositions(p1: NbConnectedPosition, p2: NbConnectedPosition): boolean {
  return p1.originX === p2.originX
    && p1.originY === p2.originY
    && p1.overlayX === p2.overlayX
    && p1.overlayY === p2.overlayY;
}

/**
 * The main idea of the adjustable connected strategy is to provide predefined set of positions for your overlay.
 * You have to provide adjustment and appropriate strategy will be chosen in runtime.
 * */
export class NbAdjustableConnectedPositionStrategy
  extends NbFlexibleConnectedPositionStrategy implements NbPositionStrategy {

  protected _position: NbPosition;
  protected _offset = 15;
  protected _adjustment: NbAdjustment;

  protected appliedPositions: { key: NbPosition, connectedPosition: NbConnectedPosition }[];

  readonly positionChange: Observable<NbPosition | undefined> = this.positionChanges.pipe(
    map((positionChange: NbConnectedOverlayPositionChange) => positionChange.connectionPair),
    map((connectionPair: NbConnectionPositionPair) => {
      return this.appliedPositions.find(({ connectedPosition }) => {
        return comparePositions(connectedPosition, connectionPair);
      })?.key
    }),
  );

  override attach(overlayRef: NbOverlayRef) {
    /**
     * We have to apply positions before attach because super.attach() validates positions and crashes app
     * if no positions provided.
     * */
    this.applyPositions();
    super.attach(overlayRef);
  }

  override apply() {
    this.applyPositions();
    super.apply();
  }

  position(position: NbPosition): this {
    this._position = position;
    return this;
  }

  adjustment(adjustment: NbAdjustment): this {
    this._adjustment = adjustment;
    return this;
  }

  offset(offset: number): this {
    this._offset = offset;
    return this;
  }

  protected applyPositions() {
    const positions: NbPosition[] = this.createPositions();
    this.persistChosenPositions(positions);
    this.withPositions(this.appliedPositions.map(({ connectedPosition }) => connectedPosition));
  }

  protected createPositions(): NbPosition[] {
    switch (this._adjustment) {
      case NbAdjustment.NOOP:
        return [this._position];
      case NbAdjustment.CLOCKWISE:
        return this.reorderPreferredPositions(CLOCKWISE_POSITIONS);
      case NbAdjustment.COUNTERCLOCKWISE:
        return this.reorderPreferredPositions(COUNTER_CLOCKWISE_POSITIONS);
      case NbAdjustment.HORIZONTAL:
        return this.reorderPreferredPositions(HORIZONTAL_POSITIONS);
      case NbAdjustment.VERTICAL:
        return this.reorderPreferredPositions(VERTICAL_POSITIONS);
    }
  }

  protected persistChosenPositions(positions: NbPosition[]) {
    this.appliedPositions = positions.map(position => ({
      key: position,
      connectedPosition: POSITIONS[position](this._offset) as NbConnectedPosition,
    }));
  }

  protected reorderPreferredPositions(positions: NbPosition[]): NbPosition[] {
    // Physical positions should be mapped to logical as adjustments use logical positions.
    const startPositionIndex = positions.indexOf(this.mapToLogicalPosition(this._position));
    const firstPart = positions.slice(startPositionIndex);
    const secondPart = positions.slice(0, startPositionIndex);
    return firstPart.concat(secondPart);
  }

  protected mapToLogicalPosition(position: NbPosition): NbPosition {
    if (position === NbPosition.LEFT) {
      return NbPosition.START;
    }
    if (position === NbPosition.RIGHT) {
      return NbPosition.END;
    }

    return position;
  }
}

export class NbGlobalPositionStrategy extends GlobalPositionStrategy {

  position(position: NbGlobalLogicalPosition): this {
    switch (position) {
      case NbGlobalLogicalPosition.TOP_START:
        return this.top().left();

      case NbGlobalLogicalPosition.TOP_END:
        return this.top().right();

      case NbGlobalLogicalPosition.BOTTOM_START:
        return this.bottom().left();

      case NbGlobalLogicalPosition.BOTTOM_END:
        return this.bottom().right();
    }
  }
}

@injectable()
export class NbPositionBuilderService {
  constructor(
    @inject(TYPES.NbPlatform) protected _platform: NbPlatform,
    @inject(TYPES.ViewportRuler) @tagged('adapter', true) protected _viewportRuler: ViewportRuler
  ) { }

  global(): NbGlobalPositionStrategy {
    return new NbGlobalPositionStrategy();
  }

  connectedTo(element: HTMLElement): NbAdjustableConnectedPositionStrategy {
    return new NbAdjustableConnectedPositionStrategy(
      element,
      this._viewportRuler,
      this._platform
    )
      .withFlexibleDimensions(false)
      .withPush(false);
  }
}
