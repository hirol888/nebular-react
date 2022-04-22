/* eslint-disable @typescript-eslint/no-explicit-any */

import { Observable, Subject } from 'rxjs';
import { NbLayoutDirection } from '../helper';

/**
 * Basic interface for an overlay. Used to avoid circular type references between
 * `OverlayRef`, `PositionStrategy` and `ScrollStrategy`, and `OverlayConfig`.
 * @docs-private
 */
export interface OverlayReference {
  init: (host: HTMLElement, pane: HTMLElement) => void;
  detach: () => void;
  detachBackdrop(): void,
  dispose: () => void;
  overlayElement: HTMLElement;
  hostElement: HTMLElement;
  backdropElement: HTMLElement | null;
  getConfig: () => any;
  updateSize: (config: any) => void;
  updatePosition: () => void;
  getDirection: () => NbLayoutDirection;
  backdropClick: () => Observable<MouseEvent>;
  attachments: () => Observable<void>;
  detachments: () => Observable<void>;
  keydownEvents: () => Observable<KeyboardEvent>;
  outsidePointerEvents: () => Observable<MouseEvent>;
  addPanelClass: (classes: string | string[]) => void;
  removePanelClass: (classes: string | string[]) => void;
  readonly _outsidePointerEvents: Subject<MouseEvent>;
  readonly _keydownEvents: Subject<KeyboardEvent>;
}
