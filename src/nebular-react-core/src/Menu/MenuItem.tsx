import { DefaultProps, useNebularDir, Selectors } from '@nebular-react/styles';
import React, { ReactElement, useMemo, useRef } from 'react';
import { easings, useSpring, animated } from '@react-spring/web';
import { useMeasure } from '@nebular-react/hooks';
import { createPolymorphicComponent } from '@mantine/utils';
import { Icon } from '../Icon';
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
    const previousExpanded = useRef<boolean>(isExpanded);

    const dir = useNebularDir();
    const expandedStateIcon = useMemo(
      () => (dir === 'ltr' ? 'chevron-left-outline' : 'chevron-right-outline'),
      [dir]
    );

    const Element = props.component || 'a';

    const [ulMeasureRef, { height }] = useMeasure<HTMLUListElement>();

    const shouldAnimate = useRef<boolean>(false);
    if (isExpanded !== previousExpanded.current) {
      shouldAnimate.current = true;
    }
    previousExpanded.current = isExpanded;

    const openAnimation = useSpring({
      height: isExpanded ? `${height}px` : '0px',
      overflow: 'hidden',
      config: { duration: 300, easing: easings.easeOutExpo }
    });

    const itemIcon = icon
      ? React.cloneElement(icon as ReactElement, {
          ...(icon as ReactElement).props,
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
            <animated.div
              style={shouldAnimate.current || !isItemExpanded(id) ? openAnimation : undefined}
            >
              <ul
                ref={ulMeasureRef}
                className={cx(classes.menuItems, {
                  collapsed: !(children && isItemExpanded(id)),
                  expanded: isItemExpanded(id)
                })}
              >
                {children}
              </ul>
            </animated.div>
          </>
        )}
        {hasChildren && !!group && (
          <>
            <div className={cx(classes.menuGroup)}>
              {itemIcon}
              {title}
            </div>
            <ul
              ref={ulMeasureRef}
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

_MenuItem.displayName = '@nebular-react/core/MenuItem';

export const MenuItem = createPolymorphicComponent<'a', MenuItemProps>(_MenuItem);
