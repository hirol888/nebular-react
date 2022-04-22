import classNames from 'classnames';
import { NbLayoutDirectionService } from 'libs/nebular-react/src/core/services';
import { TYPES } from 'libs/nebular-react/src/ioc-types';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { filter, map } from 'rxjs';
import { NbBadge } from '../badge';
import { NbIcon } from '../icon';
import { NbMenuBag, NbMenuItemModel, NbMenuService } from './menu.service';
import * as _ from 'lodash';
import { NbLayoutDirection } from 'libs/nebular-react/src/core/cdk';
import { useObservable, useSubscription } from 'observable-hooks';
import { useInjection } from 'libs/nebular-react/src/ioc-provider';

export enum NbToggleStates {
  Expanded = 'expanded',
  Collapsed = 'collapsed'
}

interface MenuItemProps {
  menuItem: NbMenuItemModel;
  onSubMenuToggle?: (item: NbMenuItemModel) => void;
  onItemHover?: (item: NbMenuItemModel) => void;
  onItemSelect?: (item: NbMenuItemModel) => void;
  onItemClick?: (item: NbMenuItemModel) => void;
}

const NbMenuItem: React.FC<MenuItemProps & React.HTMLAttributes<HTMLLIElement>> = ({
  menuItem,
  className,
  onSubMenuToggle,
  onItemHover,
  onItemSelect,
  onItemClick,
  ...otherProps
}) => {
  const [toggleState, setToggleState] = useState<NbToggleStates>();

  const layoutDirection = useInjection<NbLayoutDirectionService>(TYPES.NbLayoutDirectionService);
  const menuService = useInjection<NbMenuService>(TYPES.NbMenuService);

  const getExpandStateIcon = (dir: NbLayoutDirection) => {
    if (menuItem.expanded) {
      return 'chevron-down-outline';
    }

    return dir === NbLayoutDirection.LTR ? 'chevron-left-outline' : 'chevron-right-outline';
  };

  const [expandStateIcon, setExpandStateIcon] = useState<string>(getExpandStateIcon(layoutDirection.getDirection()));

  const submenuToggle$ = useObservable(() =>
    menuService.onSubmenuToggle().pipe(
      filter(({ item }) => _.isEqual(item, menuItem)),
      map(({ item }: NbMenuBag) => item.expanded)
    )
  );
  useSubscription(submenuToggle$, (isExpanded) =>
    isExpanded ? setToggleState(NbToggleStates.Expanded) : setToggleState(NbToggleStates.Collapsed)
  );

  const direction$ = useObservable(() => layoutDirection.onDirectionChange());
  useSubscription(direction$, (dir) => setExpandStateIcon(getExpandStateIcon(dir)));

  const MenuGroup = () => {
    return (
      <>
        {menuItem.group && (
          <span>
            {menuItem.icon && <NbIcon className="menu-icon" config={menuItem.icon}></NbIcon>}
            {menuItem.title}
          </span>
        )}
      </>
    );
  };

  const MenuLink = () => {
    return (
      <>
        {menuItem.link && !menuItem.url && !menuItem.children && !menuItem.group && (
          <Link
            to={menuItem.link}
            target={menuItem.target}
            title={menuItem.title}
            className={classNames({
              active: menuItem.selected
            })}
            onClick={onItemClick ? () => onItemClick(menuItem) : () => ({})}
            onMouseEnter={onItemHover ? () => onItemHover(menuItem) : () => ({})}
          >
            {menuItem.icon && <NbIcon className="menu-icon" config={menuItem.icon}></NbIcon>}
            <span className="menu-title">{menuItem.title}</span>
            {menuItem.badge && (
              <NbBadge
                text={menuItem.badge.text}
                dotMode={menuItem.badge.dotMode}
                status={menuItem.badge.status}
              ></NbBadge>
            )}
          </Link>
        )}
      </>
    );
  };

  const MenuUrl = () => {
    return (
      <>
        {menuItem.url && !menuItem.children && !menuItem.link && !menuItem.group && (
          <a
            href={menuItem.url}
            target={menuItem.target}
            title={menuItem.title}
            className={classNames({
              active: menuItem.selected
            })}
            onClick={onItemClick ? () => onItemClick(menuItem) : () => ({})}
            onMouseEnter={onItemHover ? () => onItemHover(menuItem) : () => ({})}
          >
            {menuItem.icon && <NbIcon className="menu-icon" config={menuItem.icon}></NbIcon>}
            <span className="menu-title">{menuItem.title}</span>
            {menuItem.badge && (
              <NbBadge
                text={menuItem.badge.text}
                dotMode={menuItem.badge.dotMode}
                status={menuItem.badge.status}
              ></NbBadge>
            )}
          </a>
        )}
      </>
    );
  };

  const MenuClick = () => {
    return (
      <>
        {!menuItem.children && !menuItem.link && !menuItem.url && !menuItem.group && (
          <a
            target={menuItem.target}
            title={menuItem.title}
            className={classNames({
              active: menuItem.selected
            })}
            onClick={
              onItemClick
                ? (e) => {
                    e.preventDefault();
                    onItemClick(menuItem);
                  }
                : (e) => {
                    e.preventDefault();
                  }
            }
            onMouseEnter={onItemHover ? () => onItemHover(menuItem) : () => ({})}
          >
            {menuItem.icon && <NbIcon className="menu-icon" config={menuItem.icon}></NbIcon>}
            <span className="menu-title">{menuItem.title}</span>
            {menuItem.badge && (
              <NbBadge
                text={menuItem.badge.text}
                dotMode={menuItem.badge.dotMode}
                status={menuItem.badge.status}
              ></NbBadge>
            )}
          </a>
        )}
      </>
    );
  };

  const MenuChildrenIcon = () => {
    return (
      <>
        {menuItem.children && (
          <a
            href="#"
            target={menuItem.target}
            title={menuItem.title}
            className={classNames({
              active: menuItem.selected
            })}
            onClick={
              onSubMenuToggle
                ? (e) => {
                    e.preventDefault();
                    setToggleState(menuItem.expanded ? NbToggleStates.Collapsed : NbToggleStates.Expanded);
                    onSubMenuToggle(menuItem);
                  }
                : (e) => {
                    e.preventDefault();
                  }
            }
            onMouseEnter={onItemHover ? () => onItemHover(menuItem) : () => ({})}
          >
            {menuItem.icon && <NbIcon className="menu-icon" config={menuItem.icon}></NbIcon>}
            <span className="menu-title">{menuItem.title}</span>
            {menuItem.badge && (
              <NbBadge
                text={menuItem.badge.text}
                dotMode={menuItem.badge.dotMode}
                status={menuItem.badge.status}
              ></NbBadge>
            )}
            <NbIcon className="expand-state" icon={expandStateIcon} pack="nebular-essentials"></NbIcon>
          </a>
        )}
      </>
    );
  };

  const MenuChildren = () => {
    return (
      <>
        {menuItem.children && (
          <ul
            className={classNames({
              collapsed: !(menuItem.children && toggleState === NbToggleStates.Expanded),
              expanded: toggleState === NbToggleStates.Expanded,
              'menu-items': true
            })}
          >
            {menuItem.children
              .filter((c) => !c.hidden)
              .map((c) => {
                return (
                  <NbMenuItem
                    key={c.title}
                    menuItem={c}
                    className={classNames({
                      'menu-group': c.group
                    })}
                    onItemHover={onItemHover}
                    onSubMenuToggle={onSubMenuToggle}
                    onItemSelect={onItemSelect}
                    onItemClick={onItemClick}
                  ></NbMenuItem>
                );
              })}
          </ul>
        )}
      </>
    );
  };

  return (
    <li className={classNames('menu-item', 'nb-menu-item', className)} {...otherProps}>
      <MenuGroup />
      <MenuLink />
      <MenuUrl />
      <MenuClick />
      <MenuChildrenIcon />
      <MenuChildren />
    </li>
  );
};

export { NbMenuItem };
