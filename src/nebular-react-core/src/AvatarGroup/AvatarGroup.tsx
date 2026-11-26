import React, { forwardRef } from 'react';
import {
  ComponentSize,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface AvatarGroupStylesParams {
  size: ComponentSize;
  spacing: number;
}

export interface AvatarGroupProps
  extends
    DefaultProps<AvatarGroupStylesNames, AvatarGroupStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  children: React.ReactNode;
  max?: number;
  total?: number;
  size?: ComponentSize;
  spacing?: number;
  showMore?: boolean;
  renderMore?(count: number): React.ReactNode;
}

const moreFontSizes: Record<ComponentSize, string> = {
  tiny: '0.625rem',
  small: '0.6875rem',
  medium: '0.75rem',
  large: '0.8125rem',
  giant: '0.875rem'
};

const useStyles = createStyles((_theme, { size, spacing }: AvatarGroupStylesParams) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'var(--avatar-group-text-font-family, inherit)'
  },

  item: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginInlineStart: -spacing,
    borderRadius: 'var(--avatar-group-item-border-radius, 999px)',
    boxShadow: '0 0 0 2px var(--avatar-group-ring-color, var(--background-basic-color-1, #ffffff))',

    '&:first-of-type': {
      marginInlineStart: 0
    }
  },

  more: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    height: 'var(--avatar-group-more-size, 2rem)',
    minWidth: 'var(--avatar-group-more-size, 2rem)',
    marginInlineStart: -spacing,
    padding: '0 0.375rem',
    borderRadius: 'var(--avatar-group-item-border-radius, 999px)',
    backgroundColor:
      'var(--avatar-group-more-background-color, var(--background-basic-color-3, #edf1f7))',
    boxShadow: '0 0 0 2px var(--avatar-group-ring-color, var(--background-basic-color-1, #ffffff))',
    color: 'var(--avatar-group-more-text-color, var(--text-basic-color, #222b45))',
    fontFamily: 'inherit',
    fontSize: `var(--avatar-group-${size}-more-font-size, ${moreFontSizes[size]})`,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap'
  }
}));

export type AvatarGroupStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<AvatarGroupProps> = {
  max: 4,
  size: 'medium',
  spacing: 8,
  showMore: true
};

const _AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>((props, ref) => {
  const {
    children,
    max,
    total,
    size,
    spacing,
    showMore,
    renderMore,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, spacing },
    { name: 'avatar-group', classNames, styles, unstyled }
  );

  const items = React.Children.toArray(children);
  const totalCount = typeof total === 'number' ? total : items.length;
  const visibleCount = showMore ? Math.max(Math.min(max, totalCount), 0) : items.length;
  const visibleItems = items.slice(0, visibleCount);
  const hiddenCount = Math.max(totalCount - visibleItems.length, 0);

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={others['aria-label'] ?? 'Avatar group'}
      className={cx(classes.root, className)}
    >
      {visibleItems.map((child, index) => (
        <span key={index} className={cx(classes.item)}>
          {child}
        </span>
      ))}
      {showMore && hiddenCount > 0 && (
        <span className={cx(classes.more)}>
          {renderMore ? renderMore(hiddenCount) : `+${hiddenCount}`}
        </span>
      )}
    </div>
  );
});

_AvatarGroup.displayName = 'AvatarGroup';

export { _AvatarGroup as AvatarGroup };
