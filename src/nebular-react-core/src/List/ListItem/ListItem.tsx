import React from 'react';
import { DefaultProps, Selectors } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './ListItem.style';

export type ListItemStylesNames = Selectors<typeof useStyles>;

export interface ListItemProps
  extends DefaultProps<ListItemStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {}

const _ListItem = React.forwardRef<HTMLDivElement, ListItemProps>((props, ref) => {
  const { className, classNames, styles, unstyled, children, ...others } = props;
  const { classes, cx } = useStyles(null, { name: 'list-item', classNames, styles, unstyled });

  return (
    <div className={cx(classes.root, className)} role="listitem" ref={ref} {...others}>
      {children}
    </div>
  );
});

_ListItem.displayName = '@nebular-react/core/ListItem';

export const ListItem = createPolymorphicComponent<'div', ListItemProps>(_ListItem);
