import {
  DefaultProps,
  useNebularDir,
  Selectors,
  createPolymorphicComponent
} from '@nebular-react/styles';
import React, { ReactElement, useMemo } from 'react';
import { Icon } from '../Icon';
import { Collapse } from '../Shared/Collapse/Collapse';
import { useMenuContext } from './Menu.context';
import useStyles from './Menu.style';

export type MenuItemStylesNames = Selectors<typeof useStyles>;

export interface MenuItemProps extends DefaultProps, React.ComponentPropsWithoutRef<'li'> {
  id: string;
  title?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  group?: boolean;
  children?: React.ReactNode;
}

const _MenuItem = React.forwardRef<HTMLLIElement, MenuItemProps & { component: any }>(
  (props, ref) => {
    const {
      id,
      title,
      icon,
      badge,
      group,
      children,
      className,
      classNames,
      styles,
      unstyled,
      ...others
    } = props;
    const { classes, cx } = useStyles(null, { name: 'menu', classNames, styles, unstyled });
    const { isItemExpanded, isItemSelected, handleSelectItemChange, handleExpandItemChange } =
      useMenuContext();
    const isExpanded = isItemExpanded(id);

    const dir = useNebularDir();
    const expandedStateIcon = useMemo(
      () => (dir === 'ltr' ? 'chevron-left-outline' : 'chevron-right-outline'),
      [dir]
    );

    const Element = props.component || 'a';

    const itemIcon = icon
      ? React.cloneElement(icon as ReactElement<{ className?: string }>, {
          className: cx(classes.menuIcon)
        })
      : null;

    const hasLink = Object.keys(others).includes('href') || Object.keys(others).includes('to');
    const hasChildren = React.Children.toArray(children).length > 0;

    return (
      <li className={cx(classes.menuItem, className)} ref={ref}>
        {hasLink && !hasChildren && (
          <Element
            title={title}
            className={cx({ active: isItemSelected(id) })}
            onClick={() => handleSelectItemChange(id)}
            {...others}
          >
            {itemIcon}
            <span className={cx(classes.menuTitle)}>{title}</span>
            {badge && <>{badge}</>}
          </Element>
        )}
        {!hasLink && !hasChildren && (
          <a
            title={title}
            className={cx({ active: isItemSelected(id) })}
            onClick={(event) => {
              event.preventDefault();
              handleSelectItemChange(id);
            }}
          >
            <>{itemIcon}</>
            <span className={cx(classes.menuTitle)}>{title}</span>
            {badge && <>{badge}</>}
          </a>
        )}
        {hasChildren && !group && (
          <>
            <a
              href="#"
              title={title}
              aria-expanded={isExpanded}
              className={cx({ active: isItemSelected(id) })}
              onClick={(event) => {
                event.preventDefault();
                handleExpandItemChange(id);
                handleSelectItemChange(id);
              }}
            >
              <>{itemIcon}</>
              <span className={cx(classes.menuTitle)}>{title}</span>
              {badge && <>{badge}</>}
              <Icon
                className={cx(classes.expansionIndicator, {
                  [classes.expanded]: isItemExpanded(id)
                })}
                icon={expandedStateIcon}
                pack="nebular-essentials"
              />
            </a>
            <Collapse expanded={isExpanded}>
              <ul
                className={cx(classes.menuItems, {
                  collapsed: !(children && isItemExpanded(id)),
                  expanded: isItemExpanded(id)
                })}
              >
                {children}
              </ul>
            </Collapse>
          </>
        )}
        {hasChildren && !!group && (
          <>
            <div className={cx(classes.menuGroup)}>
              {itemIcon}
              {title}
            </div>
            <ul
              className={cx(classes.menuItems, {
                collapsed: !(children && isItemExpanded(id)),
                expanded: isItemExpanded(id)
              })}
            >
              {children}
            </ul>
          </>
        )}
      </li>
    );
  }
);

_MenuItem.displayName = 'MenuItem';

export const MenuItem = createPolymorphicComponent<'a', MenuItemProps>(_MenuItem);
