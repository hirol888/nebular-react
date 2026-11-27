import React, { forwardRef, useState } from 'react';
import { createStyles } from '@nebular-react/styles';
import { Input, InputProps } from '../Input';
import { Icon } from '../Icon';

const useStyles = createStyles(() => ({
  root: {
    position: 'relative',
    display: 'inline-flex',
    width: '100%'
  },

  input: {
    paddingRight: '2.5rem'
  },

  toggle: {
    position: 'absolute',
    top: '50%',
    right: '0.35rem',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.75rem',
    height: '1.75rem',
    padding: 0,
    border: 0,
    borderRadius: '0.25rem',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    zIndex: 1,

    '&:focus-visible': {
      outline: '2px solid var(--color-primary-500, #3366ff)',
      outlineOffset: '2px'
    },

    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.5
    }
  }
}));

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?(visible: boolean): void;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

const _PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const {
    visible,
    defaultVisible = false,
    onVisibleChange,
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
    className,
    style,
    disabled,
    ...others
  } = props;
  const { classes, cx } = useStyles();
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isVisible = visible !== undefined ? visible : internalVisible;

  const toggleVisibility = () => {
    const nextVisible = !isVisible;

    if (visible === undefined) {
      setInternalVisible(nextVisible);
    }

    typeof onVisibleChange === 'function' && onVisibleChange(nextVisible);
  };

  return (
    <div className={cx(classes.root, className)}>
      <Input
        {...others}
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        disabled={disabled}
        className={cx(classes.input)}
        style={style}
      />
      <button
        type="button"
        className={cx(classes.toggle)}
        onClick={toggleVisibility}
        disabled={disabled}
        aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
      >
        <Icon
          icon={isVisible ? 'eye-off-outline' : 'eye-outline'}
          pack="nebular-essentials"
          aria-hidden="true"
        />
      </button>
    </div>
  );
});

_PasswordInput.displayName = 'PasswordInput';

export { _PasswordInput as PasswordInput };
