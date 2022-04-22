/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NbScrollStrategy } from './scroll-strategy';

/** Scroll strategy that doesn't do anything. */
export class NoopScrollStrategy implements NbScrollStrategy {
  /** Does nothing, as this scroll strategy is a no-op. */
  enable() { }
  /** Does nothing, as this scroll strategy is a no-op. */
  disable() { }
  /** Does nothing, as this scroll strategy is a no-op. */
  attach() { }
}
