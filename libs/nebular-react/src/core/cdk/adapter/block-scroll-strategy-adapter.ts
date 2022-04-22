import { inject, injectable, tagged } from "inversify";
import { TYPES } from "libs/nebular-react/src/ioc-types";
import { NbLayoutScrollService } from "../../services";
import { BlockScrollStrategy, IScrollStrategyOptions, ScrollStrategyOptions } from "../overlay";
import { ScrollDispatcher, ViewportRuler } from "../scrolling";

export type NbScrollStrategies = keyof Pick<ScrollStrategyOptions, 'noop' | 'close' | 'block' | 'reposition'>;

/**
 * Overrides default block scroll strategy because default strategy blocks scrolling on the body only.
 * But Nebular has its own scrollable container - nb-layout. So, we need to block scrolling in it to.
 * */
export class NbBlockScrollStrategyAdapter extends BlockScrollStrategy {
  constructor(
    protected viewportRuler: ViewportRuler,
    protected scrollService: NbLayoutScrollService) {
    super(viewportRuler);
  }

  override enable() {
    super.enable();
    this.scrollService.scrollable(false);
  }

  override disable() {
    super.disable();
    this.scrollService.scrollable(true);
  }
}

@injectable()
export class NbScrollStrategyOptions extends ScrollStrategyOptions implements IScrollStrategyOptions {
  constructor(
    @inject(TYPES.NbLayoutScrollService) protected scrollService: NbLayoutScrollService,
    @inject(TYPES.ScrollDispatcher) protected scrollDispatcher: ScrollDispatcher,
    @inject(TYPES.ViewportRuler) @tagged('adapter', true) protected viewportRuler: ViewportRuler
  ) {
    super(scrollDispatcher, viewportRuler);
  }

  override block = () => new NbBlockScrollStrategyAdapter(this.viewportRuler, this.scrollService);
}