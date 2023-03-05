import React from 'react';
import {
  ComponentOrCustomStatus,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import useStyles, { FormFieldStylesParams } from './FormField.style';

export type FormFieldStylesNames = Selectors<typeof useStyles>;

export interface FormFieldProps
  extends DefaultProps<FormFieldStylesNames, FormFieldStylesParams>,
    React.ComponentPropsWithoutRef<'div'> {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  fullWidth?: boolean;
  disabled?: boolean;
  fieldFocused?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const defaultProps: Partial<FormFieldProps> = {
  size: 'medium',
  status: 'basic',
  fullWidth: false,
  disabled: false,
  fieldFocused: false
};

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>((props, ref) => {
  const {
    size,
    status,
    fullWidth,
    disabled,
    fieldFocused,
    prefixIcon,
    suffixIcon,
    className,
    classNames,
    styles,
    unstyled,
    children
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    {
      status,
      size,
      fieldFocused,
      withPrefix: !!prefixIcon,
      withSuffix: !!suffixIcon
    },
    { name: 'form-field', unstyled, classNames, styles }
  );

  return (
    <div
      className={cx(classes.root, className, status, size, {
        [classes.fullWidth]: fullWidth,
        [classes.disabled]: disabled
      })}
    >
      {prefixIcon && <div className={cx(classes.addon)}>{prefixIcon}</div>}
      <div className={cx(classes.container, { [classes.fullWidth]: fullWidth })} ref={ref}>
        {children}
      </div>
      {suffixIcon && <div className={cx(classes.addon)}>{suffixIcon}</div>}
    </div>
  );
});

export { FormField };
