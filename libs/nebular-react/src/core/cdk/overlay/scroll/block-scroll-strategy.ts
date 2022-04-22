/* eslint-disable @typescript-eslint/no-empty-function */
import { coerceCssPixelValue } from "../../coercion";
import { supportsScrollBehavior, ViewportRuler } from "../../scrolling";
import { OverlayReference } from "../overlay-reference";
import { NbScrollStrategy } from "./scroll-strategy";


const scrollBehaviorSupported = supportsScrollBehavior();

/**
 * Strategy that will prevent the user from scrolling while the overlay is visible.
 */
export class BlockScrollStrategy implements NbScrollStrategy {
  private _previousHTMLStyles = { top: '', left: '' };
  private _previousScrollPosition: { top: number; left: number };
  private _isEnabled = false;

  constructor(protected _viewportRuler: ViewportRuler) { }

  attach(overlayRef: OverlayReference) { }
  detach?: (() => void);

  /** Blocks page-level scroll while the attached overlay is open. */
  enable() {
    if (this._canBeEnabled()) {
      const root = document.documentElement!;

      this._previousScrollPosition = this._viewportRuler.getViewportScrollPosition();

      // Cache the previous inline styles in case the user had set them.
      this._previousHTMLStyles.left = root.style.left || '';
      this._previousHTMLStyles.top = root.style.top || '';

      // Note: we're using the `html` node, instead of the `body`, because the `body` may
      // have the user agent margin, whereas the `html` is guaranteed not to have one.
      root.style.left = coerceCssPixelValue(-this._previousScrollPosition.left);
      root.style.top = coerceCssPixelValue(-this._previousScrollPosition.top);
      root.classList.add('cdk-global-scrollblock');
      this._isEnabled = true;
    }
  }

  /** Unblocks page-level scroll while the attached overlay is open. */
  disable() {
    if (this._isEnabled) {
      const html = document.documentElement!;
      const body = document.body!;
      const htmlStyle = html.style;
      const bodyStyle = body.style;
      const previousHtmlScrollBehavior = htmlStyle.scrollBehavior || '';
      const previousBodyScrollBehavior = bodyStyle.scrollBehavior || '';

      this._isEnabled = false;

      htmlStyle.left = this._previousHTMLStyles.left;
      htmlStyle.top = this._previousHTMLStyles.top;
      html.classList.remove('cdk-global-scrollblock');

      // Disable user-defined smooth scrolling temporarily while we restore the scroll position.
      // See https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior
      // Note that we don't mutate the property if the browser doesn't support `scroll-behavior`,
      // because it can throw off feature detections in `supportsScrollBehavior` which
      // checks for `'scrollBehavior' in documentElement.style`.
      if (scrollBehaviorSupported) {
        htmlStyle.scrollBehavior = bodyStyle.scrollBehavior = 'auto';
      }

      window.scroll(this._previousScrollPosition.left, this._previousScrollPosition.top);

      if (scrollBehaviorSupported) {
        htmlStyle.scrollBehavior = previousHtmlScrollBehavior;
        bodyStyle.scrollBehavior = previousBodyScrollBehavior;
      }
    }
  }

  dispose() {
    this._viewportRuler.dispose();
  }

  private _canBeEnabled(): boolean {
    // Since the scroll strategies can't be singletons, we have to use a global CSS class
    // (`cdk-global-scrollblock`) to make sure that we don't try to disable global
    // scrolling multiple times.
    const html = document.documentElement!;

    if (html.classList.contains('cdk-global-scrollblock') || this._isEnabled) {
      return false;
    }

    const body = document.body;
    const viewport = this._viewportRuler.getViewportSize();
    return body.scrollHeight > viewport.height || body.scrollWidth > viewport.width;
  }
}
