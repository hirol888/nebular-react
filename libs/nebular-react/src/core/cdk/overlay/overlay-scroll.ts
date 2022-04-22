import { inject, injectable, tagged } from "inversify";
import { TYPES } from "libs/nebular-react/src/ioc-types";
import { NbScrollStrategies } from "../adapter/block-scroll-strategy-adapter";
import { ScrollStrategyOptions, NbScrollStrategy, } from "./scroll";

@injectable()
export class NbScrollStrategyBuilder {
  private _scrollType: NbScrollStrategies;

  constructor(
    @inject(TYPES.ScrollStrategyOptions) @tagged('nb', true) private _scrollStrategyOptions: ScrollStrategyOptions
  ) { }

  scrollType(scrollType: NbScrollStrategies): this {
    this._scrollType = scrollType;
    return this;
  }

  build(): NbScrollStrategy {
    switch (this._scrollType) {
      case 'block':
        return this._scrollStrategyOptions.block();
      case 'close':
        return this._scrollStrategyOptions.close();
      case 'reposition':
        return this._scrollStrategyOptions.reposition();
      case 'noop':
        return this._scrollStrategyOptions.noop();
      default:
        throw new Error('ScrollType have to be provided');
    }
  }
}