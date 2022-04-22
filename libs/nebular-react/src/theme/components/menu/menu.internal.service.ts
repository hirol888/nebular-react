import { inject, injectable } from "inversify";
import { TYPES } from "libs/nebular-react/src/ioc-types";
import { BehaviorSubject, Observable, share } from "rxjs";
import { NbMenuBag, NbMenuItemModel, NbMenuService } from "./menu.service";

@injectable()
export class NbMenuInternalService {
  constructor(@inject(TYPES.NbMenuService) private _menuService: NbMenuService) { }

  prepareItems(items: NbMenuItemModel[]) {
    const defaultItem = new NbMenuItemModel();
    items.forEach(i => {
      this.applyDefaults(i, defaultItem);
      this.setParent(i);
    });
  }

  selectFromUrl(items: NbMenuItemModel[], tag: string, url: string, collapseOther = false) {
    const selectedItem = this.findItemByUrl(items, url);
    if (selectedItem) {
      this.selectItem(selectedItem, items, collapseOther, tag);
    }
  }

  selectItem(item: NbMenuItemModel, items: NbMenuItemModel[], collapseOther = false, tag: string) {
    const unselectedItems = this.resetSelection(items);
    const collapsedItems = collapseOther ? this.collapseItems(items) : [];

    for (const parent of NbMenuItemModel.getParents(item)) {
      parent.selected = true;
      // emit event only for items that weren't selected before ('unselectedItems' contains items that were selected)
      if (!unselectedItems.includes(parent)) {
        this.itemSelect(parent, tag);
      }

      const wasNotExpanded = !parent.expanded;
      parent.expanded = true;
      const i = collapsedItems.indexOf(parent);
      // emit event only for items that weren't expanded before.
      // 'collapsedItems' contains items that were expanded, so no need to emit event.
      // in case 'collapseOther' is false, 'collapsedItems' will be empty,
      // so also check if item isn't expanded already ('wasNotExpanded').
      if (i === -1 && wasNotExpanded) {
        this.submenuToggle(parent, tag);
      } else {
        collapsedItems.splice(i, 1);
      }
    }

    item.selected = true;
    // emit event only for items that weren't selected before ('unselectedItems' contains items that were selected)
    if (!unselectedItems.includes(item)) {
      this.itemSelect(item, tag);
    }

    // remaining items which wasn't expanded back after expanding all currently selected items
    for (const collapsedItem of collapsedItems) {
      this.submenuToggle(collapsedItem, tag);
    }
  }

  collapseAll(items: NbMenuItemModel[], tag: string, except?: NbMenuItemModel) {
    const collapsedItems = this.collapseItems(items, except);

    for (const item of collapsedItems) {
      this.submenuToggle(item, tag);
    }
  }

  onAddItem(): Observable<{ tag: string; items: NbMenuItemModel[] }> {
    return this._menuService.addItems$.pipe(share());
  }

  onNavigateHome(): Observable<{ tag: string }> {
    return this._menuService.navigateHome$.pipe(share());
  }

  onCollapseAll(): Observable<{ tag: string }> {
    return this._menuService.collapseAll$.pipe(share());
  }

  onGetSelectedItem(): Observable<{ tag: string; listener: BehaviorSubject<NbMenuBag | null> }> {
    return this._menuService.getSelectedItem$.pipe(share());
  }

  itemHover(item: NbMenuItemModel, tag?: string) {
    this._menuService.itemHover$.next({ tag: tag ?? '', item });
  }

  submenuToggle(item: NbMenuItemModel, tag?: string) {
    this._menuService.submenuToggle$.next({ tag: tag ?? '', item });
  }

  itemSelect(item: NbMenuItemModel, tag?: string) {
    this._menuService.itemSelect$.next({ tag: tag ?? '', item });
  }

  itemClick(item: NbMenuItemModel, tag?: string) {
    this._menuService.itemClick$.next({ tag: tag ?? '', item });
  }

  /**
   * Unselect all given items deeply.
   * @param items array of items to unselect.
   * @returns items which selected value was changed.
   */
  private resetSelection(items: NbMenuItemModel[]): NbMenuItemModel[] {
    const unselectedItems = [];

    for (const item of items) {
      if (item.selected) {
        unselectedItems.push(item);
      }
      item.selected = false;

      if (item.children) {
        unselectedItems.push(...this.resetSelection(item.children));
      }
    }

    return unselectedItems;
  }

  /**
   * Collapse all given items deeply.
   * @param items array of items to collapse.
   * @param except menu item which shouldn't be collapsed, also disables collapsing for parents of this item.
   * @returns items which expanded value was changed.
   */
  private collapseItems(items: NbMenuItemModel[], except?: NbMenuItemModel): NbMenuItemModel[] {
    const collapsedItems = [];

    for (const item of items) {
      if (except && (item === except || NbMenuItemModel.isParent(item, except))) {
        continue;
      }

      if (item.expanded) {
        collapsedItems.push(item)
      }
      item.expanded = false;

      if (item.children) {
        collapsedItems.push(...this.collapseItems(item.children));
      }
    }

    return collapsedItems;
  }

  private applyDefaults(item: NbMenuItemModel, defaultItem: NbMenuItemModel) {
    const menuItem = { ...item };
    Object.assign(item, defaultItem, menuItem);
    item.children && item.children.forEach(child => {
      this.applyDefaults(child, defaultItem);
    });
  }

  private setParent(item: NbMenuItemModel) {
    item.children && item.children.forEach(child => {
      child.parent = item;
      this.setParent(child);
    });
  }

  /**
   * Find deepest item which link matches current URL path.
   * @param items array of items to search in.
   * @returns found item of undefined.
   */
  private findItemByUrl(items: NbMenuItemModel[], url: string): NbMenuItemModel | undefined {
    let selectedItem: NbMenuItemModel | undefined;

    items.some(item => {
      if (item.children) {
        selectedItem = this.findItemByUrl(item.children, url);
      }
      if (!selectedItem && this.isSelectedInUrl(item, url)) {
        selectedItem = item;
      }

      return selectedItem;
    });

    return selectedItem;
  }

  private isSelectedInUrl(item: NbMenuItemModel, url: string): boolean {
    const exact: boolean = item.pathMatch === 'full';
    const link: string = item.link ?? '';

    const isSelectedInPath = exact ? url === link : url.includes(link);

    return isSelectedInPath;
  }
}