import { inject, injectable, tagged } from "inversify";
import { BlockScrollStrategy } from "./block-scroll-strategy";
import { CloseScrollStrategy, CloseScrollStrategyConfig } from "./close-scroll-strategy";
import { NoopScrollStrategy } from "./noop-scroll-strategy";
import { RepositionScrollStrategy, RepositionScrollStrategyConfig } from "./reposition-scroll-strategy";
import { ScrollDispatcher, ViewportRuler } from "../../scrolling";
import { TYPES } from "libs/nebular-react/src/ioc-types";

export interface IScrollStrategyOptions {
  noop: () => NoopScrollStrategy;
  close: (config?: CloseScrollStrategyConfig | undefined) => CloseScrollStrategy;
  block: () => BlockScrollStrategy;
  reposition: (config?: RepositionScrollStrategyConfig | undefined) => RepositionScrollStrategy;
}

/**
 * Options for how an overlay will handle scrolling.
 *
 * Users can provide a custom value for `ScrollStrategyOptions` to replace the default
 * behaviors. This class primarily acts as a factory for ScrollStrategy instances.
 */
@injectable()
export class ScrollStrategyOptions implements IScrollStrategyOptions {
  constructor(
    @inject(TYPES.ScrollDispatcher) private _scrollDispatcher: ScrollDispatcher,
    @inject(TYPES.ViewportRuler) @tagged('adapter', false) private _viewportRuler: ViewportRuler
  ) { }

  /** Do nothing on scroll. */
  noop = () => new NoopScrollStrategy();

  /**
   * Close the overlay as soon as the user scrolls.
   * @param config Configuration to be used inside the scroll strategy.
   */
  close = (config?: CloseScrollStrategyConfig) =>
    new CloseScrollStrategy(this._scrollDispatcher, this._viewportRuler, config);

  /** Block scrolling. */
  block = () => new BlockScrollStrategy(this._viewportRuler);

  /**
   * Update the overlay's position on scroll.
   * @param config Configuration to be used inside the scroll strategy.
   * Allows debouncing the reposition calls.
   */
  reposition = (config?: RepositionScrollStrategyConfig) =>
    new RepositionScrollStrategy(this._scrollDispatcher, this._viewportRuler, config);
}
