import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import useStyles, { BadgeStylesParams } from './Badge.style';
import { BadgePosition } from './types';

export type BadgeStylesNames = Selectors<typeof useStyles>;

export interface BaseBadgeProps {
  text?: string;
  status?: ComponentOrCustomStatus;
  dotMode?: boolean;
}

export interface BadgeProps
  extends
    DefaultProps<BadgeStylesNames, BadgeStylesParams>,
    BaseBadgeProps,
    React.ComponentPropsWithoutRef<'div'> {
  position?: BadgePosition;
}

const defaultProps: Partial<BadgeProps> = {
  text: '',
  position: 'top right',
  status: 'basic',
  dotMode: false
};

const _Badge = forwardRef<HTMLDivElement, BadgeProps & { component: React.ElementType }>(
  (props, ref) => {
    const { className, text, position, status, dotMode, classNames, styles, unstyled, ...others } =
      useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(
      { position, status },
      { name: 'badge', unstyled, classNames, styles }
    );
    const Element = props.component || 'div';

    const positionClasses = position.split(' ').map((item) => `position-${item}`);

    return (
      <Element
        className={cx(classes.root, className, status, positionClasses, {
          [classes.dotMode]: dotMode
        })}
        ref={ref}
        {...others}
      >
        {!dotMode && text}
      </Element>
    );
  }
);

_Badge.displayName = 'Badge';

export const Badge = createPolymorphicComponent<'div', BadgeProps>(_Badge);
