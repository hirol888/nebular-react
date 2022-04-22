import { injectable } from 'inversify';
import { OverlayReference } from '../overlay-reference';
import { BaseOverlayDispatcher } from './base-overlay-dispatcher';

/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@injectable()
export class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
  /** Add a new overlay to the list of attached overlay refs. */
  override add(overlayRef: OverlayReference): void {
    super.add(overlayRef);

    // Lazily start dispatcher once first overlay is added
    if (!this._isAttached) {
      document.body.addEventListener('keydown', this._keydownListener);
      this._isAttached = true;
    }
  }

  /** Detaches the global keyboard event listener. */
  protected detach() {
    if (this._isAttached) {
      document.body.removeEventListener('keydown', this._keydownListener);
      this._isAttached = false;
    }
  }

  /** Keyboard event listener that will be attached to the body. */
  private _keydownListener = (event: KeyboardEvent) => {
    const overlays = this._attachedOverlays;

    for (let i = overlays.length - 1; i > -1; i--) {
      // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
      // We want to target the most recent overlay, rather than trying to match where the event came
      // from, because some components might open an overlay, but keep focus on a trigger element
      // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
      // because we don't want overlays that don't handle keyboard events to block the ones below
      // them that do.
      if (overlays[i]._keydownEvents.observed) {
        overlays[i]._keydownEvents.next(event);
        break;
      }
    }
  };
}
