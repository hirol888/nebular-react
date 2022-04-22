import classNames from 'classnames';
import { getWindow } from 'libs/nebular-react/src/core/cdk';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BehaviorSubject, filter } from 'rxjs';
import './menu.scoped.scss';
import { NbMenuBag, NbMenuItemModel } from './menu.service';
import { NbMenuItem } from './MenuItem';
import { useObservable, useSubscription } from 'observable-hooks';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';
import { NbMenuInternalService } from './menu.internal.service';

interface MenuProps {
  tagName?: string;
  items: NbMenuItemModel[];
  autoCollapse?: boolean;
}

const NbMenu: React.FC<MenuProps & React.HTMLAttributes<HTMLDivElement>> = ({
  tagName = 'default-tag',
  items = [],
  className,
  autoCollapse = false,
  ...otherProps
}) => {
  const [menuItems, setMenuItems] = useState<NbMenuItemModel[]>(items);

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  const menuInternalService = useInjection<NbMenuInternalService>(TYPES.NbMenuInternalService);

  menuInternalService.prepareItems(menuItems);

  const addItem$ = useObservable(() =>
    menuInternalService
      .onAddItem()
      .pipe(filter((data: { tag: string; items: NbMenuItemModel[] }) => compareTag(data.tag)))
  );
  useSubscription(addItem$, (data) => onAddItem(data));

  const navigateHome$ = useObservable(() =>
    menuInternalService.onNavigateHome().pipe(filter((data: { tag: string }) => compareTag(data.tag)))
  );
  useSubscription(navigateHome$, () => navigateHome());

  const getSelectedItem$ = useObservable(() =>
    menuInternalService
      .onGetSelectedItem()
      .pipe(filter((data: { tag: string; listener: BehaviorSubject<NbMenuBag | null> }) => compareTag(data.tag)))
  );
  useSubscription(getSelectedItem$, (data: { tag: string; listener: BehaviorSubject<NbMenuBag | null> }) => {
    data.listener.next({ tag: tagName, item: getSelectedItem(items)! });
  });

  const collapseAll$ = useObservable(() =>
    menuInternalService.onCollapseAll().pipe(filter((data: { tag: string }) => compareTag(data.tag)))
  );
  useSubscription(collapseAll$, () => collapseAll());

  const compareTag = (tag: string) => {
    return !tag || tag === tagName;
  };

  const location = useLocation();

  useEffect(() => {
    menuInternalService.selectFromUrl(menuItems, tagName, getWindow().location.pathname, autoCollapse);
  }, [location]);

  useEffect(() => {
    menuInternalService.selectFromUrl(items, tagName, getWindow().location.pathname, autoCollapse);
  }, [items, tagName, getWindow().location.pathname, autoCollapse]);

  const onAddItem = (data: { tag: string; items: NbMenuItemModel[] }) => {
    const newMenuItems = [...menuItems, ...data.items];
    setMenuItems(newMenuItems);

    menuInternalService.prepareItems(newMenuItems);
    menuInternalService.selectFromUrl(newMenuItems, tagName, getWindow().location.pathname, autoCollapse);
  };

  const handleItemHover = (item: NbMenuItemModel) => {
    menuInternalService.itemHover(item, tagName);
  };

  // #region events
  const handleSubMenuToggle = (item: NbMenuItemModel) => {
    if (autoCollapse) {
      menuInternalService.collapseAll(menuItems, tagName, item);
    }
    menuInternalService.submenuToggle(item, tagName);
  };

  const handleItemSelect = (item: NbMenuItemModel) => {
    menuInternalService.selectItem(item, menuItems, autoCollapse, tagName);
  };

  const handleItemClick = (item: NbMenuItemModel) => {
    menuInternalService.itemClick(item, tagName);
  };
  // #endregion

  const navigateHome = () => {
    const homeItem = getHomeItem(menuItems);

    if (homeItem) {
      if (homeItem.link) {
        getWindow().location.href = homeItem.link;
      }
    }
  };

  const collapseAll = () => {
    menuInternalService.collapseAll(menuItems, tagName);
  };

  const getHomeItem = (items: NbMenuItemModel[]): NbMenuItemModel | undefined => {
    for (const item of items) {
      if (item.home) {
        return item;
      }

      const homeItem = item.children && getHomeItem(item.children);
      if (homeItem) {
        return homeItem;
      }
    }

    return undefined;
  };

  const getSelectedItem = (items: NbMenuItemModel[]): NbMenuItemModel | null => {
    let selected = null;
    items.forEach((item: NbMenuItemModel) => {
      if (item.selected) {
        selected = item;
      }
      if (item.selected && item.children && item.children.length > 0) {
        selected = getSelectedItem(item.children);
      }
    });
    return selected;
  };

  return (
    <div className={classNames('nb-menu', className)} {...otherProps}>
      <ul className="menu-items">
        {menuItems
          .filter((i) => !i.hidden)
          .map((i) => {
            return (
              <NbMenuItem
                key={i.title}
                menuItem={i}
                className={classNames({
                  'menu-group': i.group
                })}
                onItemHover={handleItemHover}
                onSubMenuToggle={handleSubMenuToggle}
                onItemSelect={handleItemSelect}
                onItemClick={handleItemClick}
              ></NbMenuItem>
            );
          })}
      </ul>
    </div>
  );
};

export { NbMenu };
