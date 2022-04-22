import { injectable } from "inversify";
import { OverlayReference } from "../overlay-reference";

/**
 * Service for dispatching events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@injectable()
export abstract class BaseOverlayDispatcher {
  /** Currently attached overlays in the order they were attached. */
  _attachedOverlays: OverlayReference[] = [];

  protected _isAttached = false;

  dispose(): void {
    this.detach();
  }

  /** Add a new overlay to the list of attached overlay refs. */
  add(overlayRef: OverlayReference): void {
    // Ensure that we don't get the same overlay multiple times.
    this.remove(overlayRef);
    this._attachedOverlays.push(overlayRef);
  }

  /** Remove an overlay from the list of attached overlay refs. */
  remove(overlayRef: OverlayReference): void {
    const index = this._attachedOverlays.indexOf(overlayRef);

    if (index > -1) {
      this._attachedOverlays.splice(index, 1);
    }

    // Remove the global listener once there are no more overlays.
    if (this._attachedOverlays.length === 0) {
      this.detach();
    }
  }

  /** Detaches the global event listener. */
  protected abstract detach(): void;
}
