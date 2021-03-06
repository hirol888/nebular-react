
import { NbScrollStrategy } from './scroll-strategy';
import { OverlayReference } from '../overlay-reference';
import { Subscription } from 'rxjs';
import { ScrollDispatcher, ViewportRuler } from '../../scrolling';

/**
 * Config options for the CloseScrollStrategy.
 */
export interface CloseScrollStrategyConfig {
  /** Amount of pixels the user has to scroll before the overlay is closed. */
  threshold?: number;
}

/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy implements NbScrollStrategy {
  private _scrollSubscription: Subscription | null = null;
  private _overlayRef: OverlayReference;
  private _initialScrollPosition: number;

  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler,
    private _config?: CloseScrollStrategyConfig,
  ) { }

  /** Attaches this scroll strategy to an overlay. */
  attach(overlayRef: OverlayReference) {
    this._overlayRef = overlayRef;
  }

  /** Enables the closing of the attached overlay on scroll. */
  enable() {
    if (this._scrollSubscription) {
      return;
    }

    const stream = this._scrollDispatcher.scrolled(0);

    if (this._config && this._config.threshold && this._config.threshold > 1) {
      this._initialScrollPosition = this._viewportRuler.getViewportScrollPosition().top;

      this._scrollSubscription = stream.subscribe(() => {
        const scrollPosition = this._viewportRuler.getViewportScrollPosition().top;

        if (Math.abs(scrollPosition - this._initialScrollPosition) > this._config!.threshold!) {
          this._detach();
        } else {
          this._overlayRef.updatePosition();
        }
      });
    } else {
      this._scrollSubscription = stream.subscribe(this._detach);
    }
  }

  /** Disables the closing the attached overlay on scroll. */
  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }

  detach() {
    this.disable();
    this._overlayRef = null!;
  }

  /** Detaches the overlay ref and disables the scroll strategy. */
  private _detach = () => {
    this.disable();
    this._overlayRef.detach();
    this._scrollDispatcher.dispose();
    this._viewportRuler.dispose();
  };
}
