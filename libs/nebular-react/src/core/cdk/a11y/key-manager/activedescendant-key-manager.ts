/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { ListKeyManager, ListKeyManagerOption } from './list-key-manager';

/**
 * This is the interface for highlightable items (used by the ActiveDescendantKeyManager).
 * Each item must know how to style itself as active or inactive and whether or not it is
 * currently disabled.
 */
export interface Highlightable extends ListKeyManagerOption {
  /** Applies the styles for an active item to this item. */
  setActiveStyles(): void;

  /** Applies the styles for an inactive item to this item. */
  setInactiveStyles(): void;
}

export class ActiveDescendantKeyManager<T> extends ListKeyManager<Highlightable & T> {
  override setActiveItem(index: any): void {
    if (this.activeItem) {
      this.activeItem.current!.setInactiveStyles();
    }
    super.setActiveItem(index);
    if (this.activeItem) {
      this.activeItem.current!.setActiveStyles();
    }
  }
}

export enum NbKeyManagerActiveItemMode {
  RESET_ACTIVE = -1,
  FIRST_ACTIVE = 0,
}
