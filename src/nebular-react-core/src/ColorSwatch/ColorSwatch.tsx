import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type ColorSwatchRadius = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface ColorSwatchStylesParams {
  size: number | string;
  radius: ColorSwatchRadius;
  withBorder: boolean;
  transparent: boolean;
}

const toCssSize = (size: number | string): string =>
  typeof size === 'number' ? `${size}px` : size;

const toCssRadius = (radius: ColorSwatchRadius): string => {
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

const useStyles = createStyles(
  (_theme, { size, radius, withBorder, transparent }: ColorSwatchStylesParams) => ({
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: toCssSize(size),
      height: toCssSize(size),
      padding: 0,
      border: withBorder
        ? '1px solid var(--color-swatch-border-color, var(--border-basic-color-3, #e4e9f2))'
        : 'none',
      borderRadius: toCssRadius(radius),
      background: transparent
        ? 'repeating-conic-gradient(var(--color-swatch-checker-color, #e4e9f2) 0% 25%, transparent 0% 50%) 50% / 50% 50%'
        : 'var(--color-swatch-color)',
      cursor: 'pointer',
      overflow: 'hidden',
      boxSizing: 'border-box',

      '&:focus-visible': {
        outline: '2px solid var(--color-swatch-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '2px'
      }
    },

    indicator: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '55%',
      height: '55%',
      borderRadius: '50%',
      backgroundColor: 'var(--color-swatch-checked-color, #fff)',
      color: 'var(--color-swatch-checked-mark-color, #222b45)',
      fontSize: '0.625rem',
      lineHeight: 1,
      boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.15)'
    }
  })
);

export type ColorSwatchStylesNames = Selectors<typeof useStyles>;

export interface ColorSwatchProps
  extends
    DefaultProps<ColorSwatchStylesNames, ColorSwatchStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  color: string;
  size?: number | string;
  radius?: ColorSwatchRadius;
  withBorder?: boolean;
  checked?: boolean;
  ariaLabel?: string;
}

const defaultProps: Partial<ColorSwatchProps> = {
  size: 28,
  radius: 'md',
  withBorder: true
};

const isTransparent = (color: string): boolean => {
  const normalized = color.trim().toLowerCase();
  return normalized === 'transparent' || normalized === 'none';
};

const _ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>((props, ref) => {
  const {
    color,
    size,
    radius,
    withBorder,
    checked,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    style,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const transparent = isTransparent(color);
  const { classes, cx } = useStyles(
    { size, radius, withBorder, transparent },
    { name: 'color-swatch', classNames, styles, unstyled }
  );

  return (
    <button
      {...others}
      ref={ref}
      type="button"
      aria-label={ariaLabel ?? color}
      aria-pressed={typeof checked === 'boolean' ? checked : undefined}
      data-checked={checked ? 'true' : undefined}
      data-transparent={transparent ? 'true' : undefined}
      className={cx(classes.root, className)}
      style={{
        ...style,
        ...(transparent ? {} : ({ '--color-swatch-color': color } as React.CSSProperties))
      }}
    >
      {checked && (
        <span className={cx(classes.indicator)} aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
});

_ColorSwatch.displayName = 'ColorSwatch';

export { _ColorSwatch as ColorSwatch };
