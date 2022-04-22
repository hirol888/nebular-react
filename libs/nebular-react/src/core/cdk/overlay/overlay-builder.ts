/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { inject, injectable } from 'inversify';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import { NbScrollStrategyOptions } from '../adapter/block-scroll-strategy-adapter';
import { NbLayoutDirection } from '../helper';
import { OverlayKeyboardDispatcher } from './dispatchers/overlay-keyboard-dispatcher';
import { OverlayOutsideClickDispatcher } from './dispatchers/overlay-outside-click-dispatcher';
import { NbOverlayConfig } from './overlay-config';
import { NbOverlayRef } from './overlay-ref';
import { NbOverlayPositionBuilder } from './position/overlay-position-builder';

// Note that Overlay is *not* scoped to the app root because of the ComponentFactoryResolver
// which needs to be different depending on where OverlayModule is imported.

/**
 * Service to create Overlays. Overlays are dynamically added pieces of floating UI, meant to be
 * used as a low-level building block for other components. Dialogs, tooltips, menus,
 * selects, etc. can all be built using overlays. The service should primarily be used by authors
 * of re-usable components rather than developers building end-user applications.
 *
 * An overlay *is* a PortalOutlet, so any kind of Portal can be loaded into one.
 */
@injectable()
export class NbOverlayBuilder {
  scrollStrategies: NbScrollStrategyOptions;

  constructor(
    @inject(TYPES.NbOverlayPositionBuilder) private _positionBuilder: NbOverlayPositionBuilder,
    @inject(TYPES.OverlayKeyboardDispatcher) private _keyboardDispatcher: OverlayKeyboardDispatcher,
    @inject(TYPES.OverlayOutsideClickDispatcher) private _outsideClickDispatcher: OverlayOutsideClickDispatcher
  ) { }

  /**
   * Creates an overlay.
   * @param config Configuration applied to the overlay.
   * @returns Reference to the created overlay.
   */
  create(config?: NbOverlayConfig): NbOverlayRef {
    const overlayConfig = new NbOverlayConfig(config);

    return new NbOverlayRef(
      overlayConfig,
      overlayConfig.direction || NbLayoutDirection.LTR,
      this._keyboardDispatcher,
      this._outsideClickDispatcher,
    );
  }

  /**
   * Gets a position builder that can be used, via fluent API,
   * to construct and configure a position strategy.
   * @returns An overlay position builder.
   */
  position(): NbOverlayPositionBuilder {
    return this._positionBuilder;
  }

  dispose() {
    this._positionBuilder.dispose();
    this._keyboardDispatcher.dispose();
    this._outsideClickDispatcher.dispose();
  }
}
