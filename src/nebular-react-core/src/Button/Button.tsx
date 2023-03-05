import {
  ButtonAppearance,
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps
} from '@nebular-react/styles';
import React, { useEffect, useState } from 'react';
import { createPolymorphicComponent } from '@mantine/utils';
import useStyles, { ButtonStylesParams } from './Button.style';

export type ButtonStylesNames = Selectors<typeof useStyles>;

export interface BaseButtonProps {
  size?: ComponentSize;
  status?: ComponentOrCustomStatus;
  shape?: ComponentShape;
  appearance?: ButtonAppearance;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  tabIndex?: number;
  children?: React.ReactNode;
  wrapperClassName?: string;
}

export interface ButtonProps
  extends DefaultProps<ButtonStylesNames, ButtonStylesParams>,
    BaseButtonProps,
    React.ComponentPropsWithoutRef<'button'> {}

const defaultProps: Partial<ButtonProps> = {
  size: 'medium',
  status: 'basic',
  shape: 'rectangle',
  appearance: 'filled',
  fullWidth: false,
  disabled: false
};

const _Button = React.forwardRef<HTMLButtonElement, ButtonProps & { component: any }>(
  (props, ref) => {
    const {
      className,
      size,
      status,
      shape,
      appearance,
      prefixIcon,
      suffixIcon,
      fullWidth,
      disabled,
      tabIndex,
      wrapperClassName,
      classNames,
      styles,
      unstyled,
      children,
      ...others
    } = useComponentDefaultProps(defaultProps, props);

    const Element = props.component || 'button';
    const { classes, cx } = useStyles(
      {
        size,
        withPrefixIcon: !!prefixIcon,
        withSuffixIcon: !!suffixIcon,
        iconOnly: !children && (!!prefixIcon || !!suffixIcon),
        appearance,
        shape,
        status
      },
      { name: 'button', unstyled, classNames, styles }
    );

    const [tabIndexValue, setTabIndexValue] = useState<number>(tabIndex ?? 0);
    useEffect(() => {
      if (disabled) setTabIndexValue(-1);
      else setTabIndexValue(tabIndex ?? 0);
    }, [disabled]);

    const handleFocus = (event: any) => {
      if (disabled) {
        event.preventDefault();
        event.stopProgagation();
      }
    };

    return (
      <div
        className={cx(classes.wrapper, wrapperClassName, {
          [classes.fullWidth]: fullWidth,
          [classes.wrapperDisabled]: disabled
        })}
      >
        <Element
          className={cx(classes.root, className, size, shape, appearance, status, {
            [classes.fullWidth]: fullWidth,
            [classes.disabled]: disabled
          })}
          disabled={disabled}
          aria-disabled={disabled}
          tabIndex={tabIndexValue}
          ref={ref}
          onFocus={handleFocus}
          {...others}
        >
          {prefixIcon && <>{prefixIcon}</>}
          {children}
          {suffixIcon && <>{suffixIcon}</>}
        </Element>
      </div>
    );
  }
);

_Button.displayName = '@nebular-react/core/Button';

export const Button = createPolymorphicComponent<'button', ButtonProps>(_Button);
