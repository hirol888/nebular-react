import { injectable } from "inversify";
import React from "react";
import { ActiveDescendantKeyManager, Highlightable } from "./activedescendant-key-manager";
import { FocusableOption, FocusKeyManager } from "./focus-key-manager";

export enum NbKeyManagerType {
  FOCUS_KEY_MANAGER,
  ACTIVE_DESCENDANT_KEY_MANAGER
}

@injectable()
export class KeyManagerBuilder {
  create<T extends FocusableOption & Highlightable>(keyManagerType: NbKeyManagerType, items: React.RefObject<T>[]) {
    switch (keyManagerType) {
      case NbKeyManagerType.FOCUS_KEY_MANAGER:
        return this.createFocusKeyManager<T>(items);
      case NbKeyManagerType.ACTIVE_DESCENDANT_KEY_MANAGER:
        return this.createActiveDescendantKeyManager<T>(items);
      default:
        throw new Error('KeyManagerType have to be provided');
    }
  }

  private createFocusKeyManager<T extends FocusableOption>(items: React.RefObject<T>[]): FocusKeyManager<T> {
    return new FocusKeyManager<T>(items);
  }

  private createActiveDescendantKeyManager<T extends Highlightable>(items: React.RefObject<T>[]): ActiveDescendantKeyManager<T> {
    return new ActiveDescendantKeyManager<T>(items);
  }
}