import React from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles, { CardHeaderStylesParams } from './CardHeader.style';
import { useCardContext } from '../Card.context';

export type CardHeaderStylesNames = Selectors<typeof useStyles>;

export interface CardHeaderProps
  extends DefaultProps<CardHeaderStylesNames, CardHeaderStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

const defaultProps: Partial<CardHeaderProps> = {};

const _CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
  const { className, children, classNames, styles, unstyled, ...others } = useComponentDefaultProps(
    defaultProps,
    props
  );
  const { status, accent } = useCardContext();
  const { classes, cx } = useStyles(
    { status, hasAccent: !!accent },
    { name: 'card-header', unstyled, classNames, styles }
  );
  return (
    <div className={cx(classes.root, className, status, accent)} {...others} ref={ref}>
      {children}
    </div>
  );
});

_CardHeader.displayName = '@nebular-react/core/CardHeader';

export const CardHeader = createPolymorphicComponent<'div', CardHeaderProps>(_CardHeader);
