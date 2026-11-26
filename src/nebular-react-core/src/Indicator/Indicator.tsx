import React, { forwardRef } from 'react';
import {
  CSSObject,
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type IndicatorPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface IndicatorStylesParams {
  position: IndicatorPosition;
  size: number;
  offset: number;
  color?: string;
}

const useStyles = createStyles(
  (_theme, { position, size, offset, color }: IndicatorStylesParams) => {
    const [vertical, horizontal] = position.split('-');
    const verticalStyles: CSSObject = vertical === 'top' ? { top: offset } : { bottom: offset };
    const horizontalStyles: CSSObject =
      horizontal === 'start' ? { insetInlineStart: offset } : { insetInlineEnd: offset };

    return {
      root: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      },

      badge: {
        position: 'absolute',
        zIndex: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        backgroundColor:
          color || 'var(--indicator-background-color, var(--color-danger-500, #ff3d71))',
        color: 'var(--indicator-text-color, #ffffff)',
        fontFamily: 'var(--indicator-text-font-family, inherit)',
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...verticalStyles,
        ...horizontalStyles
      },

      dot: {
        width: size,
        height: size,
        borderRadius: 'var(--indicator-border-radius, 999px)'
      },

      label: {
        height: size + 8,
        minWidth: size + 8,
        padding: `0 ${Math.max(Math.round(size / 2), 4)}px`,
        borderRadius: 'var(--indicator-border-radius, 999px)',
        fontSize: 'var(--indicator-label-font-size, 0.75rem)'
      }
    };
  }
);

export type IndicatorStylesNames = Selectors<typeof useStyles>;

export interface IndicatorProps
  extends
    DefaultProps<IndicatorStylesNames, IndicatorStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  children: React.ReactNode;
  label?: React.ReactNode;
  color?: string;
  position?: IndicatorPosition;
  dot?: boolean;
  size?: number;
  showZero?: boolean;
  offset?: number;
}

const defaultProps: Partial<IndicatorProps> = {
  position: 'top-end',
  dot: false,
  size: 8,
  showZero: false,
  offset: 0
};

const _Indicator = forwardRef<HTMLDivElement, IndicatorProps>((props, ref) => {
  const {
    children,
    label,
    color,
    position,
    dot,
    size,
    showZero,
    offset,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { position, size, offset, color },
    { name: 'indicator', classNames, styles, unstyled }
  );

  const hasLabel = label !== undefined && label !== null;
  const visible = !(label === 0 && !showZero) && (dot || hasLabel);
  const isDecorative = dot && !hasLabel;
  const accessibleLabel =
    typeof label === 'string' || typeof label === 'number' ? String(label) : undefined;

  return (
    <div {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
      {visible && (
        <span
          className={cx(classes.badge, dot ? classes.dot : classes.label)}
          role={isDecorative ? undefined : 'status'}
          aria-label={accessibleLabel}
          aria-hidden={isDecorative || undefined}
        >
          {!dot && label}
        </span>
      )}
    </div>
  );
});

_Indicator.displayName = 'Indicator';

export { _Indicator as Indicator };
