import React from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles from './CardBody.style';

export type CardBodyStylesNames = Selectors<typeof useStyles>;

export interface CardBodyProps
  extends DefaultProps<CardBodyStylesNames>,
    React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

const defaultProps: Partial<CardBodyProps> = {};

const _CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>((props, ref) => {
  const { className, children, classNames, styles, unstyled, ...others } = useComponentDefaultProps(
    defaultProps,
    props
  );
  const { classes, cx } = useStyles(null, { name: 'card-body', unstyled, classNames, styles });
  return (
    <div className={cx(classes.root, className)} {...others} ref={ref}>
      {children}
    </div>
  );
});

_CardBody.displayName = '@nebular-react/core/CardBody';

export const CardBody = createPolymorphicComponent<'div', CardBodyProps>(_CardBody);
