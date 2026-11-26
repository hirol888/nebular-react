import React from 'react';
import {
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import useStyles from './CardFooter.style';

export type CardFooterStylesNames = Selectors<typeof useStyles>;

export interface CardFooterProps
  extends DefaultProps<CardFooterStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  children?: React.ReactNode;
}

const defaultProps: Partial<CardFooterProps> = {};

const _CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
  const { className, children, classNames, styles, unstyled, ...others } = useComponentDefaultProps(
    defaultProps,
    props
  );
  const { classes, cx } = useStyles(null, { name: 'card-footer', unstyled, classNames, styles });
  return (
    <div className={cx(classes.root, className)} {...others} ref={ref}>
      {children}
    </div>
  );
});

_CardFooter.displayName = 'CardFooter';

export const CardFooter = createPolymorphicComponent<'div', CardFooterProps>(_CardFooter);
