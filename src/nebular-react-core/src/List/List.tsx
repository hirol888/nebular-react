import { createPolymorphicComponent, ForwardRefWithStaticComponents } from '@mantine/utils';
import React, { forwardRef } from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import useStyles from './List.style';
import { ListItem } from './ListItem/ListItem';

export type ListStylesNames = Selectors<typeof useStyles>;

export interface ListProps
  extends DefaultProps<ListStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

type ListComponent = ForwardRefWithStaticComponents<ListProps, { Item: typeof ListItem }>;

const _List: ListComponent = forwardRef<HTMLDivElement, ListProps>(
  ({ children, className, unstyled, classNames, styles, ...others }, ref) => {
    const { classes, cx } = useStyles(null, { name: 'list', unstyled, classNames, styles });

    return (
      <div className={cx(classes.root, className)} role="list" ref={ref} {...others}>
        {children}
      </div>
    );
  }
) as any;

_List.displayName = '@nebular-react/core/List';
_List.Item = ListItem;

export const List = createPolymorphicComponent<
  'div',
  React.ComponentPropsWithoutRef<'div'>,
  { Item: typeof ListItem }
>(_List);
