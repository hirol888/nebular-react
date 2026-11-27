import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface DividerStylesParams {
  orientation: 'horizontal' | 'vertical';
  labelPosition: 'left' | 'center' | 'right';
  size: number | string;
}

export interface DividerProps
  extends DefaultProps<DividerStylesNames>, React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  label?: React.ReactNode;
  labelPosition?: 'left' | 'center' | 'right';
  size?: number | string;
  color?: string;
}

const defaultProps: Partial<DividerProps> = {
  orientation: 'horizontal',
  labelPosition: 'center',
  size: 1
};

const useStyles = createStyles(
  (theme, { orientation, labelPosition, size }: DividerStylesParams) => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      flex: orientation === 'vertical' ? '0 0 auto' : '1 1 auto',
      alignSelf: 'stretch',
      gap: '0.75rem',
      color: 'var(--divider-text-color, var(--text-hint-color, #8f9bb3))',
      fontSize: 'var(--divider-text-font-size, 0.75rem)',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',

      ...(orientation === 'vertical'
        ? {
            flexDirection: 'column',
            width: size,
            minHeight: '1rem',
            ...theme.fns.ltr({ margin: '0 0.5rem' }),
            ...theme.fns.rtl({ margin: '0 0.5rem' })
          }
        : {
            width: '100%',
            ...theme.fns.ltr({ margin: '0.75rem 0' }),
            ...theme.fns.rtl({ margin: '0.75rem 0' })
          }),

      '& > span:first-of-type': {
        flex: labelPosition === 'left' ? '0 0 1.5rem' : '1 1 auto'
      },

      '& > span:last-of-type': {
        flex: labelPosition === 'right' ? '0 0 1.5rem' : '1 1 auto'
      }
    },

    line: {
      flex: '1 1 auto',
      backgroundColor: 'var(--divider-color, var(--border-basic-color-3, #e4e9f2))',
      ...(orientation === 'vertical' ? { width: size, flexGrow: 1 } : { height: size })
    },

    label: {
      flex: '0 0 auto',
      whiteSpace: 'nowrap'
    },

    labelStart: {
      order: -1,
      flex: '0 0 auto'
    },

    labelEnd: {
      order: 2,
      flex: '0 0 auto'
    },

    noLabel: {
      '& $line': {
        flex: '1 1 auto'
      }
    }
  })
);

export type DividerStylesNames = Selectors<typeof useStyles>;

const _Divider = forwardRef<HTMLDivElement, DividerProps>((props, ref) => {
  const {
    orientation,
    label,
    labelPosition,
    size,
    color,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation, labelPosition, size },
    { name: 'divider', classNames, styles, unstyled }
  );

  return (
    <div
      {...others}
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cx(classes.root, className, { [classes.noLabel]: !label })}
    >
      <span className={cx(classes.line)} style={color ? { backgroundColor: color } : undefined} />
      {label && <span className={cx(classes.label)}>{label}</span>}
      <span className={cx(classes.line)} style={color ? { backgroundColor: color } : undefined} />
    </div>
  );
});

_Divider.displayName = 'Divider';

export { _Divider as Divider };
