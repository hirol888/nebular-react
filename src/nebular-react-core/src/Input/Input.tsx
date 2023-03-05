import React, { forwardRef } from 'react';
import {
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import { createPolymorphicComponent } from '@mantine/utils';
import { useFocusWithin, useMergedRef } from '@nebular-react/hooks';
import useStyles, { InputStylesParams } from './Input.style';
import { FormField } from '../Shared';

export type InputStylesNames = Selectors<typeof useStyles>;

export interface BaseInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'size'> {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  shape?: ComponentShape;
  fullWidth?: boolean;
  disabled?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fieldRef?: React.ForwardedRef<HTMLDivElement>;
}

export interface InputProps
  extends DefaultProps<InputStylesNames, InputStylesParams>,
    BaseInputProps {}

const defaultProps: Partial<InputProps> = {
  size: 'medium',
  status: 'basic',
  shape: 'rectangle',
  fullWidth: false,
  disabled: false
};

const _Input = forwardRef<HTMLInputElement, InputProps & { component: any }>((props, ref) => {
  const {
    className,
    size,
    status,
    shape,
    fullWidth,
    disabled,
    prefixIcon,
    suffixIcon,
    placeholder,
    fieldRef,
    classNames,
    styles,
    unstyled,
    ...others
  } = useComponentDefaultProps(defaultProps, props);
  const { classes, cx } = useStyles(
    { status, size, shape, withPrefix: !!prefixIcon, withSuffix: !!suffixIcon },
    { name: 'input', unstyled, classNames, styles }
  );
  const Element = props.component || 'input';

  const { ref: focusRef, focused } = useFocusWithin();

  return (
    <FormField
      size={size}
      status={status}
      fullWidth={fullWidth}
      disabled={disabled}
      prefixIcon={prefixIcon}
      suffixIcon={suffixIcon}
      fieldFocused={focused}
      ref={fieldRef}
      className={cx(className, size, status)}
    >
      <Element
        className={cx(classes.root, {
          [classes.fullWidth]: fullWidth
        })}
        disabled={disabled}
        placeholder={placeholder}
        ref={useMergedRef(ref, focusRef)}
        {...others}
      />
    </FormField>
  );
});

_Input.displayName = '@nebular-react/core/Input';

export const Input = createPolymorphicComponent<'input', InputProps>(_Input);
