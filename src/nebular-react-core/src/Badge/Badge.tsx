import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles, { BadgeStylesParams } from './Badge.style';
import { BadgePosition } from './types';

export type BadgeStylesNames = Selectors<typeof useStyles>;

export interface BaseBadgeProps {
  text?: string;
  status?: ComponentOrCustomStatus;
  dotMode?: boolean;
}

export interface BadgeProps
  extends DefaultProps<BadgeStylesNames, BadgeStylesParams>,
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

const _Badge = forwardRef<HTMLDivElement, BadgeProps & { component: any }>((props, ref) => {
  const { className, text, position, status, dotMode, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position, status },
    { name: 'badge', unstyled, classNames, styles }
  );
  const Element = props.component || 'div';

  const positionClass = () => {
    if (position.includes('top')) {
      return 'position-top';
    }
    if (position.includes('right')) {
      return 'position-right';
    }
    if (position.includes('bottom')) {
      return 'position-bottom';
    }
    if (position.includes('left')) {
      return 'position-left';
    }
    if (position.includes('center')) {
      return 'position-center';
    }
    if (position.includes('start')) {
      return 'position-start';
    }
    if (position.includes('end')) {
      return 'position-end';
    }
  };

  return (
    <Element
      className={cx(classes.root, className, status, positionClass, { [classes.dotMode]: dotMode })}
      ref={ref}
      {...others}
    >
      {!dotMode && text}
    </Element>
  );
});

_Badge.displayName = '@nebular-react/core/Badge';

export const Badge = createPolymorphicComponent<'div', BadgeProps>(_Badge);
