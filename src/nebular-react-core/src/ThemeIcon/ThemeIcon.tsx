import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type ThemeIconVariant = 'filled' | 'light' | 'outline';
export type ThemeIconSize = 'sm' | 'md' | 'lg' | number;
export type ThemeIconRadius = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ThemeIconStylesParams {
  size: ThemeIconSize;
  radius: ThemeIconRadius;
  variant: ThemeIconVariant;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  basic: '#8f9bb3',
  primary: '#3366ff',
  success: '#00d68f',
  info: '#0095ff',
  warning: '#ffaa00',
  danger: '#ff3d71',
  control: '#8f9bb3'
};

const toCssSize = (size: ThemeIconSize): string => {
  if (typeof size === 'number') {
    return `${size}px`;
  }

  return size === 'sm' ? '1.5rem' : size === 'lg' ? '2.75rem' : '2rem';
};

const toCssRadius = (radius: ThemeIconRadius): string => {
  if (typeof radius === 'number') {
    return `${radius}px`;
  }

  const values: Record<string, string> = {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  };
  return values[radius] ?? values.md;
};

const getStatusColor = (status: ComponentOrCustomStatus): string =>
  STATUS_COLORS[status] ?? String(status);

const useStyles = createStyles(
  (_theme, { size, radius, variant, color }: ThemeIconStylesParams) => {
    const dimension = toCssSize(size);
    const background =
      variant === 'filled'
        ? color
        : variant === 'light'
          ? `color-mix(in srgb, ${color} 16%, transparent)`
          : 'transparent';

    return {
      root: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dimension,
        height: dimension,
        flex: '0 0 auto',
        borderRadius: toCssRadius(radius),
        border: variant === 'outline' ? `1px solid ${color}` : '1px solid transparent',
        backgroundColor: background,
        color: variant === 'filled' ? 'var(--theme-icon-filled-color, #fff)' : color,
        fontSize: `calc(${dimension} * 0.55)`,
        lineHeight: 1,
        overflow: 'hidden',
        boxSizing: 'border-box',

        '& > svg': {
          width: '60%',
          height: '60%'
        }
      }
    };
  }
);

export type ThemeIconStylesNames = Selectors<typeof useStyles>;

export interface ThemeIconProps
  extends
    DefaultProps<ThemeIconStylesNames, ThemeIconStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  children: React.ReactNode;
  size?: ThemeIconSize;
  radius?: ThemeIconRadius;
  variant?: ThemeIconVariant;
  status?: ComponentOrCustomStatus;
  color?: string;
  ariaLabel?: string;
}

const defaultProps: Partial<ThemeIconProps> = {
  size: 'md',
  radius: 'md',
  variant: 'filled',
  status: 'primary'
};

const _ThemeIcon = forwardRef<HTMLSpanElement, ThemeIconProps>((props, ref) => {
  const {
    children,
    size,
    radius,
    variant,
    status,
    color,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const resolvedColor = color ?? getStatusColor(status);
  const { classes, cx } = useStyles(
    { size, radius, variant, color: resolvedColor },
    { name: 'theme-icon', classNames, styles, unstyled }
  );

  if (ariaLabel) {
    return (
      <span
        {...others}
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        data-variant={variant}
        className={cx(classes.root, className)}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      {...others}
      ref={ref}
      aria-hidden="true"
      data-variant={variant}
      className={cx(classes.root, className)}
    >
      {children}
    </span>
  );
});

_ThemeIcon.displayName = 'ThemeIcon';

export { _ThemeIcon as ThemeIcon };
