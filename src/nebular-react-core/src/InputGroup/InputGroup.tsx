import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export interface InputGroupStylesParams {
  orientation: 'horizontal' | 'vertical';
  disabled: boolean;
}

const useStyles = createStyles((_theme, { orientation, disabled }: InputGroupStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'stretch',
    width: '100%',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1
  },

  addon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--input-group-addon-padding, 0 0.75rem)',
    border: '1px solid var(--input-group-addon-border-color, var(--border-basic-color-3, #e4e9f2))',
    backgroundColor:
      'var(--input-group-addon-background-color, var(--background-basic-color-2, #f7f9fc))',
    color: 'var(--input-group-addon-text-color, var(--text-hint-color, #8f9bb3))',
    fontSize: 'var(--input-group-addon-font-size, 0.8125rem)',
    fontWeight: 'var(--input-group-addon-font-weight, 400)',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
  },

  before: {
    borderRightWidth: 0,
    borderRadius: 'var(--input-group-border-radius, 0.25rem) 0 0 0.25rem'
  },

  after: {
    borderLeftWidth: 0,
    borderRadius:
      '0 var(--input-group-border-radius, 0.25rem) var(--input-group-border-radius, 0.25rem) 0'
  },

  beforeVertical: {
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderRadius:
      'var(--input-group-border-radius, 0.25rem) var(--input-group-border-radius, 0.25rem) 0 0'
  },

  afterVertical: {
    borderLeftWidth: 1,
    borderTopWidth: 0,
    borderRadius:
      '0 0 var(--input-group-border-radius, 0.25rem) var(--input-group-border-radius, 0.25rem)'
  },

  content: {
    display: 'flex',
    flex: '1 1 auto',
    minWidth: 0,
    alignItems: 'stretch',

    '> *': {
      flex: '1 1 auto',
      minWidth: 0
    }
  }
}));

export type InputGroupStylesNames = Selectors<typeof useStyles>;

export interface InputGroupProps
  extends
    DefaultProps<InputGroupStylesNames, InputGroupStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const defaultProps: Partial<InputGroupProps> = {
  disabled: false,
  orientation: 'horizontal'
};

const _InputGroup = forwardRef<HTMLDivElement, InputGroupProps>((props, ref) => {
  const {
    before,
    after,
    children,
    disabled,
    orientation,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation, disabled },
    { name: 'input-group', classNames, styles, unstyled }
  );
  const vertical = orientation === 'vertical';

  return (
    <div
      {...others}
      ref={ref}
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      className={cx(classes.root, className)}
    >
      {before && (
        <div className={cx(classes.addon, vertical ? classes.beforeVertical : classes.before)}>
          {before}
        </div>
      )}

      <div className={cx(classes.content)}>{children}</div>

      {after && (
        <div className={cx(classes.addon, vertical ? classes.afterVertical : classes.after)}>
          {after}
        </div>
      )}
    </div>
  );
});

_InputGroup.displayName = 'InputGroup';

export { _InputGroup as InputGroup };
