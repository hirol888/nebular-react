import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps,
  useNebularLocale
} from '@nebular-react/styles';

export type WindowStatusBarSize = 'sm' | 'md';

export type WindowStatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export interface WindowStatusItem {
  key?: React.Key;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  value?: React.ReactNode;
  tone?: WindowStatusTone;
  onClick?(event: React.MouseEvent<HTMLElement>): void;
  title?: string;
}

export interface WindowStatusBarProps
  extends
    DefaultProps<WindowStatusBarStylesNames>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  items?: WindowStatusItem[];
  /** Slot rendered before the items, usually readiness or connection state. */
  start?: React.ReactNode;
  /** Centered slot. Content is truncated with an ellipsis when space is tight. */
  center?: React.ReactNode;
  /** Slot rendered at the trailing edge. */
  end?: React.ReactNode;
  /** Free-form slot rendered after the items. */
  children?: React.ReactNode;
  size?: WindowStatusBarSize;
  bordered?: boolean;
  ariaLabel?: string;
}

const useStyles = createStyles(
  (_theme, { size, bordered }: { size: WindowStatusBarSize; bordered: boolean }) => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      gap: 'var(--window-status-bar-gap, 0.5rem)',
      boxSizing: 'border-box',
      minWidth: 0,
      height:
        size === 'md'
          ? 'var(--window-status-bar-height-md, 2rem)'
          : 'var(--window-status-bar-height-sm, 1.6rem)',
      paddingInline: 'var(--window-status-bar-padding-inline, 0.5rem)',
      borderBlockStart: bordered
        ? '1px solid var(--window-status-bar-border-color, var(--border-basic-color-3, #e4e9f2))'
        : undefined,
      background:
        'var(--window-status-bar-background-color, var(--background-basic-color-1, #ffffff))',
      color: 'var(--window-status-bar-text-color, var(--text-hint-color, #8f9bb3))',
      fontFamily: 'var(--window-status-bar-font-family, inherit)',
      fontSize:
        size === 'md'
          ? 'var(--window-status-bar-font-size-md, 0.78rem)'
          : 'var(--window-status-bar-font-size-sm, 0.72rem)',
      lineHeight: 1.2,
      whiteSpace: 'nowrap',
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollbarWidth: 'thin'
    },

    start: {
      display: 'inline-flex',
      alignItems: 'center',
      flex: '0 0 auto',
      gap: 'var(--window-status-bar-slot-gap, 0.375rem)',
      minWidth: 0
    },

    content: {
      display: 'inline-flex',
      alignItems: 'center',
      flex: '0 1 auto',
      gap: 'var(--window-status-bar-items-gap, 0.75rem)',
      minWidth: 0
    },

    center: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 1 0',
      gap: 'var(--window-status-bar-slot-gap, 0.375rem)',
      minWidth: 0,
      overflow: 'hidden'
    },

    centerText: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    end: {
      display: 'inline-flex',
      alignItems: 'center',
      flex: '0 0 auto',
      gap: 'var(--window-status-bar-slot-gap, 0.375rem)',
      minWidth: 0,
      marginInlineStart: 'auto'
    },

    item: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--window-status-bar-item-gap, 0.3rem)',
      boxSizing: 'border-box',
      minWidth: 0,
      maxWidth: 'var(--window-status-bar-item-max-width, 22rem)',
      margin: 0,
      padding: 0,
      border: 0,
      borderRadius: 'var(--window-status-bar-item-radius, 0.2rem)',
      background: 'transparent',
      color: 'var(--window-status-bar-item-color, var(--text-hint-color, #8f9bb3))',
      font: 'inherit',
      lineHeight: 'inherit',
      textAlign: 'start',
      textDecoration: 'none'
    },

    itemButton: {
      padding: '0.1rem 0.25rem',
      marginInline: '-0.1rem',
      cursor: 'pointer',
      transition: 'background-color 120ms ease',

      '&:hover': {
        background:
          'var(--window-status-bar-item-hover-background-color, var(--background-basic-color-2, #f7f9fc))'
      },

      '&:focus-visible': {
        outline:
          '2px solid var(--window-status-bar-focus-color, var(--color-primary-500, #3366ff))',
        outlineOffset: '1px'
      },

      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none'
      }
    },

    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto',
      fontSize: 'var(--window-status-bar-icon-size, 1em)',
      lineHeight: 1
    },

    label: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },

    value: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: 'inherit',
      fontWeight: 600
    },

    toneDefault: {},

    toneInfo: {
      color: 'var(--window-status-bar-info-color, var(--color-info-500, #0095ff))'
    },

    toneSuccess: {
      color: 'var(--window-status-bar-success-color, var(--color-success-500, #00d68f))'
    },

    toneWarning: {
      color: 'var(--window-status-bar-warning-color, var(--color-warning-500, #ffaa00))'
    },

    toneDanger: {
      color: 'var(--window-status-bar-danger-color, var(--color-danger-500, #ff3d71))'
    }
  })
);

export type WindowStatusBarStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<WindowStatusBarProps> = {
  size: 'sm',
  bordered: true
};

const toneClasses: Record<WindowStatusTone, WindowStatusBarStylesNames> = {
  default: 'toneDefault',
  info: 'toneInfo',
  success: 'toneSuccess',
  warning: 'toneWarning',
  danger: 'toneDanger'
};

export const WindowStatusBar = forwardRef<HTMLDivElement, WindowStatusBarProps>((props, ref) => {
  const {
    items = [],
    start,
    center,
    end,
    children,
    size,
    bordered,
    ariaLabel,
    className,
    classNames,
    styles,
    unstyled,
    'aria-label': ariaLabelProp,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { size, bordered },
    { name: 'window-status-bar', classNames, styles, unstyled }
  );
  const { t } = useNebularLocale();
  const resolvedAriaLabel = ariaLabel ?? ariaLabelProp ?? t('windowStatusBar.region', 'Status bar');
  const hasContent = items.length > 0 || children != null;

  return (
    <div
      {...others}
      ref={ref}
      role="group"
      aria-label={resolvedAriaLabel}
      data-size={size}
      className={cx(classes.root, className)}
    >
      {start != null && <div className={cx(classes.start)}>{start}</div>}
      {hasContent && (
        <div className={cx(classes.content)}>
          {items.map((item, index) => {
            const tone = item.tone ?? 'default';
            const toneClass = classes[toneClasses[tone]];
            const content = (
              <>
                {item.icon != null && (
                  <span className={cx(classes.icon)} aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.label != null && <span className={cx(classes.label)}>{item.label}</span>}
                {item.value != null && <span className={cx(classes.value)}>{item.value}</span>}
              </>
            );
            const itemClassName = cx(classes.item, toneClass, {
              [classes.itemButton]: Boolean(item.onClick)
            });

            if (item.onClick) {
              return (
                <button
                  key={item.key ?? index}
                  type="button"
                  className={itemClassName}
                  data-tone={tone}
                  title={item.title}
                  onClick={item.onClick}
                >
                  {content}
                </button>
              );
            }

            return (
              <span
                key={item.key ?? index}
                className={itemClassName}
                data-tone={tone}
                title={item.title}
              >
                {content}
              </span>
            );
          })}
          {children}
        </div>
      )}
      {center != null && (
        <div className={cx(classes.center)}>
          <span className={cx(classes.centerText)}>{center}</span>
        </div>
      )}
      {end != null && <div className={cx(classes.end)}>{end}</div>}
    </div>
  );
});

WindowStatusBar.displayName = 'WindowStatusBar';
