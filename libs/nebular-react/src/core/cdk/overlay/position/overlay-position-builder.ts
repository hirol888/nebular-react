/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { inject, injectable, tagged } from 'inversify';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { NbPlatform } from '../../platform';
import { ViewportRuler } from '../../scrolling';
import { NbFlexibleConnectedPositionStrategy } from './flexible-connected-position-strategy';
import { GlobalPositionStrategy } from './global-position-strategy';

/** Builder for overlay position strategy. */
@injectable()
export class NbOverlayPositionBuilder {
  constructor(
    @inject(TYPES.ViewportRuler) @tagged('adapter', false) private _viewportRuler: ViewportRuler,
    @inject(TYPES.NbPlatform) private _platform: NbPlatform
  ) { }

  /**
   * Creates a global position strategy.
   */
  global(): GlobalPositionStrategy {
    return new GlobalPositionStrategy();
  }

  /**
   * Creates a flexible position strategy.
   * @param origin Origin relative to which to position the overlay.
   */
  flexibleConnectedTo(origin: HTMLElement): NbFlexibleConnectedPositionStrategy {
    return new NbFlexibleConnectedPositionStrategy(
      origin,
      this._viewportRuler,
      this._platform
    );
  }

  dispose() {
    this._viewportRuler.dispose();
  }
}
