import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type KbdSize = 'small' | 'medium';

export interface KbdStylesParams {
  size: KbdSize;
}

export interface KbdProps
  extends
    DefaultProps<KbdStylesNames, KbdStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'kbd'>, 'children'> {
  children: React.ReactNode;
  size?: KbdSize;
}

const useStyles = createStyles((_theme, { size }: KbdStylesParams) => ({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: size === 'small' ? '1.25rem' : '1.5rem',
    padding: size === 'small' ? '0 0.25rem' : '0.0625rem 0.375rem',
    border: '1px solid var(--kbd-border-color, var(--border-basic-color-3, #e4e9f2))',
    borderBottomWidth: '2px',
    borderRadius: 'var(--kbd-border-radius, 0.25rem)',
    backgroundColor: 'var(--kbd-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--kbd-text-color, var(--text-basic-color, #222b45))',
    fontFamily:
      "var(--kbd-text-font-family, ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace)",
    fontSize: `var(--kbd-${size}-font-size, ${size === 'small' ? '0.6875rem' : '0.75rem'})`,
    fontWeight: 600,
    lineHeight: 1.6,
    whiteSpace: 'nowrap',
    verticalAlign: 'middle'
  }
}));

export type KbdStylesNames = Selectors<typeof useStyles>;

const defaultProps: Partial<KbdProps> = {
  size: 'medium'
};

const _Kbd = forwardRef<HTMLElement, KbdProps>((props, ref) => {
  const { children, size, className, classNames, styles, unstyled, ...others } =
    useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles({ size }, { name: 'kbd', classNames, styles, unstyled });

  return (
    <kbd {...others} ref={ref} className={cx(classes.root, className)}>
      {children}
    </kbd>
  );
});

_Kbd.displayName = 'Kbd';

export { _Kbd as Kbd };
