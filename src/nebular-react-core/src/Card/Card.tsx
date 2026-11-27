import React from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  ComponentStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import useStyles, { CardStylesParams } from './Card.style';
import { CardContext } from './Card.context';
import { CardHeader } from './CardHeader/CardHeader';
import { CardBody } from './CardBody/CardBody';
import { CardFooter } from './CardFooter/CardFooter';

export type CardStylesNames = Selectors<typeof useStyles>;

export interface CardProps
  extends DefaultProps<CardStylesNames, CardStylesParams>, React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  accent?: ComponentStatus;
  children?: React.ReactNode;
}

const defaultProps: Partial<CardProps> = {};

type CardStaticComponents = {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const _Card = Object.assign(
  React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
    const { className, size, status, accent, children, classNames, styles, unstyled, ...others } =
      useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(
      { size, accent },
      { name: 'card', unstyled, classNames, styles }
    );
    return (
      <CardContext.Provider value={{ status, accent }}>
        <div className={cx(classes.root, className, size, status, accent)} {...others} ref={ref}>
          {children}
        </div>
      </CardContext.Provider>
    );
  }),
  { Header: CardHeader, Body: CardBody, Footer: CardFooter }
);

_Card.displayName = 'Card';

export const Card = createPolymorphicComponent<'div', CardProps, CardStaticComponents>(_Card);
