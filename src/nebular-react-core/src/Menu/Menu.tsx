import { DefaultProps, useComponentDefaultProps, Selectors } from '@nebular-react/styles';
import React from 'react';
import { ItemValue, useGroupItems } from '../Shared';
import { MenuContext } from './Menu.context';
import useStyles from './Menu.style';

export type MenuStylesNames = Selectors<typeof useStyles>;

export interface MenuProps<Multiple extends boolean = true>
  extends DefaultProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'> {
  multiple?: boolean;
  initialExpanded?: ItemValue<Multiple>;
  initialSelected?: string;
  children?: React.ReactNode;
  onExpand?(expandedItems: ItemValue<Multiple>): void;
  onSelect?(selectedItems: string): void;
}

const defaultProps: Partial<MenuProps> = {
  multiple: false
};

function Menu<Multiple extends boolean = true>(props: MenuProps<Multiple>) {
  const {
    multiple,
    initialExpanded,
    initialSelected,
    onExpand,
    onSelect,
    children,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps<MenuProps<Multiple>>(defaultProps as MenuProps<Multiple>, props);
  const { classes, cx } = useStyles(null, { name: 'menu', classNames, styles, unstyled });

  const { isItemActive: isItemExpanded, handleActiveItemChange: handleExpandItemChange } =
    useGroupItems(multiple, onExpand, initialExpanded);
  const { isItemActive: isItemSelected, handleActiveItemChange: handleSelectItemChange } =
    useGroupItems<false>(false, onSelect, initialSelected);

  return (
    <MenuContext.Provider
      value={{
        isItemExpanded,
        handleExpandItemChange,
        isItemSelected,
        handleSelectItemChange
      }}
    >
      <div className={cx(classes.root, className)} {...others}>
        <ul className={cx(classes.menuItems)}>{children}</ul>
      </div>
    </MenuContext.Provider>
  );
}

Menu.displayName = '@nebular-react/core/Menu';

export { Menu };
