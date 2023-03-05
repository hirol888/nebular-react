import React from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  useComponentDefaultProps,
  Selectors
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { Badge, BadgePosition } from '../Badge';
import useStyles, { UserStylesParams } from './User.styles';

export type UserStylesNames = Selectors<typeof useStyles>;

export interface UserProps
  extends DefaultProps<UserStylesNames, UserStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  name?: string;
  title?: string;
  picture?: string;
  color?: string;
  size?: ComponentSize;
  shape?: ComponentShape;
  showName?: boolean;
  showTitle?: boolean;
  showInitials?: boolean;
  badgeText?: string;
  badgeStatus?: ComponentOrCustomStatus;
  badgePosition?: BadgePosition;
}

const defaultProps: Partial<UserProps> = {
  name: 'Anonymous',
  size: 'medium',
  shape: 'round',
  showName: true,
  showTitle: true,
  showInitials: true,
  badgeStatus: 'basic'
};

const _User = React.forwardRef<HTMLDivElement, UserProps>((props, ref) => {
  const {
    name,
    title,
    picture,
    color,
    size,
    shape,
    showName,
    showTitle,
    showInitials,
    badgeText,
    badgeStatus,
    badgePosition,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, shape },
    { name: 'user', classNames, styles, unstyled }
  );

  const getInitials = () => {
    if (name) {
      const names = name.split(' ');
      return names
        .map((n) => n.charAt(0))
        .splice(0, 2)
        .join('')
        .toUpperCase();
    }

    return '';
  };

  return (
    <div className={cx(classes.root, className, size, shape)} ref={ref} {...others}>
      {picture && (
        <div
          className={cx(classes.userPicture, classes.image)}
          style={{ backgroundImage: `url(${picture})` }}
        >
          {badgeText && <Badge text={badgeText} status={badgeStatus} position={badgePosition} />}
        </div>
      )}
      {!picture && (
        <div
          className={cx(classes.userPicture, classes.initials)}
          style={{ backgroundColor: color }}
        >
          {showInitials && <span>{getInitials()}</span>}
          {badgeText && <Badge text={badgeText} status={badgeStatus} position={badgePosition} />}
        </div>
      )}
      <div className={cx(classes.infoContainer)}>
        {showName && name && <div className={cx(classes.userName)}>{name}</div>}
        {showTitle && title && <div className={cx(classes.userTitle)}>{title}</div>}
      </div>
    </div>
  );
});

_User.displayName = '@nebular-react/core/User';

export const User = createPolymorphicComponent<'div', UserProps>(_User);
