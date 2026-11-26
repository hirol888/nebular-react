import React, { forwardRef } from 'react';
import { DefaultProps, Selectors, useComponentDefaultProps } from '@nebular-react/styles';
import useStyles, { EmptyStateStylesParams } from './EmptyState.style';

export type EmptyStateStylesNames = Selectors<typeof useStyles>;

export interface EmptyStateProps
  extends
    DefaultProps<EmptyStateStylesNames, EmptyStateStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}

const defaultProps: Partial<EmptyStateProps> = {
  compact: false
};

const _EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>((props, ref) => {
  const {
    title,
    description,
    icon,
    action,
    compact,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { compact },
    { name: 'empty-state', classNames, styles, unstyled }
  );

  return (
    <div ref={ref} className={cx(classes.root, className)} {...others}>
      {icon && <div className={cx(classes.icon)}>{icon}</div>}
      {title && <h3 className={cx(classes.title)}>{title}</h3>}
      {description && <p className={cx(classes.description)}>{description}</p>}
      {action && <div className={cx(classes.action)}>{action}</div>}
    </div>
  );
});

_EmptyState.displayName = 'EmptyState';

export { _EmptyState as EmptyState };
