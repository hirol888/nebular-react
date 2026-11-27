import {
  ButtonAppearance,
  ComponentOrCustomStatus,
  ComponentShape,
  ComponentSize,
  DefaultProps,
  Selectors,
  useComponentDefaultProps,
  createPolymorphicComponent
} from '@nebular-react/styles';
import React, { useEffect, useState } from 'react';
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
  loading?: boolean;
  /** Replaces the button content while `loading` is true. */
  loadingText?: React.ReactNode;
  tabIndex?: number;
  children?: React.ReactNode;
  wrapperClassName?: string;
}

export interface ButtonProps
  extends
    DefaultProps<ButtonStylesNames, ButtonStylesParams>,
    BaseButtonProps,
    React.ComponentPropsWithoutRef<'button'> {}

const defaultProps: Partial<ButtonProps> = {
  size: 'medium',
  status: 'basic',
  shape: 'rectangle',
  appearance: 'filled',
  fullWidth: false,
  disabled: false,
  loading: false
};

const _Button = React.forwardRef<HTMLButtonElement, ButtonProps & { component: React.ElementType }>(
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
      loading,
      loadingText,
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
        iconOnly:
          !children && !(loading && loadingText) && (!!prefixIcon || !!suffixIcon || loading),
        appearance,
        shape,
        status
      },
      { name: 'button', unstyled, classNames, styles }
    );

    const isDisabled = disabled || loading;
    const content = loading && loadingText ? loadingText : children;
    const [tabIndexValue, setTabIndexValue] = useState<number>(tabIndex ?? 0);
    useEffect(() => {
      if (isDisabled) setTabIndexValue(-1);
      else setTabIndexValue(tabIndex ?? 0);
    }, [isDisabled, tabIndex]);

    const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
      if (isDisabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    return (
      <div
        className={cx(classes.wrapper, wrapperClassName, {
          [classes.fullWidth]: fullWidth,
          [classes.wrapperDisabled]: isDisabled
        })}
      >
        <Element
          {...others}
          className={cx(classes.root, className, size, shape, appearance, status, {
            [classes.fullWidth]: fullWidth,
            [classes.disabled]: isDisabled
          })}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading || undefined}
          tabIndex={tabIndexValue}
          ref={ref}
          onFocus={handleFocus}
        >
          {loading ? (
            <span
              className={cx(classes.loader, { [classes.loaderWithText]: !!content })}
              aria-hidden="true"
            />
          ) : (
            prefixIcon && <>{prefixIcon}</>
          )}
          {content}
          {!loading && suffixIcon && <>{suffixIcon}</>}
        </Element>
      </div>
    );
  }
);

_Button.displayName = 'Button';

export const Button = createPolymorphicComponent<'button', ButtonProps>(_Button);
