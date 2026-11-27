import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type FloatButtonPosition = 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
export type FloatButtonShape = 'circle' | 'square';
export type FloatButtonSize = 'sm' | 'md' | 'lg';

interface FloatButtonStylesParams {
  position: FloatButtonPosition;
  shape: FloatButtonShape;
  size: FloatButtonSize;
}

const OFFSET = 24;

const sizeMap: Record<FloatButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 56
};

const useStyles = createStyles((_theme, { position, shape, size }: FloatButtonStylesParams) => {
  const [vertical, horizontal] = position.split('-');
  const dimension = sizeMap[size];

  return {
    root: {
      position: 'fixed',
      zIndex: 1000,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      minWidth: dimension,
      minHeight: dimension,
      padding: shape === 'circle' ? 0 : '0 1rem',
      border: 'none',
      borderRadius: shape === 'circle' ? '999px' : '12px',
      cursor: 'pointer',
      font: 'inherit',
      textDecoration: 'none',
      backgroundColor: 'var(--float-button-background-color, #ffffff)',
      color: 'var(--float-button-text-color, #222b45)',
      boxShadow: 'var(--float-button-box-shadow, 0 4px 12px rgba(0, 0, 0, 0.18))',
      ...(vertical === 'top' ? { top: OFFSET } : { bottom: OFFSET }),
      ...(horizontal === 'start' ? { insetInlineStart: OFFSET } : { insetInlineEnd: OFFSET })
    },

    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1
    },

    label: {
      whiteSpace: 'nowrap'
    },

    badge: {
      position: 'absolute',
      top: -6,
      insetInlineEnd: -6,
      minWidth: 18,
      height: 18,
      padding: '0 5px',
      borderRadius: '999px',
      backgroundColor: 'var(--float-button-badge-background-color, #ff3d71)',
      color: '#ffffff',
      fontSize: '0.6875rem',
      fontWeight: 600,
      lineHeight: '18px',
      textAlign: 'center'
    }
  };
});

export type FloatButtonStylesNames = Selectors<typeof useStyles>;

export interface FloatButtonProps extends DefaultProps<FloatButtonStylesNames> {
  icon?: React.ReactNode;
  label?: string;
  onClick?(): void;
  href?: string;
  target?: string;
  position?: FloatButtonPosition;
  shape?: FloatButtonShape;
  size?: FloatButtonSize;
  badge?: number | string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const defaultProps: Partial<FloatButtonProps> = {
  position: 'bottom-end',
  shape: 'circle',
  size: 'md'
};

const _FloatButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, FloatButtonProps>(
  (props, ref) => {
    const {
      icon,
      label,
      onClick,
      href,
      target,
      position,
      shape,
      size,
      badge,
      ariaLabel,
      children,
      className,
      style,
      classNames,
      styles,
      unstyled
    } = useComponentDefaultProps(defaultProps, props);
    const { classes, cx } = useStyles(
      { position, shape, size },
      { name: 'float-button', classNames, styles, unstyled }
    );

    const hasVisibleContent = Boolean(label) || (children !== undefined && children !== null);
    const accessibleLabel = ariaLabel ?? (hasVisibleContent ? undefined : 'Floating action');
    const rootClassName = cx(classes.root, className);
    const rootStyle: React.CSSProperties | undefined = label
      ? { paddingInline: '1rem', ...style }
      : style;

    const content = (
      <>
        {badge !== undefined && badge !== null && (
          <span className={cx(classes.badge)} aria-hidden="true">
            {badge}
          </span>
        )}
        {icon && (
          <span className={cx(classes.icon)} aria-hidden="true">
            {icon}
          </span>
        )}
        {label && <span className={cx(classes.label)}>{label}</span>}
        {children}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className={rootClassName}
          style={rootStyle}
          onClick={onClick}
          aria-label={accessibleLabel}
          data-position={position}
          data-shape={shape}
          data-size={size}
          data-float-button
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={rootClassName}
        style={rootStyle}
        onClick={onClick}
        aria-label={accessibleLabel}
        data-position={position}
        data-shape={shape}
        data-size={size}
        data-float-button
      >
        {content}
      </button>
    );
  }
);

_FloatButton.displayName = 'FloatButton';

export { _FloatButton as FloatButton };
