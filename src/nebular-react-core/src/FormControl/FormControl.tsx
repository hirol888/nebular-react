import React, { forwardRef } from 'react';
import {
  DefaultProps,
  Selectors,
  createStyles,
  useComponentDefaultProps
} from '@nebular-react/styles';

export type FormControlSize = 'small' | 'medium' | 'large';
export type FormControlOrientation = 'vertical' | 'horizontal';

export interface FormControlStylesParams {
  orientation: FormControlOrientation;
  size: FormControlSize;
}

const useStyles = createStyles((_theme, { orientation, size }: FormControlStylesParams) => ({
  root: {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    alignItems: orientation === 'horizontal' ? 'center' : 'stretch',
    gap: `var(--form-control-${size}-gap, 0.375rem)`,
    width: '100%',
    fontFamily: 'var(--form-control-text-font-family, inherit)'
  },

  label: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    flex: orientation === 'horizontal' ? '0 0 auto' : '0 1 auto',
    color: 'var(--form-control-label-color, var(--text-basic-color, #222b45))',
    fontSize: `var(--form-control-${size}-label-font-size, 0.8125rem)`,
    fontWeight: 'var(--form-control-label-font-weight, 600)' as any,
    lineHeight: 'var(--form-control-label-line-height, 1.4)'
  },

  required: {
    color: 'var(--form-control-required-color, var(--color-danger-500, #ff3d71))'
  },

  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--form-control-body-gap, 0.25rem)',
    flex: '1 1 auto',
    minWidth: 0
  },

  description: {
    color: 'var(--form-control-description-color, var(--text-hint-color, #8f9bb3))',
    fontSize: `var(--form-control-${size}-description-font-size, 0.75rem)`,
    fontFamily: 'var(--form-control-text-font-family, inherit)',
    lineHeight: 'var(--form-control-description-line-height, 1.4)'
  },

  error: {
    color: 'var(--form-control-error-color, var(--color-danger-500, #ff3d71))',
    fontSize: `var(--form-control-${size}-error-font-size, 0.75rem)`,
    fontFamily: 'var(--form-control-text-font-family, inherit)',
    lineHeight: 'var(--form-control-error-line-height, 1.4)'
  }
}));

export type FormControlStylesNames = Selectors<typeof useStyles>;

export interface FormControlProps
  extends
    DefaultProps<FormControlStylesNames, FormControlStylesParams>,
    Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  orientation?: FormControlOrientation;
  size?: FormControlSize;
}

const defaultProps: Partial<FormControlProps> = {
  orientation: 'vertical',
  size: 'medium',
  required: false,
  withAsterisk: false
};

const _FormControl = forwardRef<HTMLDivElement, FormControlProps>((props, ref) => {
  const {
    label,
    description,
    error,
    required,
    withAsterisk,
    children,
    htmlFor,
    orientation,
    size,
    className,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { orientation, size },
    { name: 'form-control', classNames, styles, unstyled }
  );

  const withRequiredMark = required || withAsterisk;

  return (
    <div
      {...others}
      ref={ref}
      className={cx(classes.root, className)}
      data-orientation={orientation}
      data-size={size}
      data-required={required || undefined}
    >
      {label && (
        <label className={cx(classes.label)} htmlFor={htmlFor}>
          {label}
          {withRequiredMark && (
            <span className={cx(classes.required)} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={cx(classes.body)}>
        {children}
        {description && <div className={cx(classes.description)}>{description}</div>}
        {error && (
          <div role="alert" className={cx(classes.error)}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
});

_FormControl.displayName = 'FormControl';

export { _FormControl as FormControl };
