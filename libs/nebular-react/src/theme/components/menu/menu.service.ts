/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */


import { injectable } from 'inversify';
import { Observable, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { NbBadgeProps } from '../badge';
import { NbIconConfig } from '../icon';

export interface NbMenuBag { tag: string; item: NbMenuItemModel }

export type NbMenuBadgeConfig = Omit<NbBadgeProps, 'position'>;

/**
 *
 *
 * Menu Item options example
 * @stacked-example(Menu Link Parameters, menu/menu-link-params.component)
 *
 *
 */
export class NbMenuItemModel {
  /**
   * Item Title
   * @type {string}
   */
  title: string;
  /**
   * Item link route
   * @type {string}
   */
  link?: string;
  /**
   * Item URL
   * @type {string}
   */
  url?: string;
  /**
   * Icon class name or icon config object
   * @type {string | NbIconConfig}
   */
  icon?: string | NbIconConfig;
  /**
   * Expanded by default
   * @type {boolean}
   */
  expanded?: boolean;
  /**
   * Badge component
   * @type {boolean}
   */
  badge?: NbMenuBadgeConfig;
  /**
   * Children items
   * @type {List<NbMenuItemModel>}
   */
  children?: NbMenuItemModel[];
  /**
   * HTML Link target
   * @type {string}
   */
  target?: string;
  /**
   * Hidden Item
   * @type {boolean}
   */
  hidden?: boolean;
  /**
   * Item is selected when partly or fully equal to the current url
   * @type {string}
   */
  pathMatch?: 'full' | 'prefix' = 'full';
  /**
   * Where this is a home item
   * @type {boolean}
   */
  home?: boolean;
  /**
   * Whether the item is just a group (non-clickable)
   * @type {boolean}
   */
  group?: boolean;
  /** Whether the item skipLocationChange is true or false
   *@type {boolean}
   */
  skipLocationChange?: boolean;
  parent?: NbMenuItemModel;
  selected?: boolean;
  data?: any;

  /**
   * @returns item parents in top-down order
   */
  static getParents(item: NbMenuItemModel): NbMenuItemModel[] {
    const parents = [];

    let parent = item.parent;
    while (parent) {
      parents.unshift(parent);
      parent = parent.parent;
    }

    return parents;
  }

  static isParent(item: NbMenuItemModel, possibleChild: NbMenuItemModel): boolean {
    return possibleChild.parent
      ? possibleChild.parent === item || this.isParent(item, possibleChild.parent)
      : false;
  }
}

// TODO: map select events to router change events
// TODO: review the interface
/**
 *
 *
 * Menu Service. Allows you to listen to menu events, or to interact with a menu.
 * @stacked-example(Menu Service, menu/menu-service.component)
 *
 *
 */
@injectable()
export class NbMenuService {

  public itemClick$ = new Subject<NbMenuBag>();
  public addItems$ = new ReplaySubject<{ tag: string; items: NbMenuItemModel[] }>(1);
  public navigateHome$ = new ReplaySubject<{ tag: string }>(1);
  public getSelectedItem$
    = new ReplaySubject<{ tag: string; listener: BehaviorSubject<NbMenuBag | null> }>(1);
  public itemSelect$ = new ReplaySubject<NbMenuBag>(1);
  public itemHover$ = new ReplaySubject<NbMenuBag>(1);
  public submenuToggle$ = new ReplaySubject<NbMenuBag>(1);
  public collapseAll$ = new ReplaySubject<{ tag: string }>(1);

  /**
   * Add items to the end of the menu items list
   * @param {List<NbMenuItemModel>} items
   * @param {string} tag
   */
  addItems(items: NbMenuItemModel[], tag?: string) {
    this.addItems$.next({ tag: tag ?? '', items });
  }

  /**
   * Collapses all menu items
   * @param {string} tag
   */
  collapseAll(tag?: string) {
    this.collapseAll$.next({ tag: tag ?? '' });
  }

  /**
   * Navigate to the home menu item
   * @param {string} tag
   */
  navigateHome(tag?: string) {
    this.navigateHome$.next({ tag: tag ?? '' });
  }

  /**
   * Returns currently selected item. Won't subscribe to the future events.
   * @param {string} tag
   * @returns {Observable<{tag: string; item: NbMenuItemModel}>}
   */
  getSelectedItem(tag?: string): Observable<NbMenuBag | null> {
    const listener = new BehaviorSubject<NbMenuBag | null>(null);

    this.getSelectedItem$.next({ tag: tag ?? '', listener });

    return listener.asObservable();
  }

  onItemClick(): Observable<NbMenuBag> {
    return this.itemClick$.pipe(share());
  }

  onItemSelect(): Observable<NbMenuBag> {
    return this.itemSelect$.pipe(share());
  }

  onItemHover(): Observable<NbMenuBag> {
    return this.itemHover$.pipe(share());
  }

  onSubmenuToggle(): Observable<NbMenuBag> {
    return this.submenuToggle$.pipe(share());
  }
}


